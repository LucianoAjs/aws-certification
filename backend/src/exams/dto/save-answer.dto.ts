import { IsBoolean, IsIn } from 'class-validator';

export class SaveAnswerDto {
  @IsIn(['A', 'B', 'C', 'D'])
  selectedOption!: string;

  @IsBoolean()
  isMarked!: boolean;
}
