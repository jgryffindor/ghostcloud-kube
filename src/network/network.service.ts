import { Injectable, Logger } from "@nestjs/common";
import { AppConfigService } from "../config/app/configuration.service";
import axios, { AxiosResponse } from "axios";

export interface Deployment {
  siteName: string;
  deploymentUrl: string;
  domain: string;
}

// Define the interface for the response data
interface ApiResponse {
  meta: MetaItem[];
}

// Define the interface for the 'meta' array items
interface MetaItem {
  creator: string;
  name: string;
  description: string;
  domain: string;
}

@Injectable()
export class NetworkService {
  private readonly logger = new Logger(NetworkService.name);

  constructor(private appConfig: AppConfigService) {}

  calculatePages(count: number, pageSize: number) {
    const pages = Math.ceil(count / pageSize);
    return pages;
  }

  async status() {
    const response = await axios.get(
      `${this.appConfig.network}/cosmos/base/tendermint/v1beta1/node_info`,
    );

    this.logger.debug(`Node info: ${JSON.stringify(response.data)}`);
  }

  async getSiteCount() {
    try {
      const response = await axios.get<ApiResponse>(
        `${this.appConfig.network}/ghostcloud/ghostcloud/deployments`,
      );

      // Access the 'meta' array of deployment info
      const metaArray = response.data.meta;

      if (metaArray) {
        // count items in metaArray
        const count = metaArray.length;

        return count;
      }
    } catch (error) {
      this.logger.error(`Error fetching site count: ${error}`);

      return error;
    }
  }

  async getWebList(params: any) {
    try {
      // Make a GET request to the API endpoint
      const response = await axios.get<ApiResponse>(
        `${this.appConfig.network}/ghostcloud/ghostcloud/deployments`,
        { params },
      );

      // Access the 'meta' array of deployment info
      const metaArray = response.data.meta;

      // map metaarray into deployments
      const deployments = metaArray.map((metaitem: MetaItem) => {
        const deploymentUrl = `https://${metaitem.name}-${metaitem.creator}.${this.appConfig.domain}`;
        const siteName = metaitem.name;

        // Check if domain is set or set to undefined if not
        const domain = metaitem.domain ? metaitem.domain : undefined;

        return { siteName, deploymentUrl, domain };
      });

      return deployments;
    } catch (error) {
      this.logger.error(
        `Error fetching ghostcloud/ghostcloud/deployments: ${error}`,
      );

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
