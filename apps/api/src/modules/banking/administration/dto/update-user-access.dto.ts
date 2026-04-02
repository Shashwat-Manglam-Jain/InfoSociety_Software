import { IsArray, IsString } from "class-validator";

export class UpdateUserAccessDto {
  @IsArray()
  @IsString({ each: true })
  allowedModuleSlugs!: string[];
}
