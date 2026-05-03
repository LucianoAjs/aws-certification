import {
  Body,
  Controller,
  Get,
  Header,
  Patch,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { AuthGuard } from '../../auth/auth.guard';
import { AuthUser } from '../../auth/auth.types';
import { CurrentUser } from '../../auth/current-user.decorator';
import { CreateThemeDto } from '../dto/create-theme.dto';
import { UpdateThemeSharingDto } from '../dto/update-theme-sharing.dto';
import { UploadQuestionsDto } from '../dto/upload-questions.dto';
import { ExamService } from '../services/exam.service';

@Controller()
export class ExamsController {
  constructor(private readonly examService: ExamService) {}

  @Get('health')
  health() {
    return { ok: true, runtime: 'nestjs', architecture: 'mvc-repository-adapters' };
  }

  @Get('exam')
  @UseGuards(AuthGuard)
  getExam(@CurrentUser() user: AuthUser, @Query('themeId') themeId?: string) {
    return this.examService.getPublicExam(user.id, themeId);
  }

  @Get('themes')
  @UseGuards(AuthGuard)
  listThemes(@CurrentUser() user: AuthUser) {
    return this.examService.listThemes(user.id);
  }

  @Post('themes')
  @UseGuards(AuthGuard)
  createTheme(@CurrentUser() user: AuthUser, @Body() dto: CreateThemeDto) {
    return this.examService.createTheme(user.id, dto);
  }

  @Patch('themes/:themeId/sharing')
  @UseGuards(AuthGuard)
  updateSharing(
    @CurrentUser() user: AuthUser,
    @Param('themeId') themeId: string,
    @Body() dto: UpdateThemeSharingDto,
  ) {
    return this.examService.updateSharing(user.id, themeId, dto);
  }

  @Get('import-template')
  @UseGuards(AuthGuard)
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="modelo-questoes.csv"')
  downloadTemplate(@Res({ passthrough: true }) response: Response) {
    const buffer = this.examService.templateBuffer();
    response.setHeader('Content-Length', buffer.length);
    return new StreamableFile(buffer);
  }

  @Post('themes/:themeId/upload')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadQuestions(
    @CurrentUser() user: AuthUser,
    @Param('themeId') themeId: string,
    @UploadedFile() file: { buffer: Buffer } | undefined,
    @Body() dto: UploadQuestionsDto,
  ) {
    return this.examService.importQuestions({
      userId: user.id,
      themeId,
      file,
      replace: dto.replace !== 'false',
    });
  }
}
