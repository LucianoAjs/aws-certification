import { Exam, ExamMode, ExamQuestion, ImportedQuestion, Theme } from '../domain/exam.types';

export abstract class ExamRepository {
  abstract ensureDefaultTheme(): void;
  abstract listThemes(): Theme[];
  abstract createTheme(input: {
    id?: string;
    name: string;
    description?: string | null;
    color?: string | null;
    sourceType?: string;
  }): Theme;
  abstract replaceQuestions(themeId: string, questions: ImportedQuestion[]): void;
  abstract appendQuestions(themeId: string, questions: ImportedQuestion[]): void;
  abstract findExam(themeId?: string | null): Exam;
  abstract findTheme(themeId: string): Theme | null;
  abstract findQuestionsForAttempt(input: {
    themeId: string;
    mode: ExamMode;
    blockNumber?: number | null;
  }): ExamQuestion[];
  abstract findQuestionById(questionId: number): ExamQuestion | null;
}
