import { Injectable, Logger } from "@nestjs/common";
import {
  Base,
  Events,
  Network,
  Web,
  Address,
  WebListParams,
} from "@liftedinit/many-js";
import { AppConfigService } from "../config/app/configuration.service";

export interface Deployment {
  siteName: string;
  deploymentUrl: string;
  domain: string;
}

@Injectable()
export class NetworkService {
  private network: Network;
  private readonly logger = new Logger(NetworkService.name);

  constructor(private appConfig: AppConfigService) {
    this.network = new Network(this.appConfig.network);
    this.network.apply([Base, Web]);
  }

  async status() {
    const status = await this.network.base.status();
    console.log(JSON.stringify(status));
  }

  async getWebInfo() {
    const info = await this.network.web.info();
    this.logger.debug(JSON.stringify(info));
    return info;
  }

  async getSiteCount() {
    const list = await this.network.web.list({});
    // this.logger.debug(JSON.stringify(list, undefined, 4));
    const totalCount = list.totalCount;
    this.logger.debug(`Total site count: ${totalCount}`);

    return totalCount;
  }

  async getWebList(params: WebListParams) {
    const list = await this.network.web.list(params);
    // this.logger.debug(JSON.stringify(list, undefined, 4));

    const deployments = list.deployments;
    const parsedDeployments = deployments.map((deployment: Deployment) => {
      const { siteName, deploymentUrl, domain } = deployment;
      return { siteName, deploymentUrl, domain };
    });

    // this.logger.debug(parsedDeployments);

    return parsedDeployments;
  }
}
