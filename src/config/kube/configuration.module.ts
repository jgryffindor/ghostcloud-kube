import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as Joi from "joi";
import configuration from "./configuration";
import { KubeConfigService } from "./configuration.service";

const validationSchema = Joi.object({
  KUBE_KUBECONFIG: Joi.string().default("local"),
  KUBE_NAMESPACE: Joi.string().default("default"),
  KUBE_API_URL: Joi.string().uri({ allowRelative: false }),
  KUBE_PROXY_SERVICE_NAME: Joi.string().default("many-ghostcloud-http-proxy"),
});

/**
 * Import and provide app configuration related classes.
 *
 * @module
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      expandVariables: true,
      validationSchema,
    }),
  ],
  providers: [ConfigService, KubeConfigService],
  exports: [ConfigService, KubeConfigService],
})
export class KubeConfigModule {}
