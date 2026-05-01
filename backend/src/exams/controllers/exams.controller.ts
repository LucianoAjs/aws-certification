import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { CreateThemeDto } from '../dto/create-theme.dto';
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
  getExam(@Query('themeId') themeId?: string) {
    return this.examService.getPublicExam(themeId);
  }

  @Get('themes')
  listThemes() {
    return this.examService.listThemes();
  }

  @Post('themes')
  createTheme(@Body() dto: CreateThemeDto) {
    return this.examService.createTheme(dto);
  }

  @Get('import-template')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="modelo-questoes.csv"')
  downloadTemplate(@Res({ passthrough: true }) response: Response) {
    const buffer = this.examService.templateBuffer();
    response.setHeader('Content-Length', buffer.length);
    return new StreamableFile(buffer);
  }

  @Post('themes/:themeId/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadQuestions(
    @Param('themeId') themeId: string,
    @UploadedFile() file: { buffer: Buffer } | undefined,
    @Body() dto: UploadQuestionsDto,
  ) {
    return this.examService.importQuestions({
      themeId,
      file,
      replace: dto.replace !== 'false',
    });
  }
}
