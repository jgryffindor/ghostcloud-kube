import { Injectable, Logger } from "@nestjs/common";
import { CreateIngressDto } from "./dto/create-ingress.dto";
import { UpdateIngressDto } from "./dto/update-ingress.dto";
import { Deployment, NetworkService } from "../network/network.service";
import { KubeService } from "../kube/kube.service";
import { KubeConfigService } from "../config/kube/configuration.service";

function calculatePages(count: number, pageSize: number) {
  const pages = Math.ceil(count / pageSize);
  return pages;
}

@Injectable()
export class SitesService {
  private readonly logger = new Logger(SitesService.name);

  constructor(
    private network: NetworkService,
    private kube: KubeService,
    private kubeConfig: KubeConfigService,
  ) {
    this.logger.debug("SitesService constructor");
  }

  getStatus() {
    return this.network.status();
  }

  async findAll() {
    const count = await this.network.getSiteCount();
    const pageCount = calculatePages(count, 100);
    const list: Deployment[] = [];

    for (let page = 1; page <= pageCount; page++) {
      const params = { page: page };
      const webList = await this.network.getWebList(params);
      list.push(...webList);
    }

    const filteredList = list.filter((item) => item.domain !== undefined);

    return filteredList;
  }

  findIngress(name: string) {
    const ingress = this.kube.getIngress(this.kubeConfig.namespace, name);
    return ingress;
  }

  findAllIngresses() {
    const ingresses = this.kube.getIngressNames(this.kubeConfig.namespace);
    return ingresses;
  }

  async createIngress(i: CreateIngressDto) {
    const ingress = await this.kube.createIngress(
      i.namespace,
      i.sitename,
      i.deploymentUrl,
      i.domain,
    );
    return ingress;
  }

  update(id: number, updateIngressDto: UpdateIngressDto) {
    return `This action updates a #${id} site`;
  }

  remove(id: number) {
    return `This action removes a #${id} site`;
  }
}
