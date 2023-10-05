import { Injectable, Logger } from "@nestjs/common";
import { Base, Events, Network, Web, Ledger } from "@liftedinit/many-js";
import { AppConfigService } from "../config/app/configuration.service";

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

  async getWebList() {
    const list = await this.network.web.list();
    this.logger.debug(JSON.stringify(list));
    return list;
  }
}
