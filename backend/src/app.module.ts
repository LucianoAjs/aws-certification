import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ExamsModule } from './exams/exams.module';

@Module({
  imports: [DatabaseModule, ExamsModule],
})
export class AppModule {}
