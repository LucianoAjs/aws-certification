import { Test, TestingModule } from '@nestjs/testing';
import { ProgressService } from './progress.service';
import { AttemptRepository } from '../repositories/attempt.repository';
import { AttemptService } from './attempt.service';
import { ExamRepository } from '../repositories/exam.repository';

describe('ProgressService', () => {
  let service: ProgressService;
  let attemptRepository: AttemptRepository;
  let attemptService: AttemptService;
  let examRepository: ExamRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        {
          provide: AttemptRepository,
          useValue: {
            listAttempts: jest.fn(),
            listAnswers: jest.fn(),
          },
        },
        {
          provide: AttemptService,
          useValue: {
            toAttemptListItem: jest.fn(),
          },
        },
        {
          provide: ExamRepository,
          useValue: {
            findQuestionById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
    attemptRepository = module.get<AttemptRepository>(AttemptRepository);
    attemptService = module.get<AttemptService>(AttemptService);
    examRepository = module.get<ExamRepository>(ExamRepository);
  });

  it('should return progress with chartData', async () => {
    const mockAttempts = [
      {
        id: '1',
        status: 'finished',
        mode: 'block',
        score: 80,
        finishedAt: '2026-05-01T10:00:00Z',
        examId: 'aws-iam',
      },
    ];

    (attemptRepository.listAttempts as jest.Mock).mockResolvedValue(mockAttempts);
    (attemptService.toAttemptListItem as jest.Mock).mockImplementation((a) => a);

    (attemptRepository.listAnswers as jest.Mock).mockResolvedValue([
      { questionId: 101, selectedOption: 'A' },
      { questionId: 102, selectedOption: 'B' },
    ]);

    (examRepository.findQuestionById as jest.Mock).mockImplementation((_userId, id) => {
      if (id === 101) return { blockTitle: 'IAM', correctOption: 'A' };
      if (id === 102) return { blockTitle: 'S3', correctOption: 'A' };
      return null;
    });

    const result = (await service.getProgress('local-user')) as any;

    expect(result.summary).toBeDefined();
    expect(result.summary.finishedFullAttempts).toBe(0);
    expect(result.summary.finishedBlockAttempts).toBe(1);
    expect(result.chartData).toBeDefined();
    expect(result.chartData.scoreHistory).toContainEqual({
      date: '2026-05-01',
      score: 80,
    });
    expect(result.chartData.domainPerformance).toContainEqual({
      domain: 'IAM',
      averageScore: 100,
    });
    expect(result.chartData.domainPerformance).toContainEqual({
      domain: 'S3',
      averageScore: 0,
    });
  });
});
