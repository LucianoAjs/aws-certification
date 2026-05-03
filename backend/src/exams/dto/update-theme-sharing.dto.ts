import { IsBoolean } from 'class-validator';

export class UpdateThemeSharingDto {
  @IsBoolean()
  isShared!: boolean;
}
