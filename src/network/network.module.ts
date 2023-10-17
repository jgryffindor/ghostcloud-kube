import { Module } from "@nestjs/common";
import { NetworkService } from "./network.service";
import { AppConfigModule } from "src/config/app/configuration.module";
import { AppConfigService } from "src/config/app/configuration.service";

@Module({
  imports: [AppConfigModule],
  providers: [AppConfigService, NetworkService],
  exports: [NetworkService],
})
export class NetworkModule {}
