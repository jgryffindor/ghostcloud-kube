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
import { SitesService } from "./sites.service";
import { CreateSiteDto } from "./dto/create-site.dto";
import { UpdateSiteDto } from "./dto/update-site.dto";
import { KubeService } from "src/kube/kube.service";

@Controller("sites")
export class SitesController {
  constructor(private readonly sites: SitesService) {}

  private readonly logger = new Logger(SitesController.name);

  @Post()
  create(@Body() createSiteDto: CreateSiteDto) {
    return this.sites.create(createSiteDto);
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

  @Get(":name")
  findIngress(@Param("name") name: string) {
    return this.sites.findIngress(name);
  }

  @Get("ingresses")
  findAllIngresses() {
    this.logger.debug("Get all ingresses");
    const ingresses = this.sites.findAllIngresses();

    return ingresses;
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateSiteDto: UpdateSiteDto) {
    return this.sites.update(+id, updateSiteDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.sites.remove(+id);
  }
}
