import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateThemeDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(24)
  color?: string;
}
