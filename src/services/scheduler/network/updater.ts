import { Injectable, Logger } from "@nestjs/common";
import cluster from "cluster";
import { KubeConfigService } from "src/config/kube/configuration.service";
import { KubeService } from "src/kube/kube.service";
import { NetworkService } from "src/network/network.service";

interface NetworkIngress {
  siteName: string;
  deploymentUrl: string;
  domain: string;
}

interface ClusterIngress {
  name: string;
  site: string;
}

@Injectable()
export class NetworkUpdater {
  private readonly logger = new Logger(NetworkUpdater.name);

  constructor(
    private kube: KubeService,
    private kc: KubeConfigService,
    private network: NetworkService,
  ) {}

  async run(n) {
    this.logger.debug(`Updating network ${n}...`);

    // Get a list of all ingresses in the cluster.
    const clusterIngresses = await this.kube.getIngresses(this.kc.namespace);
    this.logger.debug(`clusterIngresses: ${JSON.stringify(clusterIngresses)}`);

    // Get a list of all ingresses in the network.
    const networkIngresses = await this.network.getIngressList();
    this.logger.debug(`networkIngresses: ${JSON.stringify(networkIngresses)}`);

    // Compare the clusterIngresses to networkIngresses and
    // find items that are not in the cluster.
    const createIngressList: NetworkIngress[] = networkIngresses.filter(
      (networkIngress) => {
        return !clusterIngresses.some(
          (clusterIngress) => clusterIngress.site === networkIngress.siteName,
        );
      },
    );

    this.logger.debug(
      `ingresses to create: ${JSON.stringify(createIngressList)}`,
    );

    // Delete ingresses that are not in the network.
    const deleteIgressList: ClusterIngress[] = clusterIngresses.filter(
      (clusterIngress) => {
        return !networkIngresses.some(
          (networkIngress) => networkIngress.siteName === clusterIngress.site,
        );
      },
    );

    this.logger.debug(
      `ingresses to delete: ${JSON.stringify(deleteIgressList)}`,
    );

    // Add ingresses that are not in the cluster.
    for (const i of createIngressList) {
      this.logger.debug(`Creating ingress ${i}`);
      const sitename = i.siteName;
      const deploymentUrl = i.deploymentUrl;
      const domain = i.domain;
      try {
        await this.kube.createIngress(
          this.kc.namespace,
          sitename,
          deploymentUrl,
          domain,
        );
      } catch (error) {
        this.logger.error(`Error creating ingress: ${error}`);
      }
    }

    // Delete ingresses that should be deleted
    for (const ingress of deleteIgressList) {
      try {
        const ingressName = ingress.name;
        this.logger.debug(`Deleting ingress ${ingressName}`);
        await this.kube.deleteIngress(ingressName, this.kc.namespace);
      } catch (error) {
        this.logger.error(`Error deleting ingress: ${error}`);
      }
    }
  }
}
