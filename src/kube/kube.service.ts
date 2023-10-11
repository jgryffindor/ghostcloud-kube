import { Injectable, Logger } from "@nestjs/common";
import {
  KubeConfig,
  CoreV1Api,
  NetworkingV1Api,
} from "@kubernetes/client-node";
import { KubeConfigService } from "../config/kube/configuration.service";
import { AppConfigService } from "src/config/app/configuration.service";

export interface Ingress {
  name: string;
  site: string;
}

@Injectable()
export class KubeService {
  private readonly logger = new Logger(KubeService.name);
  private kc: KubeConfig;
  private k8sCoreApi: CoreV1Api;
  private k8sNetworkApi: NetworkingV1Api;

  constructor(
    private kubeConfig: KubeConfigService,
    private appConfig: AppConfigService,
  ) {
    this.kc = new KubeConfig();
    this.logger.debug("KubeService constructor");

    if (kubeConfig.kubeconfig) {
      this.kc.loadFromFile(kubeConfig.kubeconfig);
    } else {
      this.kc.loadFromCluster();
    }

    this.k8sCoreApi = this.kc.makeApiClient(CoreV1Api);
    this.k8sNetworkApi = this.kc.makeApiClient(NetworkingV1Api);
  }

  async getIngresses(namespace: string) {
    const clusterIngresses: Ingress[] = [];

    try {
      // Get a list of all ingress resources in a namespace
      const ingressList = await this.k8sNetworkApi.listNamespacedIngress(
        namespace,
        undefined,
        undefined,
        undefined,
        undefined,
        "app=ingress-gc",
      );

      ingressList.body.items.forEach((ingress) => {
        const name = ingress.metadata?.name;
        const site = ingress.metadata?.labels?.site;

        if (name) {
          clusterIngresses.push({ name, site });
        }
      });
      this.logger.debug(`clusterIngresses: ${clusterIngresses}`);

      return clusterIngresses;
    } catch (error) {
      this.logger.error(`Error listing Ingress resources: ${error}`);

      throw error;
    }
  }

  async getIngress(name: string, namespace: string) {
    let ingress;

    try {
      // Get a list of all ingress resources in a namespace
      ingress = await this.k8sNetworkApi.readNamespacedIngress(name, namespace);
      this.logger.debug(`Single Ingress: ${JSON.stringify(ingress)}`);

      return ingress;
    } catch (error) {
      this.logger.error(`Error listing Ingress resources: ${error}`);

      return error.body.message;
    }
  }

  async createIngress(
    namespace: string,
    sitename: string,
    deploymentUrl: string,
    domain: string,
  ) {
    // Strip https from the deploymentUrl
    deploymentUrl = deploymentUrl.replace(/^https?:\/\//, "");

    // create an ingress resource object
    const ingress = {
      apiVersion: "networking.k8s.io/v1",
      kind: "Ingress",
      metadata: {
        name: `ingress-gc-${this.appConfig.env}-${sitename}`,
        namespace: namespace,
        annotations: {
          "cert-manager.io/cluster-issuer": "letsencrypt-cluster-prod",
          "kubernetes.io/ingress.class": "nginx",
          "nginx.ingress.kubernetes.io/force-ssl-redirect": "true",
          "nginx.ingress.kubernetes.io/upstream-vhost": deploymentUrl,
          "nginx.ingress.kubernetes.io/server-snippet": ` 
              location /.well-known/ {
                proxy_set_header Host "${domain}";
              }`,
        },
        labels: {
          site: sitename,
          app: "ingress-gc",
        },
      },
      spec: {
        rules: [
          {
            host: domain,
            http: {
              paths: [
                {
                  path: "/",
                  pathType: "Prefix",
                  backend: {
                    service: {
                      name: this.kubeConfig.proxyServiceName,
                      port: {
                        name: "http",
                      },
                    },
                  },
                },
              ],
            },
          },
        ],
        tls: [
          {
            hosts: [domain],
            secretName: `${sitename}-tls-secret`,
          },
        ],
      },
    };

    try {
      // Create the ingress resource
      const ingressCreated = await this.k8sNetworkApi.createNamespacedIngress(
        namespace,
        ingress,
      );
      this.logger.debug(`Ingress created: ${JSON.stringify(ingressCreated)}`);

      return ingress;
    } catch (error) {
      this.logger.error(`Error creating Ingress resource: ${error}`);

      return error.body.message;
    }
  }

  async deleteIngress(name: string, namespace: string) {
    try {
      // Delete the ingress resource
      const response = await this.k8sNetworkApi.deleteNamespacedIngress(
        name,
        namespace,
      );
      this.logger.debug(`Ingress deleted: ${JSON.stringify(response)}`);
    } catch (error) {
      this.logger.error(`Error deleting Ingress resource: ${error}`);

      return error.body.message;
    }
  }
}
