import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type {
  Answer as AnswerModel,
  Attempt as AttemptModel,
  Theme as ThemeModel,
} from '@prisma/client';
import { AnswerRow, AttemptRow, ExamMode } from '../domain/exam.types';
import { AttemptRepository } from './attempt.repository';

type AttemptWithRelations = AttemptModel & {
  theme?: Pick<ThemeModel, 'name'> | null;
  answers?: Pick<AnswerModel, 'selectedOption'>[];
};

@Injectable()
export class PrismaAttemptRepository extends AttemptRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  private get prisma() {
    return this.prismaService.client;
  }

  async createAttempt(input: {
    id: string;
    userId: string;
    themeId: string;
    mode: ExamMode;
    blockNumber: number | null;
    questionCount: number;
    timeLimitSeconds: number | null;
    startedAt: string;
  }): Promise<AttemptRow> {
    const attempt = await this.prisma.attempt.create({
      data: {
        id: input.id,
        userId: input.userId,
        examId: input.themeId,
        mode: input.mode,
        blockNumber: input.blockNumber,
        questionCount: input.questionCount,
        timeLimitSeconds: input.timeLimitSeconds,
        startedAt: new Date(input.startedAt),
      },
      include: this.attemptInclude(),
    });

    return this.mapAttempt(attempt);
  }

  async findAttempt(userId: string, id: string): Promise<AttemptRow | null> {
    const attempt = await this.prisma.attempt.findFirst({
      where: { id, userId },
      include: this.attemptInclude(),
    });

    return attempt ? this.mapAttempt(attempt) : null;
  }

  async listAttempts(userId: string): Promise<AttemptRow[]> {
    const attempts = await this.prisma.attempt.findMany({
      where: { userId },
      include: this.attemptInclude(),
      orderBy: { startedAt: 'desc' },
    });

    return attempts.map((attempt) => this.mapAttempt(attempt));
  }

  async listAnswers(attemptId: string): Promise<AnswerRow[]> {
    const answers = await this.prisma.answer.findMany({
      where: { attemptId },
      orderBy: { questionId: 'asc' },
    });

    return answers.map((answer) => this.mapAnswer(answer));
  }

  async upsertAnswer(input: {
    attemptId: string;
    questionId: number;
    selectedOption: string;
    isMarked: boolean;
    answeredAt: string;
  }): Promise<void> {
    await this.prisma.answer.upsert({
      where: {
        attemptId_questionId: {
          attemptId: input.attemptId,
          questionId: input.questionId,
        },
      },
      create: {
        attemptId: input.attemptId,
        questionId: input.questionId,
        selectedOption: input.selectedOption,
        isMarked: input.isMarked,
        answeredAt: new Date(input.answeredAt),
      },
      update: {
        selectedOption: input.selectedOption,
        isMarked: input.isMarked,
        answeredAt: new Date(input.answeredAt),
      },
    });
  }

  async markQuestion(input: {
    attemptId: string;
    questionId: number;
    isMarked: boolean;
    answeredAt: string;
  }): Promise<void> {
    await this.prisma.answer.upsert({
      where: {
        attemptId_questionId: {
          attemptId: input.attemptId,
          questionId: input.questionId,
        },
      },
      create: {
        attemptId: input.attemptId,
        questionId: input.questionId,
        selectedOption: null,
        isMarked: input.isMarked,
        answeredAt: new Date(input.answeredAt),
      },
      update: {
        isMarked: input.isMarked,
        answeredAt: new Date(input.answeredAt),
      },
    });
  }

  async finishAttempt(input: {
    userId: string;
    attemptId: string;
    finishedAt: string;
    score: number;
    correctCount: number;
  }): Promise<AttemptRow | null> {
    await this.prisma.attempt.updateMany({
      where: { id: input.attemptId, userId: input.userId },
      data: {
        status: 'finished',
        finishedAt: new Date(input.finishedAt),
        score: input.score,
        correctCount: input.correctCount,
      },
    });

    return this.findAttempt(input.userId, input.attemptId);
  }

  async deleteAll(userId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.answer.deleteMany({
        where: {
          attempt: { userId },
        },
      }),
      this.prisma.attempt.deleteMany({ where: { userId } }),
    ]);
  }

  private attemptInclude() {
    return {
      theme: { select: { name: true } },
      answers: { select: { selectedOption: true } },
    };
  }

  private mapAttempt(row: AttemptWithRelations): AttemptRow {
    return {
      id: row.id,
      examId: row.examId,
      userId: row.userId,
      mode: row.mode as ExamMode,
      blockNumber: row.blockNumber,
      questionCount: row.questionCount,
      timeLimitSeconds: row.timeLimitSeconds,
      startedAt: row.startedAt.toISOString(),
      finishedAt: row.finishedAt?.toISOString() ?? null,
      status: row.status === 'finished' ? 'finished' : 'in_progress',
      score: row.score,
      correctCount: row.correctCount,
      themeName: row.theme?.name,
      answeredCount: row.answers?.filter((answer) => answer.selectedOption).length ?? 0,
    };
  }

  private mapAnswer(row: AnswerModel): AnswerRow {
    return {
      attemptId: row.attemptId,
      questionId: row.questionId,
      selectedOption: row.selectedOption,
      isMarked: row.isMarked,
      answeredAt: row.answeredAt.toISOString(),
    };
  }
}
