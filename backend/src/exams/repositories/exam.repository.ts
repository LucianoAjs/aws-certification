import { Exam, ExamMode, ExamQuestion, ImportedQuestion, Theme } from '../domain/exam.types';

export abstract class ExamRepository {
  abstract ensureDefaultTheme(): Promise<void>;
  abstract listThemes(userId: string): Promise<Theme[]>;
  abstract createTheme(input: {
    id?: string;
    ownerUserId: string;
    name: string;
    description?: string | null;
    color?: string | null;
    sourceType?: string;
    isShared?: boolean;
  }): Promise<Theme>;
  abstract replaceQuestions(
    userId: string,
    themeId: string,
    questions: ImportedQuestion[],
  ): Promise<void>;
  abstract appendQuestions(
    userId: string,
    themeId: string,
    questions: ImportedQuestion[],
  ): Promise<void>;
  abstract updateSharing(userId: string, themeId: string, isShared: boolean): Promise<Theme>;
  abstract findExam(userId: string, themeId?: string | null): Promise<Exam>;
  abstract findTheme(themeId: string, userId?: string | null): Promise<Theme | null>;
  abstract findQuestionsForAttempt(input: {
    userId: string;
    themeId: string;
    mode: ExamMode;
    blockNumber?: number | null;
  }): Promise<ExamQuestion[]>;
  abstract findQuestionById(userId: string, questionId: number): Promise<ExamQuestion | null>;
}
