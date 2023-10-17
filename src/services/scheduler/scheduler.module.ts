import { Module } from "@nestjs/common";
import { SchedulerService } from "./scheduler.service";
import { SchedulerController } from "./scheduler.controller";
import { SchedulerConfigService } from "../../config/scheduler/configuration.service";
import { NetworkService } from "../../network/network.service";
import { NetworkUpdater } from "./network/updater";
import { ConfigService } from "@nestjs/config";
import { AppConfigService } from "../../config/app/configuration.service";
import { KubeService } from "../../kube/kube.service";
import { KubeConfigService } from "../..//config/kube/configuration.service";
import { SitesService } from "src/sites/sites.service";

@Module({
  controllers: [SchedulerController],
  providers: [
    AppConfigService,
    KubeService,
    KubeConfigService,
    SchedulerService,
    SchedulerConfigService,
    NetworkService,
    NetworkUpdater,
    ConfigService,
    SitesService,
  ],
  exports: [SchedulerService],
})
export class SchedulerModule {}
