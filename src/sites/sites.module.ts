import { Module } from "@nestjs/common";
import { SitesService } from "./sites.service";
import { SitesController } from "./sites.controller";
import { NetworkService } from "../network/network.service";
import { AppConfigModule } from "../config/app/configuration.module";
import { KubeService } from "src/kube/kube.service";
import { KubeConfigModule } from "src/config/kube/configuration.module";

@Module({
  imports: [AppConfigModule, KubeConfigModule],
  controllers: [SitesController],
  providers: [SitesService, NetworkService, KubeService],
})
export class SitesModule {}
