import { Injectable, Logger } from "@nestjs/common";
import { KubeConfigService } from "src/config/kube/configuration.service";
import { KubeService } from "src/kube/kube.service";
import { NetworkService } from "src/network/network.service";
import { SitesService } from "src/sites/sites.service";

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
    private site: SitesService,
  ) {}

  async run(n) {
    this.logger.debug(`Updating network ${n}...`);

    let clusterIngresses: ClusterIngress[];
    let networkIngresses: NetworkIngress[];
    let createIngressList: NetworkIngress[];
    let deleteIgressList: ClusterIngress[];
    // Get a list of all ingresses in the cluster.

    try {
      clusterIngresses = await this.kube.getIngresses(this.kc.namespace);
      this.logger.debug(
        `clusterIngresses: ${JSON.stringify(clusterIngresses)}`,
      );
    } catch (error) {
      clusterIngresses = undefined;
      this.logger.error(`Error fetching cluster ingress list ${error}`);
    }

    // Get a list of all ingresses in the network.
    try {
      networkIngresses = await this.network.getIngressList();
      this.logger.debug(
        `networkIngresses: ${JSON.stringify(networkIngresses)}`,
      );
    } catch (error) {
      networkIngresses = undefined;
      this.logger.error(`Error fetching network ingress list: ${error}`);
    }

    // Compare the clusterIngresses to networkIngresses and
    // find ingresses that are not in the cluster.
    if (clusterIngresses) {
      createIngressList = networkIngresses.filter((networkIngress) => {
        return !clusterIngresses.some(
          (clusterIngress) => clusterIngress.site === networkIngress.siteName,
        );
      });

      this.logger.debug(
        `ingresses to create: ${JSON.stringify(createIngressList)}`,
      );
    } else {
      createIngressList = [];
      this.logger.debug("No ingresses to create");
    }

    // Find ingresses that should be deleted
    if (
      networkIngresses &&
      networkIngresses.length > 0 &&
      clusterIngresses !== undefined
    ) {
      deleteIgressList = clusterIngresses.filter((clusterIngress) => {
        return !networkIngresses.some(
          (networkIngress) => networkIngress.siteName === clusterIngress.site,
        );
      });
      this.logger.debug(
        `ingresses to delete: ${JSON.stringify(deleteIgressList)}`,
      );
    } else {
      deleteIgressList = [];
      this.logger.debug("No ingresses to delete");
    }

    // Add ingresses that are not in the cluster.
    if (createIngressList.length > 0) {
      for (const i of createIngressList) {
        this.logger.debug(`Creating ingress ${i}`);
        const sitename = i.siteName;
        const deploymentUrl = i.deploymentUrl;
        const domain = i.domain;

        const hasAddress = await this.site.checkDnsARecord(domain);

        const hasWwwDomain = await this.site.checkDnsCnameRecord(
          `www.${domain}`,
        );
        let wwwDomain: boolean;

        if (hasWwwDomain[0] && hasWwwDomain[1] == domain) {
          this.logger.debug(`DNS CNAME record found for www.${domain}`);
          wwwDomain = true;
        } else {
          this.logger.debug(`No DNS CNAME record found for www.${domain}`);
          wwwDomain = false;
        }

        if (hasAddress[0] && hasAddress[1] == this.kc.ingressIp) {
          try {
            await this.kube.createIngress(
              this.kc.namespace,
              sitename,
              deploymentUrl,
              domain,
              wwwDomain,
            );
          } catch (error) {
            this.logger.error(`Error creating ingress: ${error}`);
          }
        } else {
          this.logger.error(`No DNS A record found for ${domain}`);
        }
      }
    }

    // Delete ingresses that should be deleted
    if (deleteIgressList.length > 0) {
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
}
