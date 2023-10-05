import { Injectable, Logger } from "@nestjs/common";
import { CreateSiteDto } from "./dto/create-site.dto";
import { UpdateSiteDto } from "./dto/update-site.dto";
import { NetworkService } from "src/network/network.service";
import { KubeService } from "src/kube/kube.service";

@Injectable()
export class SitesService {
  private readonly logger = new Logger(SitesService.name);

  constructor(private network: NetworkService, private kube: KubeService) {
    this.logger.debug("SitesService constructor");
  }

  getStatus() {
    return this.network.status();
  }

  findAll() {
    this.network.getWebList();

    return `This action returns all sites`;
  }

  findAllIngresses() {
    this.logger.debug("Get all ingresses");
    const ingresses = this.kube.listIngressResources("ghostcloud");
    this.logger.debug(`Ingreeses: ${ingresses}`);

    return ingresses;
  }

  create(createSiteDto: CreateSiteDto) {
    return 'This action adds a new site';
  }

  findOne(id: number) {
    return `This action returns a #${id} site`;
  }

  update(id: number, updateSiteDto: UpdateSiteDto) {
    return `This action updates a #${id} site`;
  }

  remove(id: number) {
    return `This action removes a #${id} site`;
  }
}
