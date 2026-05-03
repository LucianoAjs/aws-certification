import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MarkdownExamAdapter } from './adapters/markdown-exam.adapter';
import { SpreadsheetQuestionImportAdapter } from './adapters/spreadsheet-question-import.adapter';
import { AttemptsController } from './controllers/attempts.controller';
import { ExamsController } from './controllers/exams.controller';
import { ProgressController } from './controllers/progress.controller';
import { AttemptRepository } from './repositories/attempt.repository';
import { ExamRepository } from './repositories/exam.repository';
import { PrismaAttemptRepository } from './repositories/prisma-attempt.repository';
import { PrismaExamRepository } from './repositories/prisma-exam.repository';
import { AttemptService } from './services/attempt.service';
import { ExamService } from './services/exam.service';
import { ProgressService } from './services/progress.service';

@Module({
  imports: [AuthModule],
  controllers: [ExamsController, AttemptsController, ProgressController],
  providers: [
    MarkdownExamAdapter,
    SpreadsheetQuestionImportAdapter,
    ExamService,
    AttemptService,
    ProgressService,
    { provide: ExamRepository, useClass: PrismaExamRepository },
    { provide: AttemptRepository, useClass: PrismaAttemptRepository },
  ],
})
export class ExamsModule {}
