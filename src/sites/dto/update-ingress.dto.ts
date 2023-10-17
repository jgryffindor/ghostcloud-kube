import { PartialType } from "@nestjs/swagger";
import { CreateIngressDto } from "./create-ingress.dto";

export class UpdateIngressDto extends PartialType(CreateIngressDto) {}
