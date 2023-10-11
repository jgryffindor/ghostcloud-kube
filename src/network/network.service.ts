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

  calculatePages(count: number, pageSize: number) {
    const pages = Math.ceil(count / pageSize);
    return pages;
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
    try {
      const list = await this.network.web.list({});
      const totalCount = list.totalCount;
      this.logger.debug(`Total site count: ${totalCount}`);

      return totalCount;
    } catch (error) {
      this.logger.error(`Error fetching site count: ${error}`);

      return error;
    }
  }

  async getWebList(params: WebListParams) {
    try {
      const list = await this.network.web.list(params);
      const deployments = list.deployments;
      const parsedDeployments = deployments.map((deployment: Deployment) => {
        const { siteName, deploymentUrl, domain } = deployment;
        return { siteName, deploymentUrl, domain };
      });

      return parsedDeployments;
    } catch (error) {
      this.logger.error(`Error fetching web.list: ${error}`);

      throw error;
    }
  }

  async getIngressList() {
    try {
      const count = await this.getSiteCount();
      const pageCount = this.calculatePages(count, 100);
      const list: Deployment[] = [];

      for (let page = 1; page <= pageCount; page++) {
        const params = { page: page };
        const webList = await this.getWebList(params);
        list.push(...webList);
      }

      const filteredList = list.filter((item) => item.domain !== undefined);

      return filteredList;
    } catch (error) {
      this.logger.error(`Error listing domains: ${error}`);

      throw error;
    }
  }
}
