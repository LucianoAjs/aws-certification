import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { ImportedQuestion } from '../domain/exam.types';

@Injectable()
export class MarkdownExamAdapter {
  private readonly projectRoot = resolve(__dirname, '..', '..', '..', '..');
  private readonly examFilePath =
    process.env.EXAM_MARKDOWN ??
    join(
      this.projectRoot,
      'aws-study',
      'aws-iam-security-basic-timed-exam-60.md',
    );

  parseDefaultTheme() {
    const raw = readFileSync(this.examFilePath, 'utf8');
    const title =
      raw.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? 'AWS Certification Trainer';
    const [questionArea, answerArea = ''] = raw.split('## Gabarito comentado');
    const answerMap = new Map<number, { correctOption: string; explanation: string }>();

    for (const match of answerArea.matchAll(/^(\d+)\.\s+([A-D])\s+-\s+(.+)$/gm)) {
      answerMap.set(Number(match[1]), {
        correctOption: match[2],
        explanation: match[3].trim(),
      });
    }

    const blockMatches = [
      ...questionArea.matchAll(/^## Bloco\s+(\d+)\s+-\s+(.+)$/gm),
    ];
    const questions: ImportedQuestion[] = [];

    blockMatches.forEach((blockMatch, blockIndex) => {
      const blockNumber = Number(blockMatch[1]);
      const blockTitle = blockMatch[2].trim();
      const blockStart = blockMatch.index! + blockMatch[0].length;
      const blockEnd = blockMatches[blockIndex + 1]?.index ?? questionArea.length;
      const blockText = questionArea.slice(blockStart, blockEnd);
      const questionMatches = [...blockText.matchAll(/^### Questao\s+(\d+)$/gm)];

      questionMatches.forEach((questionMatch, questionIndex) => {
        const sourceQuestionNumber = Number(questionMatch[1]);
        const questionStart = questionMatch.index! + questionMatch[0].length;
        const questionEnd =
          questionMatches[questionIndex + 1]?.index ?? blockText.length;
        const questionText = blockText.slice(questionStart, questionEnd).trim();
        const lines = questionText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);
        const promptLines: string[] = [];
        const options = new Map<string, string>();

        for (const line of lines) {
          const optionMatch = line.match(/^([A-D])\.\s+(.+?)(?:\s{2})?$/);
          if (optionMatch) {
            options.set(optionMatch[1], optionMatch[2].trim());
            continue;
          }
          promptLines.push(line);
        }

        const answer = answerMap.get(sourceQuestionNumber);
        if (!answer) {
          throw new Error(`Gabarito nao encontrado para a questao ${sourceQuestionNumber}.`);
        }

        questions.push({
          blockNumber,
          blockTitle,
          blockTimeLimitMinutes: 40,
          prompt: promptLines.join('\n\n'),
          optionA: options.get('A') ?? '',
          optionB: options.get('B') ?? '',
          optionC: options.get('C') ?? '',
          optionD: options.get('D') ?? '',
          correctOption: answer.correctOption,
          explanation: answer.explanation,
          sortOrder: questions.length + 1,
        });
      });
    });

    return {
      id: 'aws-iam-security-basic-60',
      name: title,
      description: 'Simulado base importado do markdown local.',
      sourceFile: this.examFilePath,
      questions,
    };
  }
}
