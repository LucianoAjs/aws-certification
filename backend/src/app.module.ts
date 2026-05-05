import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ExamsModule } from './exams/exams.module';

@Module({
  imports: [DatabaseModule, AuthModule, ExamsModule],
  controllers: [AppController],
})
export class AppModule {}
