import { ApiProperty } from "@nestjs/swagger";

export class CreateIngressDto {
  @ApiProperty()
  namespace: string;

  @ApiProperty()
  sitename: string;

  @ApiProperty()
  deploymentUrl: string;

  @ApiProperty()
  domain: string;
}
