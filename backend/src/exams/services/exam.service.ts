import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { Exam, ExamQuestion } from '../domain/exam.types';
import { CreateThemeDto } from '../dto/create-theme.dto';
import { SpreadsheetQuestionImportAdapter } from '../adapters/spreadsheet-question-import.adapter';
import { ExamRepository } from '../repositories/exam.repository';

@Injectable()
export class ExamService implements OnModuleInit {
  constructor(
    private readonly examRepository: ExamRepository,
    private readonly spreadsheetAdapter: SpreadsheetQuestionImportAdapter,
  ) {}

  onModuleInit() {
    this.examRepository.ensureDefaultTheme();
  }

  getPublicExam(themeId?: string | null) {
    return this.toPublicExam(this.examRepository.findExam(themeId));
  }

  listThemes() {
    return this.examRepository.listThemes();
  }

  createTheme(dto: CreateThemeDto) {
    return this.examRepository.createTheme({
      name: dto.name.trim(),
      description: dto.description?.trim() || null,
      color: dto.color?.trim() || '#147eba',
      sourceType: 'manual',
    });
  }

  importQuestions(input: {
    themeId: string;
    file?: { buffer: Buffer };
    replace: boolean;
  }) {
    if (!input.file?.buffer?.length) {
      throw new BadRequestException('Envie um arquivo .csv no campo file.');
    }

    const questions = this.spreadsheetAdapter.parse(input.file.buffer);
    if (input.replace) {
      this.examRepository.replaceQuestions(input.themeId, questions);
    } else {
      this.examRepository.appendQuestions(input.themeId, questions);
    }

    return {
      theme: this.examRepository.findTheme(input.themeId),
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
