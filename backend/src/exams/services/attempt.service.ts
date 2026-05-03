import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AnswerRow, AttemptRow, ExamQuestion } from '../domain/exam.types';
import { CreateAttemptDto } from '../dto/create-attempt.dto';
import { MarkQuestionDto } from '../dto/mark-question.dto';
import { SaveAnswerDto } from '../dto/save-answer.dto';
import { AttemptRepository } from '../repositories/attempt.repository';
import { ExamRepository } from '../repositories/exam.repository';

@Injectable()
export class AttemptService {
  constructor(
    private readonly attemptRepository: AttemptRepository,
    private readonly examRepository: ExamRepository,
  ) {}

  async createAttempt(userId: string, dto: CreateAttemptDto) {
    const exam = await this.examRepository.findExam(userId, dto.themeId);
    const block =
      dto.mode === 'block'
        ? exam.blocks.find((item) => item.number === dto.blockNumber)
        : null;

    if (dto.mode === 'block' && !block) {
      throw new BadRequestException('Bloco invalido para este tema.');
    }

    const questionCount = dto.mode === 'block' ? block!.questionCount : exam.totalQuestions;
    if (!questionCount) {
      throw new BadRequestException('Este tema ainda nao tem questoes.');
    }

    const timeLimitSeconds =
      (dto.mode === 'block'
        ? block!.timeLimitMinutes
        : exam.fullExamTimeLimitMinutes) * 60;

    const attempt = await this.attemptRepository.createAttempt({
      id: randomUUID(),
      userId,
      themeId: exam.id,
      mode: dto.mode,
      blockNumber: dto.mode === 'block' ? block!.number : null,
      questionCount,
      timeLimitSeconds,
      startedAt: new Date().toISOString(),
    });

    return this.attemptPayload(attempt);
  }

  async getAttempt(userId: string, id: string) {
    return this.attemptPayload(await this.requireAttempt(userId, id));
  }

  async reviewAttempt(userId: string, id: string) {
    const attempt = await this.requireAttempt(userId, id);
    const finished = attempt.status === 'finished' ? attempt : await this.finishAttemptRow(attempt);
    return this.attemptPayload(finished, true);
  }

  async saveAnswer(userId: string, attemptId: string, questionId: number, dto: SaveAnswerDto) {
    const attempt = await this.ensureAttemptFresh(await this.requireAttempt(userId, attemptId));
    this.assertInProgress(attempt);
    const question = await this.assertQuestionInAttempt(attempt, questionId);

    if (!question.options.some((option) => option.key === dto.selectedOption)) {
      throw new BadRequestException('Alternativa invalida.');
    }

    await this.attemptRepository.upsertAnswer({
      attemptId,
      questionId,
      selectedOption: dto.selectedOption,
      isMarked: dto.isMarked,
      answeredAt: new Date().toISOString(),
    });

    return this.attemptPayload(await this.requireAttempt(userId, attemptId));
  }

  async markQuestion(userId: string, attemptId: string, questionId: number, dto: MarkQuestionDto) {
    const attempt = await this.ensureAttemptFresh(await this.requireAttempt(userId, attemptId));
    this.assertInProgress(attempt);
    await this.assertQuestionInAttempt(attempt, questionId);

    await this.attemptRepository.markQuestion({
      attemptId,
      questionId,
      isMarked: dto.isMarked,
      answeredAt: new Date().toISOString(),
    });

    return this.attemptPayload(await this.requireAttempt(userId, attemptId));
  }

  async finishAttempt(userId: string, id: string) {
    return this.attemptPayload(await this.finishAttemptRow(await this.requireAttempt(userId, id)), true);
  }

  async ensureAttemptFresh(attempt: AttemptRow): Promise<AttemptRow> {
    if (
      attempt.status === 'in_progress' &&
      attempt.timeLimitSeconds &&
      this.secondsRemaining(attempt) === 0
    ) {
      return this.finishAttemptRow(attempt);
    }

    return attempt;
  }

  async toAttemptListItem(attempt: AttemptRow) {
    const fresh = await this.ensureAttemptFresh(attempt);
    return {
      id: fresh.id,
      examId: fresh.examId,
      userId: fresh.userId,
      themeName: fresh.themeName ?? null,
      mode: fresh.mode,
      blockNumber: fresh.blockNumber,
      status: fresh.status,
      questionCount: fresh.questionCount,
      answeredCount: fresh.answeredCount ?? (await this.answeredCount(fresh.id)),
      timeLimitSeconds: fresh.timeLimitSeconds,
      timeRemainingSeconds: this.secondsRemaining(fresh),
      startedAt: fresh.startedAt,
      finishedAt: fresh.finishedAt,
      score: fresh.score,
      correctCount: fresh.correctCount,
    };
  }

