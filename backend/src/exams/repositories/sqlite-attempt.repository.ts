import { Injectable } from '@nestjs/common';
import { SqliteService } from '../../database/sqlite.service';
import { AnswerRow, AttemptRow, ExamMode } from '../domain/exam.types';
import { AttemptRepository } from './attempt.repository';

interface AttemptDbRow {
  id: string;
  exam_id: string;
  mode: ExamMode;
  block_number: number | null;
  question_count: number;
  time_limit_seconds: number | null;
  started_at: string;
  finished_at: string | null;
  status: 'in_progress' | 'finished';
  score: number;
  correct_count: number;
  theme_name?: string;
  answered_count?: number;
}

interface AnswerDbRow {
  attempt_id: string;
  question_id: number;
  selected_option: string | null;
  is_marked: number;
  answered_at: string;
}

@Injectable()
export class SqliteAttemptRepository extends AttemptRepository {
  constructor(private readonly sqlite: SqliteService) {
    super();
  }

  createAttempt(input: {
    id: string;
    themeId: string;
    mode: ExamMode;
    blockNumber: number | null;
    questionCount: number;
    timeLimitSeconds: number | null;
    startedAt: string;
  }): AttemptRow {
    this.sqlite.db
      .prepare(
        `INSERT INTO attempts (
          id, exam_id, mode, block_number, question_count, time_limit_seconds, started_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        input.id,
        input.themeId,
        input.mode,
        input.blockNumber,
        input.questionCount,
        input.timeLimitSeconds,
        input.startedAt,
      );

    return this.findAttempt(input.id)!;
  }

  findAttempt(id: string): AttemptRow | null {
    const row = this.sqlite.db
      .prepare(
        `SELECT a.*,
                t.name AS theme_name,
                (
                  SELECT COUNT(*)
                    FROM answers ans
                   WHERE ans.attempt_id = a.id
                     AND ans.selected_option IS NOT NULL
                ) AS answered_count
           FROM attempts a
           LEFT JOIN themes t ON t.id = a.exam_id
          WHERE a.id = ?`,
      )
      .get(id) as AttemptDbRow | undefined;

    return row ? this.mapAttempt(row) : null;
  }

  listAttempts(): AttemptRow[] {
    const rows = this.sqlite.db
      .prepare(
        `SELECT a.*,
                t.name AS theme_name,
                (
                  SELECT COUNT(*)
                    FROM answers ans
                   WHERE ans.attempt_id = a.id
                     AND ans.selected_option IS NOT NULL
                ) AS answered_count
           FROM attempts a
           LEFT JOIN themes t ON t.id = a.exam_id
          ORDER BY datetime(a.started_at) DESC`,
      )
      .all() as unknown as AttemptDbRow[];

    return rows.map((row) => this.mapAttempt(row));
  }

  listAnswers(attemptId: string): AnswerRow[] {
    const rows = this.sqlite.db
      .prepare(
        `SELECT attempt_id,
                question_id,
                selected_option,
                is_marked,
                answered_at
           FROM answers
          WHERE attempt_id = ?
          ORDER BY question_id`,
      )
      .all(attemptId) as unknown as AnswerDbRow[];

    return rows.map((row) => this.mapAnswer(row));
  }

  upsertAnswer(input: {
    attemptId: string;
    questionId: number;
    selectedOption: string;
    isMarked: boolean;
    answeredAt: string;
  }): void {
    this.sqlite.db
      .prepare(
        `INSERT INTO answers (
           attempt_id, question_id, selected_option, is_marked, answered_at
         ) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(attempt_id, question_id)
         DO UPDATE SET
           selected_option = excluded.selected_option,
           is_marked = excluded.is_marked,
           answered_at = excluded.answered_at`,
      )
      .run(
        input.attemptId,
        input.questionId,
        input.selectedOption,
        input.isMarked ? 1 : 0,
        input.answeredAt,
      );
  }

  markQuestion(input: {
    attemptId: string;
    questionId: number;
    isMarked: boolean;
    answeredAt: string;
  }): void {
    this.sqlite.db
      .prepare(
        `INSERT INTO answers (
           attempt_id, question_id, selected_option, is_marked, answered_at
         ) VALUES (?, ?, NULL, ?, ?)
         ON CONFLICT(attempt_id, question_id)
         DO UPDATE SET
           is_marked = excluded.is_marked,
           answered_at = excluded.answered_at`,
      )
      .run(
        input.attemptId,
        input.questionId,
        input.isMarked ? 1 : 0,
        input.answeredAt,
      );
  }

  finishAttempt(input: {
    attemptId: string;
    finishedAt: string;
    score: number;
    correctCount: number;
  }): AttemptRow | null {
    this.sqlite.db
      .prepare(
        `UPDATE attempts
            SET status = 'finished',
                finished_at = ?,
                score = ?,
                correct_count = ?
          WHERE id = ?`,
      )
      .run(input.finishedAt, input.score, input.correctCount, input.attemptId);

    return this.findAttempt(input.attemptId);
  }

  deleteAll(): void {
    this.sqlite.db.exec('DELETE FROM answers; DELETE FROM attempts;');
  }

  private mapAttempt(row: AttemptDbRow): AttemptRow {
    return {
      id: row.id,
      examId: row.exam_id,
      mode: row.mode,
      blockNumber: row.block_number,
      questionCount: row.question_count,
      timeLimitSeconds: row.time_limit_seconds,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      status: row.status,
      score: row.score,
      correctCount: row.correct_count,
      themeName: row.theme_name,
      answeredCount: Number(row.answered_count ?? 0),
    };
  }

  private mapAnswer(row: AnswerDbRow): AnswerRow {
    return {
      attemptId: row.attempt_id,
      questionId: row.question_id,
      selectedOption: row.selected_option,
      isMarked: Boolean(row.is_marked),
      answeredAt: row.answered_at,
    };
  }
}
