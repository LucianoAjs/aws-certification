import { AnswerRow, AttemptRow, ExamMode } from '../domain/exam.types';

export abstract class AttemptRepository {
  abstract createAttempt(input: {
    id: string;
    themeId: string;
    mode: ExamMode;
    blockNumber: number | null;
    questionCount: number;
    timeLimitSeconds: number | null;
    startedAt: string;
  }): AttemptRow;
  abstract findAttempt(id: string): AttemptRow | null;
  abstract listAttempts(): AttemptRow[];
  abstract listAnswers(attemptId: string): AnswerRow[];
  abstract upsertAnswer(input: {
    attemptId: string;
    questionId: number;
    selectedOption: string;
    isMarked: boolean;
    answeredAt: string;
  }): void;
  abstract markQuestion(input: {
    attemptId: string;
    questionId: number;
    isMarked: boolean;
    answeredAt: string;
  }): void;
  abstract finishAttempt(input: {
    attemptId: string;
    finishedAt: string;
    score: number;
    correctCount: number;
  }): AttemptRow | null;
  abstract deleteAll(): void;
}
