import { Injectable, Logger } from "@nestjs/common";
import { KubeService } from "src/kube/kube.service";

@Injectable()
export class NetworkUpdater {
  private readonly logger = new Logger(NetworkUpdater.name);

  constructor(private kube: KubeService) {}

  async run(n) {
    this.logger.debug(`Updating network ${n}...`);


  }
}
