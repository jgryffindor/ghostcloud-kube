import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/**
 * Service dealing with app config based operations.
 *
 * @class
 */
@Injectable()
export class SchedulerConfigService {
  constructor(private configService: ConfigService) {}

  get cron() {
    return this.configService.get<string | undefined>("scheduler.cron");
  }
  get seconds() {
    return this.configService.get<number | undefined>("scheduler.seconds");
  }
  get enabled() {
    return this.cron !== undefined || this.seconds !== undefined;
  }
}
