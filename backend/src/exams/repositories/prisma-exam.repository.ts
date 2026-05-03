import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { Question as QuestionModel, Theme as ThemeModel } from '@prisma/client';
import { MarkdownExamAdapter } from '../adapters/markdown-exam.adapter';
import {
  Exam,
  ExamBlock,
  ExamMode,
  ExamQuestion,
  ImportedQuestion,
  Theme,
} from '../domain/exam.types';
import { SYSTEM_USER_ID } from '../user-context';
import { ExamRepository } from './exam.repository';

type ThemeWithCount = ThemeModel & { _count?: { questions: number } };

@Injectable()
export class PrismaExamRepository extends ExamRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly markdownAdapter: MarkdownExamAdapter,
  ) {
    super();
  }

  private get prisma() {
    return this.prismaService.client;
  }

  async ensureDefaultTheme(): Promise<void> {
    const defaultTheme = this.markdownAdapter.parseDefaultTheme();
    await this.prisma.user.upsert({
      where: { id: SYSTEM_USER_ID },
      update: {},
      create: {
        id: SYSTEM_USER_ID,
        email: 'system@local',
        name: 'Sistema',
        passwordHash: 'system',
      },
    });

    const theme = await this.prisma.theme.findUnique({
      where: { id: defaultTheme.id },
      include: { _count: { select: { questions: true } } },
    });

    if (!theme) {
      await this.prisma.theme.create({
        data: {
          id: defaultTheme.id,
          ownerUserId: SYSTEM_USER_ID,
          name: defaultTheme.name,
          description: defaultTheme.description,
          color: '#ff9900',
          sourceType: 'markdown',
          isShared: true,
        },
      });
    } else if (theme.sourceType === 'markdown') {
      await this.prisma.theme.update({
        where: { id: defaultTheme.id },
        data: {
          ownerUserId: SYSTEM_USER_ID,
          isShared: true,
        },
      });
    }

    if (theme?._count.questions) return;
    await this.replaceQuestions(SYSTEM_USER_ID, defaultTheme.id, defaultTheme.questions);
  }

  async listThemes(userId: string): Promise<Theme[]> {
    const rows = await this.prisma.theme.findMany({
      where: {
        OR: [{ ownerUserId: userId }, { isShared: true }],
      },
      include: { _count: { select: { questions: true } } },
    });

    return rows
      .sort((a, b) => {
        const ownership = Number(a.ownerUserId !== userId) - Number(b.ownerUserId !== userId);
        if (ownership !== 0) return ownership;
        return a.createdAt.getTime() - b.createdAt.getTime();
      })
      .map((row) => this.mapTheme(row, userId));
  }

  async createTheme(input: {
    id?: string;
    ownerUserId: string;
    name: string;
    description?: string | null;
    color?: string | null;
    sourceType?: string;
    isShared?: boolean;
  }): Promise<Theme> {
    const theme = await this.prisma.theme.create({
      data: {
        id: input.id,
        ownerUserId: input.ownerUserId,
        name: input.name,
        description: input.description ?? null,
        color: input.color ?? '#147eba',
        sourceType: input.sourceType ?? 'manual',
        isShared: input.isShared === true,
      },
      include: { _count: { select: { questions: true } } },
    });

    return this.mapTheme(theme, input.ownerUserId);
  }

  async replaceQuestions(
    userId: string,
    themeId: string,
    questions: ImportedQuestion[],
  ): Promise<void> {
    await this.assertOwnedTheme(userId, themeId);
    await this.prisma.$transaction([
      this.prisma.question.deleteMany({ where: { themeId } }),
      this.prisma.question.createMany({
        data: questions.map((question) => this.questionCreateInput(themeId, question)),
      }),
      this.prisma.theme.update({ where: { id: themeId }, data: {} }),
    ]);
  }

  async appendQuestions(
    userId: string,
    themeId: string,
    questions: ImportedQuestion[],
  ): Promise<void> {
    await this.assertOwnedTheme(userId, themeId);
    const aggregate = await this.prisma.question.aggregate({
      where: { themeId },
      _max: { sortOrder: true },
    });
    const currentMax = aggregate._max.sortOrder ?? 0;
    const normalized = questions.map((question, index) => ({
      ...question,
      sortOrder: currentMax + index + 1,
    }));

    await this.prisma.$transaction([
      this.prisma.question.createMany({
        data: normalized.map((question) => this.questionCreateInput(themeId, question)),
      }),
      this.prisma.theme.update({ where: { id: themeId }, data: {} }),
    ]);
  }

  async updateSharing(userId: string, themeId: string, isShared: boolean): Promise<Theme> {
    await this.assertOwnedTheme(userId, themeId);
    const theme = await this.prisma.theme.update({
      where: { id: themeId },
      data: { isShared },
      include: { _count: { select: { questions: true } } },
    });

    return this.mapTheme(theme, userId);
  }

  async findExam(userId: string, themeId?: string | null): Promise<Exam> {
    const theme = themeId ? await this.findTheme(themeId, userId) : (await this.listThemes(userId))[0];
    if (!theme) {
      throw new NotFoundException('Nenhum tema de questoes encontrado.');
    }

    const questions = await this.findQuestionsForTheme(userId, theme.id);
    const blocks = this.buildBlocks(questions);
    return {
      id: theme.id,
      title: theme.name,
      description: theme.description,
      sourceType: theme.sourceType,
      totalQuestions: questions.length,
      fullExamTimeLimitMinutes: blocks.length
        ? blocks.reduce((total, block) => total + block.timeLimitMinutes, 0)
        : Math.ceil(questions.length * 2),
      blocks,
      questions,
    };
  }

  async findTheme(themeId: string, userId?: string | null): Promise<Theme | null> {
    const row = await this.prisma.theme.findFirst({
      where: {
        id: themeId,
        ...(userId
          ? {
              OR: [{ ownerUserId: userId }, { isShared: true }],
            }
          : {}),
      },
      include: { _count: { select: { questions: true } } },
    });

    return row ? this.mapTheme(row, userId ?? undefined) : null;
  }

  async findQuestionsForAttempt(input: {
    userId: string;
    themeId: string;
    mode: ExamMode;
    blockNumber?: number | null;
  }): Promise<ExamQuestion[]> {
    const questions = await this.findQuestionsForTheme(input.userId, input.themeId);
    if (input.mode === 'block') {
      return questions.filter((question) => question.blockNumber === input.blockNumber);
    }
    return questions;
  }

  async findQuestionById(userId: string, questionId: number): Promise<ExamQuestion | null> {
    const row = await this.prisma.question.findFirst({
      where: {
        id: questionId,
        theme: {
          OR: [{ ownerUserId: userId }, { isShared: true }],
        },
      },
    });

    return row ? this.mapQuestion(row) : null;
  }

  private async findQuestionsForTheme(userId: string, themeId: string): Promise<ExamQuestion[]> {
    await this.assertVisibleTheme(userId, themeId);
    const rows = await this.prisma.question.findMany({
      where: { themeId },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });

    return rows.map((row) => this.mapQuestion(row));
  }

  private async assertVisibleTheme(userId: string, themeId: string) {
    if (!(await this.findTheme(themeId, userId))) {
      throw new NotFoundException('Tema nao encontrado.');
    }
  }

  private async assertOwnedTheme(userId: string, themeId: string) {
    const theme = await this.findTheme(themeId, userId);
    if (!theme) {
      throw new NotFoundException('Tema nao encontrado.');
    }
    if (theme.ownerUserId !== userId) {
      throw new ForbiddenException('Este tema pertence a outro usuario.');
    }
  }

  private questionCreateInput(themeId: string, question: ImportedQuestion) {
    return {
      themeId,
      blockNumber: question.blockNumber,
      blockTitle: question.blockTitle,
      blockTimeLimitMinutes: question.blockTimeLimitMinutes,
      prompt: question.prompt,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      correctOption: question.correctOption,
      explanation: question.explanation,
      sortOrder: question.sortOrder,
    };
  }

  private buildBlocks(questions: ExamQuestion[]): ExamBlock[] {
    const blocks = new Map<number, ExamBlock>();
    for (const question of questions) {
      const block = blocks.get(question.blockNumber) ?? {
        number: question.blockNumber,
        title: question.blockTitle,
        questionIds: [],
        questionCount: 0,
        timeLimitMinutes: question.blockTimeLimitMinutes,
      };
      block.questionIds.push(question.id);
      block.questionCount = block.questionIds.length;
      blocks.set(block.number, block);
    }
    return [...blocks.values()].sort((a, b) => a.number - b.number);
  }

  private mapTheme(row: ThemeWithCount, userId?: string): Theme {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      color: row.color,
      sourceType: row.sourceType,
      ownerUserId: row.ownerUserId,
      isShared: row.isShared,
      isOwner: userId ? row.ownerUserId === userId : undefined,
      questionCount: Number(row._count?.questions ?? 0),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private mapQuestion(row: QuestionModel): ExamQuestion {
    return {
      id: row.id,
      blockNumber: row.blockNumber,
      blockTitle: row.blockTitle,
      blockTimeLimitMinutes: row.blockTimeLimitMinutes,
      prompt: row.prompt,
      options: [
        { key: 'A', text: row.optionA },
        { key: 'B', text: row.optionB },
        { key: 'C', text: row.optionC },
        { key: 'D', text: row.optionD },
      ],
      correctOption: row.correctOption,
      explanation: row.explanation,
      sortOrder: row.sortOrder,
    };
  }
}
