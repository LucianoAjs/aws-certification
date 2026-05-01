import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { SqliteService } from '../../database/sqlite.service';
import { MarkdownExamAdapter } from '../adapters/markdown-exam.adapter';
import {
  Exam,
  ExamBlock,
  ExamMode,
  ExamQuestion,
  ImportedQuestion,
  Theme,
} from '../domain/exam.types';
import { ExamRepository } from './exam.repository';

interface ThemeRow {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  source_type: string;
  question_count?: number;
  created_at: string;
  updated_at: string;
}

interface QuestionRow {
  id: number;
  block_number: number;
  block_title: string;
  block_time_limit_minutes: number;
  prompt: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation: string;
  sort_order: number;
}

@Injectable()
export class SqliteExamRepository extends ExamRepository {
  constructor(
    private readonly sqlite: SqliteService,
    private readonly markdownAdapter: MarkdownExamAdapter,
  ) {
    super();
  }

  ensureDefaultTheme(): void {
    const defaultTheme = this.markdownAdapter.parseDefaultTheme();
    const theme = this.findTheme(defaultTheme.id);
    if (theme?.questionCount) return;

    if (!theme) {
      this.createTheme({
        id: defaultTheme.id,
        name: defaultTheme.name,
        description: defaultTheme.description,
        color: '#ff9900',
        sourceType: 'markdown',
      });
    }

    this.replaceQuestions(defaultTheme.id, defaultTheme.questions);
  }

  listThemes(): Theme[] {
    const rows = this.sqlite.db
      .prepare(
        `SELECT t.*,
                COUNT(q.id) AS question_count
           FROM themes t
           LEFT JOIN questions q ON q.theme_id = t.id
          GROUP BY t.id
          ORDER BY datetime(t.created_at) ASC`,
      )
      .all() as unknown as ThemeRow[];

    return rows.map((row) => this.mapTheme(row));
  }

