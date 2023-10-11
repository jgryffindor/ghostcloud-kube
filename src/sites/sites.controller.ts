import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
} from "@nestjs/common";
import { ApiBody } from "@nestjs/swagger";
import { SitesService } from "./sites.service";
import { CreateIngressDto } from "./dto/create-ingress.dto";
import { UpdateIngressDto } from "./dto/update-ingress.dto";

@Controller("sites")
export class SitesController {
  constructor(private readonly sites: SitesService) {}

  private readonly logger = new Logger(SitesController.name);

  @ApiBody({ type: CreateIngressDto })
  @Post("ingress")
  create(@Body() createIngressDto: CreateIngressDto) {
    return this.sites.createIngress(createIngressDto);
  }

  @Post(":name")
  checkDnsARecord(@Param("name") name: string) {
    return this.sites.checkDnsARecord(name);
  }

  @Get("status")
  status() {
    this.logger.debug("Get all sites");
    return this.sites.getStatus();
  }

  @Get()
  findAll() {
    this.logger.debug("Get all sites");
    return this.sites.findAll();
  }

  @Get("ingress/:name")
  findIngress(@Param("name") name: string) {
    return this.sites.findIngress(name);
  }

  @Get("ingress")
  findAllIngresses() {
    this.logger.debug("Get all ingresses");
    const ingresses = this.sites.findAllIngresses();

    return ingresses;
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateSiteDto: UpdateIngressDto) {
    return this.sites.update(+id, updateSiteDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.sites.remove(+id);
  }
}
