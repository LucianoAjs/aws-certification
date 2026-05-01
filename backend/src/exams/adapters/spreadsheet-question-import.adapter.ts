import { BadRequestException, Injectable } from '@nestjs/common';
import { ImportedQuestion } from '../domain/exam.types';

const HEADERS = [
  'bloco',
  'titulo_bloco',
  'pergunta',
  'alternativa_a',
  'alternativa_b',
  'alternativa_c',
  'alternativa_d',
  'resposta_correta',
  'explicacao',
  'tempo_bloco_minutos',
];

@Injectable()
export class SpreadsheetQuestionImportAdapter {
  parse(buffer: Buffer): ImportedQuestion[] {
    const text = buffer.toString('utf8').replace(/^\uFEFF/, '');
    const rows = this.parseCsv(text);
    if (!rows.length) {
      throw new BadRequestException('A planilha nao tem linhas de questoes.');
    }

    return rows
      .map((row, index) => this.rowToQuestion(row, index + 2))
      .map((question, index) => ({ ...question, sortOrder: index + 1 }));
  }

  templateBuffer(): Buffer {
    const rows = [
      {
        bloco: 1,
        titulo_bloco: 'IAM essencial',
        pergunta:
          'Uma aplicacao em EC2 precisa acessar objetos no S3 sem credenciais longas. Qual solucao e mais adequada?',
        alternativa_a: 'Salvar access keys em arquivo local na instancia.',
        alternativa_b: 'Anexar uma IAM role a instancia via instance profile.',
        alternativa_c: 'Tornar o bucket publico para leitura anonima.',
        alternativa_d: 'Compartilhar a senha do usuario root com a aplicacao.',
        resposta_correta: 'B',
        explicacao:
          'Roles de EC2 fornecem credenciais temporarias e evitam secrets de longo prazo na instancia.',
        tempo_bloco_minutos: 40,
      },
      {
        bloco: 1,
        titulo_bloco: 'IAM essencial',
        pergunta:
          'Uma policy tem Allow e outra tem Deny explicito para a mesma acao. Qual resultado?',
        alternativa_a: 'O Allow prevalece.',
        alternativa_b: 'O Deny explicito prevalece.',
        alternativa_c: 'Depende da regiao.',
        alternativa_d: 'Depende do nome do usuario.',
        resposta_correta: 'B',
        explicacao: 'Deny explicito sempre prevalece sobre Allow.',
        tempo_bloco_minutos: 40,
      },
    ];
    const csv = [
      HEADERS.join(';'),
      ...rows.map((row) =>
        HEADERS.map((header) =>
          this.escapeCsv(String(row[header as keyof typeof row] ?? '')),
        ).join(';'),
      ),
    ].join('\n');

    return Buffer.from(`\uFEFF${csv}\n`, 'utf8');
  }

  private rowToQuestion(row: Record<string, unknown>, excelLine: number): ImportedQuestion {
    const blockNumber = Number(this.value(row, 'bloco'));
    const blockTimeLimitMinutes = Number(this.value(row, 'tempo_bloco_minutos') || 40);
    const correctOption = this.value(row, 'resposta_correta').toUpperCase();

    const question: ImportedQuestion = {
      blockNumber,
      blockTitle: this.value(row, 'titulo_bloco'),
      blockTimeLimitMinutes,
      prompt: this.value(row, 'pergunta'),
      optionA: this.value(row, 'alternativa_a'),
      optionB: this.value(row, 'alternativa_b'),
      optionC: this.value(row, 'alternativa_c'),
      optionD: this.value(row, 'alternativa_d'),
      correctOption,
      explanation: this.value(row, 'explicacao'),
      sortOrder: 0,
    };

    const missing = Object.entries({
      bloco: Number.isFinite(blockNumber) && blockNumber > 0,
      titulo_bloco: Boolean(question.blockTitle),
      pergunta: Boolean(question.prompt),
      alternativa_a: Boolean(question.optionA),
      alternativa_b: Boolean(question.optionB),
      alternativa_c: Boolean(question.optionC),
      alternativa_d: Boolean(question.optionD),
      resposta_correta: ['A', 'B', 'C', 'D'].includes(correctOption),
      explicacao: Boolean(question.explanation),
      tempo_bloco_minutos:
        Number.isFinite(blockTimeLimitMinutes) && blockTimeLimitMinutes > 0,
    })
      .filter(([, ok]) => !ok)
      .map(([field]) => field);

    if (missing.length) {
      throw new BadRequestException(
        `Linha ${excelLine}: campos invalidos ou ausentes: ${missing.join(', ')}.`,
      );
    }

    return question;
  }

  private value(row: Record<string, unknown>, key: string): string {
    const match = Object.entries(row).find(
      ([column]) => this.normalize(column) === this.normalize(key),
    );
    return String(match?.[1] ?? '').trim();
  }

  private parseCsv(text: string): Record<string, string>[] {
    const matrix = this.csvToMatrix(text);
    if (matrix.length < 2) return [];

    const headers = matrix[0].map((header) => this.normalize(header));
    return matrix
      .slice(1)
      .filter((row) => row.some((cell) => cell.trim()))
      .map((row) =>
        headers.reduce<Record<string, string>>((acc, header, index) => {
          acc[header] = row[index] ?? '';
          return acc;
        }, {}),
      );
  }

  private csvToMatrix(text: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let quoted = false;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const next = text[index + 1];

      if (char === '"' && quoted && next === '"') {
        cell += '"';
        index += 1;
        continue;
      }

      if (char === '"') {
        quoted = !quoted;
        continue;
      }

      if (char === ';' && !quoted) {
        row.push(cell);
        cell = '';
        continue;
      }

      if ((char === '\n' || char === '\r') && !quoted) {
        if (char === '\r' && next === '\n') index += 1;
        row.push(cell);
        rows.push(row);
        row = [];
        cell = '';
        continue;
      }

      cell += char;
    }

    if (cell || row.length) {
      row.push(cell);
      rows.push(row);
    }

    return rows;
  }

  private escapeCsv(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .trim();
  }
}