  private async attemptPayload(attempt: AttemptRow, includeReview = false) {
    const fresh = await this.ensureAttemptFresh(attempt);
    const questions = await this.examRepository.findQuestionsForAttempt({
      themeId: fresh.examId,
      userId: fresh.userId,
      mode: fresh.mode,
      blockNumber: fresh.blockNumber,
    });
    const answers = new Map(
      (await this.attemptRepository
        .listAnswers(fresh.id)
      ).map((answer) => [answer.questionId, answer]),
    );
    const reviewMode = includeReview || fresh.status === 'finished';

    return {
      id: fresh.id,
      examId: fresh.examId,
      themeName:
        fresh.themeName ?? (await this.examRepository.findTheme(fresh.examId, fresh.userId))?.name ?? null,
      mode: fresh.mode,
      blockNumber: fresh.blockNumber,
      status: fresh.status,
      questionCount: fresh.questionCount,
      timeLimitSeconds: fresh.timeLimitSeconds,
      timeRemainingSeconds: this.secondsRemaining(fresh),
      startedAt: fresh.startedAt,
      finishedAt: fresh.finishedAt,
      score: fresh.score,
      correctCount: fresh.correctCount,
      answeredCount: [...answers.values()].filter((answer) => answer.selectedOption).length,
      questions: questions.map((question) =>
        this.questionPayload(question, answers.get(question.id), reviewMode),
      ),
    };
  }

  private questionPayload(
    question: ExamQuestion,
    answer: AnswerRow | undefined,
    includeReview: boolean,
  ) {
    const base = {
      id: question.id,
      blockNumber: question.blockNumber,
      blockTitle: question.blockTitle,
      prompt: question.prompt,
      options: question.options,
      selectedOption: answer?.selectedOption ?? null,
      isMarked: answer?.isMarked ?? false,
      isCorrect:
        includeReview && answer?.selectedOption
          ? answer.selectedOption === question.correctOption
          : null,
    };

    if (!includeReview) return base;

    return {
      ...base,
      correctOption: question.correctOption,
      explanation: question.explanation,
    };
  }

  private async finishAttemptRow(attempt: AttemptRow): Promise<AttemptRow> {
    if (attempt.status === 'finished') return attempt;

    const questions = await this.examRepository.findQuestionsForAttempt({
      themeId: attempt.examId,
      userId: attempt.userId,
      mode: attempt.mode,
      blockNumber: attempt.blockNumber,
    });
    const answers = new Map(
      (await this.attemptRepository
        .listAnswers(attempt.id)
      ).map((answer) => [answer.questionId, answer.selectedOption]),
    );
    const correctCount = questions.reduce(
      (total, question) =>
        total + (answers.get(question.id) === question.correctOption ? 1 : 0),
      0,
    );
    const score = Math.round((correctCount / questions.length) * 100);

    const finished = await this.attemptRepository.finishAttempt({
      userId: attempt.userId,
      attemptId: attempt.id,
      finishedAt: new Date().toISOString(),
      score,
      correctCount,
    });

    if (!finished) {
      throw new NotFoundException('Tentativa nao encontrada.');
    }

    return finished;
  }

  private async assertQuestionInAttempt(attempt: AttemptRow, questionId: number) {
    const questions = await this.examRepository.findQuestionsForAttempt({
      themeId: attempt.examId,
      userId: attempt.userId,
      mode: attempt.mode,
      blockNumber: attempt.blockNumber,
    });
    const question = questions.find((item) => item.id === questionId);
    if (!question) {
      throw new BadRequestException('Questao fora desta tentativa.');
    }
    return question;
  }

  private assertInProgress(attempt: AttemptRow) {
    if (attempt.status !== 'in_progress') {
      throw new ConflictException('Esta tentativa ja foi finalizada.');
    }
  }

  private async requireAttempt(userId: string, id: string): Promise<AttemptRow> {
    const attempt = await this.attemptRepository.findAttempt(userId, id);
    if (!attempt) {
      throw new NotFoundException('Tentativa nao encontrada.');
    }
    return attempt;
  }

  private secondsRemaining(attempt: AttemptRow): number | null {
    if (!attempt.timeLimitSeconds || attempt.status !== 'in_progress') {
      return null;
    }

    const startedAt = new Date(attempt.startedAt).getTime();
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    return Math.max(0, attempt.timeLimitSeconds - elapsed);
  }

  private async answeredCount(attemptId: string): Promise<number> {
    return (await this.attemptRepository.listAnswers(attemptId)).filter(
      (answer) => answer.selectedOption,
    ).length;
  }
}
