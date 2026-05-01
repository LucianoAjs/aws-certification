import { IsBoolean } from 'class-validator';

export class MarkQuestionDto {
  @IsBoolean()
  isMarked!: boolean;
}
