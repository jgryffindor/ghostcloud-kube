import { Module } from "@nestjs/common";
import { KubeService } from "./kube.service";
import { KubeConfigModule } from "../config/kube/configuration.module";
import { KubeConfigService } from "../config/kube/configuration.service";

@Module({
  imports: [KubeConfigModule],
  providers: [KubeConfigService, KubeService],
  exports: [KubeService],
})
export class KubeModule {}
