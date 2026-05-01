import { Injectable } from '@nestjs/common';
import { AttemptRepository } from '../repositories/attempt.repository';
import { AttemptService } from './attempt.service';

@Injectable()
export class ProgressService {
  constructor(
    private readonly attemptRepository: AttemptRepository,
    private readonly attemptService: AttemptService,
  ) {}

  getProgress() {
    const attempts = this.attemptRepository
      .listAttempts()
      .map((attempt) => this.attemptService.toAttemptListItem(attempt));
    const finished = attempts.filter((attempt) => attempt.status === 'finished');
    const activeAttempt =
      attempts.find((attempt) => attempt.status === 'in_progress') ?? null;
    const averageScore = finished.length
      ? Math.round(
          finished.reduce((total, attempt) => total + attempt.score, 0) /
            finished.length,
        )
      : 0;

    return {
      attempts,
      summary: {
        totalAttempts: attempts.length,
        finishedAttempts: finished.length,
        activeAttempt,
        bestScore: finished.reduce(
          (best, attempt) => Math.max(best, attempt.score),
          0,
        ),
        averageScore,
        totalQuestionsAnswered: attempts.reduce(
          (total, attempt) => total + attempt.answeredCount,
          0,
        ),
        lastFinishedAttempt: finished[0] ?? null,
      },
    };
  }

  reset() {
    this.attemptRepository.deleteAll();
  }
}
