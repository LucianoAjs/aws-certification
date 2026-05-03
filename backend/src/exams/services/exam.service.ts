import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { Exam, ExamQuestion } from '../domain/exam.types';
import { CreateThemeDto } from '../dto/create-theme.dto';
import { UpdateThemeSharingDto } from '../dto/update-theme-sharing.dto';
import { SpreadsheetQuestionImportAdapter } from '../adapters/spreadsheet-question-import.adapter';
import { ExamRepository } from '../repositories/exam.repository';

@Injectable()
export class ExamService implements OnModuleInit {
  constructor(
    private readonly examRepository: ExamRepository,
    private readonly spreadsheetAdapter: SpreadsheetQuestionImportAdapter,
  ) {}

  async onModuleInit() {
    await this.examRepository.ensureDefaultTheme();
  }

  async getPublicExam(userId: string, themeId?: string | null) {
    return this.toPublicExam(await this.examRepository.findExam(userId, themeId));
  }

  listThemes(userId: string) {
    return this.examRepository.listThemes(userId);
  }

  createTheme(userId: string, dto: CreateThemeDto) {
    return this.examRepository.createTheme({
      ownerUserId: userId,
      name: dto.name.trim(),
      description: dto.description?.trim() || null,
      color: dto.color?.trim() || '#147eba',
      sourceType: 'manual',
      isShared: dto.isShared === true,
    });
  }

  updateSharing(userId: string, themeId: string, dto: UpdateThemeSharingDto) {
    return this.examRepository.updateSharing(userId, themeId, dto.isShared);
  }

  async importQuestions(input: {
    userId: string;
    themeId: string;
    file?: { buffer: Buffer };
    replace: boolean;
  }) {
    if (!input.file?.buffer?.length) {
      throw new BadRequestException('Envie um arquivo .csv no campo file.');
    }

    const questions = this.spreadsheetAdapter.parse(input.file.buffer);
    if (input.replace) {
      await this.examRepository.replaceQuestions(input.userId, input.themeId, questions);
    } else {
      await this.examRepository.appendQuestions(input.userId, input.themeId, questions);
    }

    return {
      theme: await this.examRepository.findTheme(input.themeId, input.userId),
      importedQuestions: questions.length,
      mode: input.replace ? 'replace' : 'append',
    };
  }

  templateBuffer() {
    return this.spreadsheetAdapter.templateBuffer();
  }

  private toPublicExam(exam: Exam) {
    return {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      sourceType: exam.sourceType,
      totalQuestions: exam.totalQuestions,
      fullExamTimeLimitMinutes: exam.fullExamTimeLimitMinutes,
      blocks: exam.blocks.map(({ questionIds, ...block }) => block),
      questions: exam.questions.map((question) => this.toPublicQuestion(question)),
    };
  }

  private toPublicQuestion(question: ExamQuestion) {
    return {
      id: question.id,
      blockNumber: question.blockNumber,
      blockTitle: question.blockTitle,
      prompt: question.prompt,
      options: question.options,
    };
  }
}
