import { IsBooleanString, IsOptional } from 'class-validator';

export class UploadQuestionsDto {
  @IsOptional()
  @IsBooleanString()
  replace?: string;
}
