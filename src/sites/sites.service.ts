import { Injectable, Logger } from "@nestjs/common";
import { CreateIngressDto } from "./dto/create-ingress.dto";
import { UpdateIngressDto } from "./dto/update-ingress.dto";
import { NetworkService } from "../network/network.service";
import { KubeService, Ingress as KubeIngress } from "../kube/kube.service";
import { KubeConfigService } from "../config/kube/configuration.service";
import { UDPClient } from "dns2";

@Injectable()
export class SitesService {
  private readonly logger = new Logger(SitesService.name);
  private readonly dnsClient = UDPClient();

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
      i.wwwDomain,
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
    const aRecord = await this.dnsClient(domain);

    // Check if response and anser is Type 1 for A record
    if (aRecord.answers.length > 0 && aRecord.answers[0].type == 1) {
      this.logger.debug(`aRecord: ${JSON.stringify(aRecord.answers)}`);
      // return boolean and ip address
      return [true, aRecord.answers[0].address];
    } else {
      return [false, null];
    }
  }

  async checkDnsCnameRecord(domain: string): Promise<[boolean, string | null]> {
    const cnameRecord = await this.dnsClient(domain);

    // Check if response and anser is Type 5 for CNAME record
    if (cnameRecord.answers.length > 0 && cnameRecord.answers[0].type == 5) {
      this.logger.debug(`cnameRecord: ${JSON.stringify(cnameRecord.answers)}`);
      // return boolean and ip address
      return [true, cnameRecord.answers[0].domain];
    } else {
      return [false, null];
    }
  }
}
