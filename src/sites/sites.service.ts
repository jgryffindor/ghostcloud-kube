import { Injectable, Logger } from "@nestjs/common";
import { CreateIngressDto } from "./dto/create-ingress.dto";
import { UpdateIngressDto } from "./dto/update-ingress.dto";
import { NetworkService } from "../network/network.service";
import { KubeService, Ingress as KubeIngress } from "../kube/kube.service";
import { KubeConfigService } from "../config/kube/configuration.service";
import * as dns from "dns";

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

  async findAllIngresses(): Promise<KubeIngress[]> {
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

  async checkDnsARecord(domain: string): Promise<[boolean, string | null]> {
    return new Promise((resolve) => {
      dns.resolve4(domain, (err, addresses) => {
        if (err) {
          resolve([false, null]);
        } else {
          const hasAddresses = addresses.length > 0;
          const ipAddress = hasAddresses ? addresses[0] : null;
          this.logger.debug(`DNS resolution for ${domain}: ${addresses}`);
          resolve([hasAddresses, ipAddress]);
        }
      });
    });
  }
}
