import { Injectable, Logger } from "@nestjs/common";
import {
  KubeConfig,
  CoreV1Api,
  NetworkingV1Api,
} from "@kubernetes/client-node";
import { KubeConfigService } from "../config/kube/configuration.service";

@Injectable()
export class KubeService {
  private readonly logger = new Logger(KubeService.name);
  private kc: KubeConfig;
  private k8sCoreApi: CoreV1Api;
  private k8sNetworkApi: NetworkingV1Api;

  constructor(private kubeConfig: KubeConfigService) {
    this.kc = new KubeConfig();
    this.logger.debug("KubeService constructor");

    if (kubeConfig.kubeconfig) {
      this.kc.loadFromFile(kubeConfig.kubeconfig);
    } else {
      this.kc.loadFromCluster();
    }

    this.k8sCoreApi = this.kc.makeApiClient(CoreV1Api);
    this.k8sNetworkApi = this.kc.makeApiClient(NetworkingV1Api);
  };

  // kc.loadFromCluster();

  async getIngressNames(namespace: string) {
    const ingressNames = [];

    try {
      // Get a list of all ingress resources in a namespace
      const ingressList = await this.k8sNetworkApi.listNamespacedIngress(
        namespace,
      );

      ingressList.body.items.forEach((ingress) => {
        const name = ingress.metadata?.name;
        if (name) {
          ingressNames.push(name);
        }
      });
      this.logger.debug(`Ingress names: ${ingressNames}`);
    } catch (error) {
      this.logger.error(`Error listing Ingress resources: ${error}`);
      return error.body.message;
    }

    return ingressNames;
  }

  async getIngress(namespace: string, name: string) {
    // const ingress = { body: "empty" };
    let ingress;

    try {
      // Get a list of all ingress resources in a namespace
      ingress = await this.k8sNetworkApi.readNamespacedIngress(name, namespace);
      this.logger.debug(`Single Ingress: ${ingress}`);
    } catch (error) {
      this.logger.error(`Error listing Ingress resources: ${error}`);
      return error.body.message;
    }

    return ingress;
  }
}
