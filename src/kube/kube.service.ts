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

  async listIngressResources(namespace: string) {
    const ingressList = { body: "empty" };
    try {
      const ingressList = await this.k8sNetworkApi.listNamespacedIngress(
        namespace,
      );
      console.log("Ingress resources in namespace:", ingressList.body);
      const ingressNames = ingressList.body.items.map(
        (ingress) => ingress.metadata?.name,
      );
      console.log("Ingress names:", ingressNames);
    } catch (error) {
      ingressList.body = error;
      console.error("Error listing Ingress resources:", error);
    }

    // Replace 'your-namespace' with the actual namespace
    return ingressList.body;
  }
}
