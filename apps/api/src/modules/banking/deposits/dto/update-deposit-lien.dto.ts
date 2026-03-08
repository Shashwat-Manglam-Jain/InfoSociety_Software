import { IsBoolean } from "class-validator";

export class UpdateDepositLienDto {
  @IsBoolean()
  lienMarked!: boolean;
}
