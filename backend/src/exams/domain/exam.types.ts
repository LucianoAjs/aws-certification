export type ExamMode = 'full' | 'block';
export type AttemptStatus = 'in_progress' | 'finished';

export interface Theme {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  sourceType: string;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExamOption {
  key: string;
  text: string;
}

export interface ExamQuestion {
  id: number;
  blockNumber: number;
  blockTitle: string;
  blockTimeLimitMinutes: number;
  prompt: string;
  options: ExamOption[];
  correctOption: string;
  explanation: string;
  sortOrder: number;
}

export interface ExamBlock {
  number: number;
  title: string;
  questionIds: number[];
  questionCount: number;
  timeLimitMinutes: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string | null;
  sourceType: string;
  totalQuestions: number;
  fullExamTimeLimitMinutes: number;
  blocks: ExamBlock[];
  questions: ExamQuestion[];
}

export interface ImportedQuestion {
  blockNumber: number;
  blockTitle: string;
  blockTimeLimitMinutes: number;
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanation: string;
  sortOrder: number;
}

export interface AttemptRow {
  id: string;
  examId: string;
  mode: ExamMode;
  blockNumber: number | null;
  questionCount: number;
  timeLimitSeconds: number | null;
  startedAt: string;
  finishedAt: string | null;
  status: AttemptStatus;
  score: number;
  correctCount: number;
  themeName?: string;
  answeredCount?: number;
}

export interface AnswerRow {
  attemptId: string;
  questionId: number;
  selectedOption: string | null;
  isMarked: boolean;
  answeredAt: string;
}
