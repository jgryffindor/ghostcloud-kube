import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/**
 * Service dealing with app config based operations.
 *
 * @class
 */
@Injectable()
export class KubeConfigService {
  constructor(private configService: ConfigService) {}

  get kubeconfig() {
    return this.configService.get<string>("kube.kubeconfig");
  }
  get namespace() {
    return this.configService.get<string>("kube.namespace");
  }
  get apiUrl() {
    return this.configService.get<string>("kube.apiUrl");
  }
  get proxyServiceName() {
    return this.configService.get<string>("kube.proxyServiceName");
  }
  get ingressIp() {
    return this.configService.get<string>("kube.ingressIp");
  }
  get tier() {
    return this.configService.get<string>("kube.tier");
  }
}
