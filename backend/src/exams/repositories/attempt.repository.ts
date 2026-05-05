import { AnswerRow, AttemptRow, ExamMode } from '../domain/exam.types';

export abstract class AttemptRepository {
  abstract createAttempt(input: {
    id: string;
    userId: string;
    themeId: string;
    mode: ExamMode;
    blockNumber: number | null;
    questionCount: number;
    timeLimitSeconds: number | null;
    startedAt: string;
    timerStartedAt: string | null;
  }): Promise<AttemptRow>;
  abstract findAttempt(userId: string, id: string): Promise<AttemptRow | null>;
  abstract listAttempts(userId: string): Promise<AttemptRow[]>;
  abstract listAnswers(attemptId: string): Promise<AnswerRow[]>;
  abstract upsertAnswer(input: {
    attemptId: string;
    questionId: number;
    selectedOption: string;
    isMarked: boolean;
    answeredAt: string;
  }): Promise<void>;
  abstract markQuestion(input: {
    attemptId: string;
    questionId: number;
    isMarked: boolean;
    answeredAt: string;
  }): Promise<void>;
  abstract finishAttempt(input: {
    userId: string;
    attemptId: string;
    finishedAt: string;
    score: number;
    correctCount: number;
  }): Promise<AttemptRow | null>;
  abstract pauseAttempt(input: {
    userId: string;
    attemptId: string;
    pausedAt: string;
  }): Promise<AttemptRow | null>;
  abstract resumeAttempt(input: {
    userId: string;
    attemptId: string;
    resumedAt: string;
  }): Promise<AttemptRow | null>;
  abstract deleteAll(userId: string): Promise<void>;
}
