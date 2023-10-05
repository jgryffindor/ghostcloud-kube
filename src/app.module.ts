import { Logger, Module } from "@nestjs/common";
import { AppConfigModule } from "./config/app/configuration.module";
import { SitesModule } from "./sites/sites.module";
import { NetworkService } from "./network/network.service";
import { KubeService } from "./kube/kube.service";
import { KubeConfigModule } from "./config/kube/configuration.module";

@Module({
  imports: [
    AppConfigModule,
    KubeConfigModule,
    SitesModule
  ],
  controllers: [],
  providers: [Logger, NetworkService, KubeService],
})
export class AppModule {}
