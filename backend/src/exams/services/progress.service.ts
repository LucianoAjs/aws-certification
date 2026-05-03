import { Injectable } from '@nestjs/common';
import { AttemptRepository } from '../repositories/attempt.repository';
import { AttemptService } from './attempt.service';
import { ExamRepository } from '../repositories/exam.repository';

@Injectable()
export class ProgressService {
  constructor(
    private readonly attemptRepository: AttemptRepository,
    private readonly attemptService: AttemptService,
    private readonly examRepository: ExamRepository,
  ) {}

  async getProgress(userId: string) {
    const attempts = await Promise.all(
      (await this.attemptRepository.listAttempts(userId)).map((attempt) =>
        this.attemptService.toAttemptListItem(attempt),
      ),
    );
    const finished = attempts.filter((attempt) => attempt.status === 'finished');
    const activeAttempt =
      attempts.find((attempt) => attempt.status === 'in_progress') ?? null;
    const averageScore = finished.length
      ? Math.round(
          finished.reduce((total, attempt) => total + attempt.score, 0) /
            finished.length,
        )
      : 0;

    // Chart: Score History (last 20, oldest first)
    const scoreHistory = finished
      .slice(0, 20)
      .reverse()
      .map((attempt) => ({
        date: attempt.finishedAt!.split('T')[0],
        score: attempt.score,
      }));

    // Chart: Domain Performance
    const domainStats = new Map<string, { totalScore: number; count: number }>();
    for (const attempt of finished) {
      const answers = await this.attemptRepository.listAnswers(attempt.id);
      for (const answer of answers) {
        if (!answer.selectedOption) continue;
        const question = await this.examRepository.findQuestionById(userId, answer.questionId);
        if (question) {
          const isCorrect = answer.selectedOption === question.correctOption;
          const stats = domainStats.get(question.blockTitle) ?? { totalScore: 0, count: 0 };
          stats.totalScore += isCorrect ? 100 : 0;
          stats.count += 1;
          domainStats.set(question.blockTitle, stats);
        }
      }
    }

    const domainPerformance = Array.from(domainStats.entries()).map(([domain, stats]) => ({
      domain,
      averageScore: Math.round(stats.totalScore / stats.count),
    }));

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
      chartData: {
        scoreHistory,
        domainPerformance,
      },
    };
  }

  async reset(userId: string) {
    await this.attemptRepository.deleteAll(userId);
  }
}
