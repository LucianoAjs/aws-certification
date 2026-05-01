import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { existsSync, mkdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { join, resolve } from 'node:path';

@Injectable()
export class SqliteService implements OnModuleDestroy {
  readonly databasePath: string;
  readonly projectRoot = resolve(__dirname, '..', '..', '..');
  private readonly database: DatabaseSync;

  constructor() {
    const dataDir = join(this.projectRoot, 'backend', 'data');
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }

    this.databasePath = process.env.SQLITE_PATH ?? join(dataDir, 'trainer.sqlite');
    this.database = new DatabaseSync(this.databasePath);
    this.migrate();
  }

  get db(): DatabaseSync {
    return this.database;
  }

  onModuleDestroy() {
    this.database.close();
  }

  private migrate() {
    this.database.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS themes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT,
        source_type TEXT NOT NULL DEFAULT 'manual',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        theme_id TEXT NOT NULL,
        block_number INTEGER NOT NULL,
        block_title TEXT NOT NULL,
        block_time_limit_minutes INTEGER NOT NULL DEFAULT 40,
        prompt TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_option TEXT NOT NULL,
        explanation TEXT NOT NULL,
        sort_order INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_questions_theme_sort
        ON questions(theme_id, sort_order);

      CREATE TABLE IF NOT EXISTS attempts (
        id TEXT PRIMARY KEY,
        exam_id TEXT NOT NULL,
        mode TEXT NOT NULL,
        block_number INTEGER,
        question_count INTEGER NOT NULL,
        time_limit_seconds INTEGER,
        started_at TEXT NOT NULL,
        finished_at TEXT,
        status TEXT NOT NULL DEFAULT 'in_progress',
        score INTEGER NOT NULL DEFAULT 0,
        correct_count INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (exam_id) REFERENCES themes(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS answers (
        attempt_id TEXT NOT NULL,
        question_id INTEGER NOT NULL,
        selected_option TEXT,
        is_marked INTEGER NOT NULL DEFAULT 0,
        answered_at TEXT NOT NULL,
        PRIMARY KEY (attempt_id, question_id),
        FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE
      );
    `);
  }
}