  createTheme(input: {
    id?: string;
    name: string;
    description?: string | null;
    color?: string | null;
    sourceType?: string;
  }): Theme {
    const now = new Date().toISOString();
    const id = input.id ?? randomUUID();
    this.sqlite.db
      .prepare(
        `INSERT INTO themes (
           id, name, description, color, source_type, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        input.name,
        input.description ?? null,
        input.color ?? '#147eba',
        input.sourceType ?? 'manual',
        now,
        now,
      );

    const theme = this.findTheme(id);
    if (!theme) throw new NotFoundException('Tema criado, mas nao encontrado.');
    return theme;
  }

  replaceQuestions(themeId: string, questions: ImportedQuestion[]): void {
    this.assertTheme(themeId);
    this.sqlite.db.exec('BEGIN');
    try {
      this.sqlite.db.prepare('DELETE FROM questions WHERE theme_id = ?').run(themeId);
      this.insertQuestions(themeId, questions);
      this.touchTheme(themeId);
      this.sqlite.db.exec('COMMIT');
    } catch (error) {
      this.sqlite.db.exec('ROLLBACK');
      throw error;
    }
  }

  appendQuestions(themeId: string, questions: ImportedQuestion[]): void {
    this.assertTheme(themeId);
    const currentMax =
      (this.sqlite.db
        .prepare('SELECT COALESCE(MAX(sort_order), 0) AS maxSort FROM questions WHERE theme_id = ?')
        .get(themeId) as { maxSort: number }).maxSort ?? 0;
    const normalized = questions.map((question, index) => ({
      ...question,
      sortOrder: currentMax + index + 1,
    }));

    this.sqlite.db.exec('BEGIN');
    try {
      this.insertQuestions(themeId, normalized);
      this.touchTheme(themeId);
      this.sqlite.db.exec('COMMIT');
    } catch (error) {
      this.sqlite.db.exec('ROLLBACK');
      throw error;
    }
  }

  findExam(themeId?: string | null): Exam {
    const theme = themeId ? this.findTheme(themeId) : this.listThemes()[0];
    if (!theme) {
      throw new NotFoundException('Nenhum tema de questoes encontrado.');
    }

    const questions = this.findQuestionsForTheme(theme.id);
    const blocks = this.buildBlocks(questions);
    return {
      id: theme.id,
      title: theme.name,
      description: theme.description,
      sourceType: theme.sourceType,
      totalQuestions: questions.length,
      fullExamTimeLimitMinutes: blocks.length
        ? blocks.reduce((total, block) => total + block.timeLimitMinutes, 0)
        : Math.ceil(questions.length * 2),
      blocks,
      questions,
    };
  }

  findTheme(themeId: string): Theme | null {
    const row = this.sqlite.db
      .prepare(
        `SELECT t.*,
                COUNT(q.id) AS question_count
           FROM themes t
           LEFT JOIN questions q ON q.theme_id = t.id
          WHERE t.id = ?
          GROUP BY t.id`,
      )
      .get(themeId) as ThemeRow | undefined;

    return row ? this.mapTheme(row) : null;
  }

  findQuestionsForAttempt(input: {
    themeId: string;
    mode: ExamMode;
    blockNumber?: number | null;
  }): ExamQuestion[] {
    const questions = this.findQuestionsForTheme(input.themeId);
    if (input.mode === 'block') {
      return questions.filter((question) => question.blockNumber === input.blockNumber);
    }
    return questions;
  }

  findQuestionById(questionId: number): ExamQuestion | null {
    const row = this.sqlite.db
      .prepare(
        `SELECT id,
                block_number,
                block_title,
                block_time_limit_minutes,
                prompt,
                option_a,
                option_b,
                option_c,
                option_d,
                correct_option,
                explanation,
                sort_order
           FROM questions
          WHERE id = ?`,
      )
      .get(questionId) as QuestionRow | undefined;

    return row ? this.mapQuestion(row) : null;
  }

  private findQuestionsForTheme(themeId: string): ExamQuestion[] {
    this.assertTheme(themeId);
    const rows = this.sqlite.db
      .prepare(
        `SELECT id,
                block_number,
                block_title,
                block_time_limit_minutes,
                prompt,
                option_a,
                option_b,
                option_c,
                option_d,
                correct_option,
                explanation,
                sort_order
           FROM questions
          WHERE theme_id = ?
          ORDER BY sort_order ASC, id ASC`,
      )
      .all(themeId) as unknown as QuestionRow[];

    return rows.map((row) => this.mapQuestion(row));
  }

  private insertQuestions(themeId: string, questions: ImportedQuestion[]) {
    const now = new Date().toISOString();
    const statement = this.sqlite.db.prepare(
      `INSERT INTO questions (
         theme_id,
         block_number,
         block_title,
         block_time_limit_minutes,
         prompt,
         option_a,
         option_b,
         option_c,
         option_d,
         correct_option,
         explanation,
         sort_order,
         created_at,
         updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    for (const question of questions) {
      statement.run(
        themeId,
        question.blockNumber,
        question.blockTitle,
        question.blockTimeLimitMinutes,
        question.prompt,
        question.optionA,
        question.optionB,
        question.optionC,
        question.optionD,
        question.correctOption,
        question.explanation,
        question.sortOrder,
        now,
        now,
      );
    }
  }

  private touchTheme(themeId: string) {
    this.sqlite.db
      .prepare('UPDATE themes SET updated_at = ? WHERE id = ?')
      .run(new Date().toISOString(), themeId);
  }

  private assertTheme(themeId: string) {
    if (!this.findTheme(themeId)) {
      throw new NotFoundException('Tema nao encontrado.');
    }
  }

  private buildBlocks(questions: ExamQuestion[]): ExamBlock[] {
    const blocks = new Map<number, ExamBlock>();
    for (const question of questions) {
      const block = blocks.get(question.blockNumber) ?? {
        number: question.blockNumber,
        title: question.blockTitle,
        questionIds: [],
        questionCount: 0,
        timeLimitMinutes: question.blockTimeLimitMinutes,
      };
      block.questionIds.push(question.id);
      block.questionCount = block.questionIds.length;
      blocks.set(block.number, block);
    }
    return [...blocks.values()].sort((a, b) => a.number - b.number);
  }

  private mapTheme(row: ThemeRow): Theme {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      color: row.color,
      sourceType: row.source_type,
      questionCount: Number(row.question_count ?? 0),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapQuestion(row: QuestionRow): ExamQuestion {
    return {
      id: row.id,
      blockNumber: row.block_number,
      blockTitle: row.block_title,
      blockTimeLimitMinutes: row.block_time_limit_minutes,
      prompt: row.prompt,
      options: [
        { key: 'A', text: row.option_a },
        { key: 'B', text: row.option_b },
        { key: 'C', text: row.option_c },
        { key: 'D', text: row.option_d },
      ],
      correctOption: row.correct_option,
      explanation: row.explanation,
      sortOrder: row.sort_order,
    };
  }
}
