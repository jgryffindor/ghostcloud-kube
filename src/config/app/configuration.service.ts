import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/**
 * Service dealing with app config based operations.
 *
 * @class
 */
@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get name() {
    return this.configService.get<string>("app.name");
  }
  get env() {
    return this.configService.get<string>("app.env");
  }
  get url() {
    return this.configService.get<string>("app.url");
  }
  get network() {
    return this.configService.get<string>("app.network");
  }
  get port() {
    return Number(this.configService.get<number>("app.port"));
  }
  get domain() {
    return this.configService.get<string>("app.domain");
  }
  get isDev() {
    return this.env == "development" || this.env == "dev";
  }
  get debug() {
    return this.isDev || this.configService.get<boolean>("app.debug");
  }
}
