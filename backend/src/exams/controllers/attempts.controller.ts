import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { AuthUser } from '../../auth/auth.types';
import { CurrentUser } from '../../auth/current-user.decorator';
import { CreateAttemptDto } from '../dto/create-attempt.dto';
import { MarkQuestionDto } from '../dto/mark-question.dto';
import { SaveAnswerDto } from '../dto/save-answer.dto';
import { AttemptService } from '../services/attempt.service';

@Controller('attempts')
@UseGuards(AuthGuard)
export class AttemptsController {
  constructor(private readonly attemptService: AttemptService) {}

  @Post()
  createAttempt(@CurrentUser() user: AuthUser, @Body() dto: CreateAttemptDto) {
    return this.attemptService.createAttempt(user.id, dto);
  }

  @Get(':id')
  getAttempt(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.attemptService.getAttempt(user.id, id);
  }

  @Get(':id/review')
  reviewAttempt(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.attemptService.reviewAttempt(user.id, id);
  }

  @Patch(':id/answers/:questionId')
  saveAnswer(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('questionId') questionId: string,
    @Body() dto: SaveAnswerDto,
  ) {
    return this.attemptService.saveAnswer(user.id, id, Number(questionId), dto);
  }

  @Patch(':id/answers/:questionId/mark')
  markQuestion(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('questionId') questionId: string,
    @Body() dto: MarkQuestionDto,
  ) {
    return this.attemptService.markQuestion(user.id, id, Number(questionId), dto);
  }

  @Post(':id/finish')
  finishAttempt(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.attemptService.finishAttempt(user.id, id);
  }

  @Post(':id/pause')
  pauseAttempt(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.attemptService.pauseAttempt(user.id, id);
  }

  @Post(':id/resume')
  resumeAttempt(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.attemptService.resumeAttempt(user.id, id);
  }
}
