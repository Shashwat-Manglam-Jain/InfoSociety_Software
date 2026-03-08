import { IsOptional, IsString } from "class-validator";

export class UpgradeSubscriptionDto {
  @IsOptional()
  @IsString()
  note?: string;
}
