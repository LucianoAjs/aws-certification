import { IsIn, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ExamMode } from '../domain/exam.types';

export class CreateAttemptDto {
  @IsIn(['full', 'block'])
  mode!: ExamMode;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  blockNumber?: number;

  @IsOptional()
  @IsString()
  themeId?: string;
}
