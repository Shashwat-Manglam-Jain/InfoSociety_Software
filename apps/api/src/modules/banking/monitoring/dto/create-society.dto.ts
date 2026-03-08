import { IsString, Length, Matches } from "class-validator";

export class CreateSocietyDto {
  @IsString()
  @Length(3, 20)
  @Matches(/^[A-Z0-9-]+$/)
  code!: string;

  @IsString()
  @Length(3, 120)
  name!: string;
}
