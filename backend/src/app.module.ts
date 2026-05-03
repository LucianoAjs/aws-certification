import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ExamsModule } from './exams/exams.module';

@Module({
  imports: [DatabaseModule, AuthModule, ExamsModule],
})
export class AppModule {}
