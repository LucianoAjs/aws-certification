import { Controller, Delete, Get, HttpCode } from '@nestjs/common';
import { ProgressService } from '../services/progress.service';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  getProgress() {
    return this.progressService.getProgress();
  }

  @Delete()
  @HttpCode(204)
  resetProgress() {
    this.progressService.reset();
  }
}
