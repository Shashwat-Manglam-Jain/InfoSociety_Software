import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class MapAgentClientDto {
  @IsString()
  @IsNotEmpty()
  agentId!: string;

  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @IsNumber()
  @IsOptional()
  installmentAmount?: number;

  @IsString()
  @IsOptional()
  depositUnits?: string;
}
