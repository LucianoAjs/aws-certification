import { Controller, Delete, Get, HttpCode, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { AuthUser } from '../../auth/auth.types';
import { CurrentUser } from '../../auth/current-user.decorator';
import { ProgressService } from '../services/progress.service';

@Controller('progress')
@UseGuards(AuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  getProgress(@CurrentUser() user: AuthUser) {
    return this.progressService.getProgress(user.id);
  }

  @Delete()
  @HttpCode(204)
  async resetProgress(@CurrentUser() user: AuthUser) {
    await this.progressService.reset(user.id);
  }
}
