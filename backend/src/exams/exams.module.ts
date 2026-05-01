import { Module } from '@nestjs/common';
import { MarkdownExamAdapter } from './adapters/markdown-exam.adapter';
import { SpreadsheetQuestionImportAdapter } from './adapters/spreadsheet-question-import.adapter';
import { AttemptsController } from './controllers/attempts.controller';
import { ExamsController } from './controllers/exams.controller';
import { ProgressController } from './controllers/progress.controller';
import { AttemptRepository } from './repositories/attempt.repository';
import { ExamRepository } from './repositories/exam.repository';
import { SqliteAttemptRepository } from './repositories/sqlite-attempt.repository';
import { SqliteExamRepository } from './repositories/sqlite-exam.repository';
import { AttemptService } from './services/attempt.service';
import { ExamService } from './services/exam.service';
import { ProgressService } from './services/progress.service';

@Module({
  controllers: [ExamsController, AttemptsController, ProgressController],
  providers: [
    MarkdownExamAdapter,
    SpreadsheetQuestionImportAdapter,
    ExamService,
    AttemptService,
    ProgressService,
    { provide: ExamRepository, useClass: SqliteExamRepository },
    { provide: AttemptRepository, useClass: SqliteAttemptRepository },
  ],
})
export class ExamsModule {}
