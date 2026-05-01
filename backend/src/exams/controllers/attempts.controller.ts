import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateAttemptDto } from '../dto/create-attempt.dto';
import { MarkQuestionDto } from '../dto/mark-question.dto';
import { SaveAnswerDto } from '../dto/save-answer.dto';
import { AttemptService } from '../services/attempt.service';

@Controller('attempts')
export class AttemptsController {
  constructor(private readonly attemptService: AttemptService) {}

  @Post()
  createAttempt(@Body() dto: CreateAttemptDto) {
    return this.attemptService.createAttempt(dto);
  }

  @Get(':id')
  getAttempt(@Param('id') id: string) {
    return this.attemptService.getAttempt(id);
  }

  @Get(':id/review')
  reviewAttempt(@Param('id') id: string) {
    return this.attemptService.reviewAttempt(id);
  }

  @Patch(':id/answers/:questionId')
  saveAnswer(
    @Param('id') id: string,
    @Param('questionId') questionId: string,
    @Body() dto: SaveAnswerDto,
  ) {
    return this.attemptService.saveAnswer(id, Number(questionId), dto);
  }

  @Patch(':id/answers/:questionId/mark')
  markQuestion(
    @Param('id') id: string,
    @Param('questionId') questionId: string,
    @Body() dto: MarkQuestionDto,
  ) {
    return this.attemptService.markQuestion(id, Number(questionId), dto);
  }

  @Post(':id/finish')
  finishAttempt(@Param('id') id: string) {
    return this.attemptService.finishAttempt(id);
  }
}
