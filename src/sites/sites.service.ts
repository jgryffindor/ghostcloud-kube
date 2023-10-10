import { Injectable, Logger } from "@nestjs/common";
import { CreateIngressDto } from "./dto/create-ingress.dto";
import { UpdateIngressDto } from "./dto/update-ingress.dto";
import { Deployment, NetworkService } from "../network/network.service";
import { KubeService } from "../kube/kube.service";
import { KubeConfigService } from "../config/kube/configuration.service";
import * as dns from 'dns';

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
    const sites = await this.network.getIngressList();

    return sites;
  }

  findIngress(name: string) {
    const ingress = this.kube.getIngress(name, this.kubeConfig.namespace);
    return ingress;
  }

  findAllIngresses() {
    this.logger.debug(`Namespace: ${this.kubeConfig.namespace}`);
    const ingresses = this.kube.getIngresses(this.kubeConfig.namespace);
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

  async checkDnsARecord(domain: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      dns.resolve4(domain, (err, addresses) => {
        if (err) {
          resolve(false);
        } else {
          resolve(addresses.length > 0);
        }
      });
    });
  }
}
