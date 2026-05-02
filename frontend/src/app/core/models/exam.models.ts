export type ExamMode = 'full' | 'block';
export type AttemptStatus = 'in_progress' | 'finished';

export interface ExamBlock {
  number: number;
  title: string;
  questionCount: number;
  timeLimitMinutes: number;
}

export interface StudyTheme {
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
  prompt: string;
  options: ExamOption[];
  selectedOption?: string | null;
  correctOption?: string;
  explanation?: string;
  isCorrect?: boolean | null;
  isMarked?: boolean;
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

export interface AttemptState {
  id: string;
  examId: string;
  themeName: string | null;
  mode: ExamMode;
  blockNumber: number | null;
  status: AttemptStatus;
  questionCount: number;
  timeLimitSeconds: number | null;
  timeRemainingSeconds: number | null;
  startedAt: string;
  finishedAt: string | null;
  score: number;
  correctCount: number;
  answeredCount: number;
  questions: ExamQuestion[];
}

export interface AttemptListItem {
  id: string;
  examId: string;
  themeName: string | null;
  mode: ExamMode;
  blockNumber: number | null;
  status: AttemptStatus;
  questionCount: number;
  answeredCount: number;
  timeLimitSeconds: number | null;
  timeRemainingSeconds: number | null;
  startedAt: string;
  finishedAt: string | null;
  score: number;
  correctCount: number;
}

export interface ProgressSummary {
  totalAttempts: number;
  finishedAttempts: number;
  activeAttempt: AttemptListItem | null;
  bestScore: number;
  averageScore: number;
  totalQuestionsAnswered: number;
  lastFinishedAttempt: AttemptListItem | null;
}

export interface ProgressPayload {
  attempts: AttemptListItem[];
  summary: ProgressSummary;
  chartData: {
    scoreHistory: { date: string; score: number }[];
    domainPerformance: { domain: string; averageScore: number }[];
  };
}
