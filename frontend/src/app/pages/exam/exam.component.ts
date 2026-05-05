import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { forkJoin, of } from 'rxjs';
import {
  AttemptState,
  Exam,
  ExamMode,
  ExamQuestion,
  ProgressPayload,
  StudyTheme,
} from '../../core/models/exam.models';
import { AuthService } from '../../core/services/auth.service';
import { ExamApiService } from '../../core/services/exam-api.service';

@Component({
  selector: 'app-exam',
  standalone: true,
  imports: [CommonModule, ButtonModule, ProgressBarModule, TagModule],
  templateUrl: './exam.component.html',
  styleUrl: './exam.component.scss',
})
export class ExamComponent implements OnInit, OnDestroy {
  private readonly api = inject(ExamApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly auth = inject(AuthService);

  readonly exam = signal<Exam | null>(null);
  readonly themes = signal<StudyTheme[]>([]);
  readonly selectedThemeId = signal<string | null>(this.auth.getActiveThemeId());
  readonly progress = signal<ProgressPayload | null>(null);
  readonly attempt = signal<AttemptState | null>(null);
  readonly selectedMode = signal<ExamMode>('full');
  readonly selectedBlockNumber = signal(1);
  readonly currentIndex = signal(0);
  readonly loading = signal(true);
  readonly savingQuestionId = signal<number | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly timeRemainingSeconds = signal<number | null>(null);

  private timerId: ReturnType<typeof setInterval> | null = null;
  private readonly pauseOnPageExit = () => this.pauseAttemptBeforeLeaving();

  readonly currentQuestion = computed(() => {
    const attempt = this.attempt();
    return attempt?.questions[this.currentIndex()] ?? null;
  });

  readonly answeredPercent = computed(() => {
    const attempt = this.attempt();
    if (!attempt?.questionCount) return 0;
    return Math.round((attempt.answeredCount / attempt.questionCount) * 100);
  });

  ngOnInit(): void {
    window.addEventListener('pagehide', this.pauseOnPageExit);
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const attemptId = params.get('id');
      this.bootstrap(attemptId);
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('pagehide', this.pauseOnPageExit);
    this.pauseAttemptBeforeLeaving();
    this.stopTimer();
  }

  bootstrap(attemptId: string | null) {
    this.loading.set(true);
    this.errorMessage.set(null);
    forkJoin({
      themes: this.api.getThemes(),
      progress: this.api.getProgress(),
      attempt: attemptId ? this.api.getAttempt(attemptId) : of(null),
    }).subscribe({
      next: ({ themes, progress, attempt }) => {
        this.themes.set(themes);
        this.progress.set(progress);
        this.attempt.set(attempt);
        const themeId =
          attempt?.examId ??
          themes.find((theme) => theme.id === this.selectedThemeId())?.id ??
          themes[0]?.id ??
          null;
        this.selectedThemeId.set(themeId);
        if (themeId) {
          this.auth.setActiveThemeId(themeId);
        }
        this.currentIndex.set(0);
        this.syncTimer(attempt);
        this.loadExam(themeId);
      },
      error: () => {
        this.errorMessage.set('Nao consegui carregar o simulado. Confira se o backend esta rodando.');
        this.loading.set(false);
      },
    });
  }

  loadExam(themeId: string | null) {
    this.api.getExam(themeId).subscribe({
      next: (exam) => {
        this.exam.set(exam);
        this.selectedBlockNumber.set(exam.blocks[0]?.number ?? 1);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Nao consegui carregar as questoes deste tema.');
        this.loading.set(false);
      },
    });
  }

  startAttempt() {
    this.loading.set(true);
    this.api
      .createAttempt(
        this.selectedMode(),
        this.selectedMode() === 'block' ? this.selectedBlockNumber() : undefined,
        this.selectedThemeId(),
      )
      .subscribe({
        next: (attempt) => {
          void this.router.navigate(['/simulado', attempt.id]);
        },
        error: () => {
          this.errorMessage.set('Nao foi possivel iniciar uma tentativa.');
          this.loading.set(false);
        },
      });
  }

  selectMode(mode: ExamMode) {
    this.selectedMode.set(mode);
  }

  selectBlock(blockNumber: number) {
    this.selectedBlockNumber.set(blockNumber);
    this.selectedMode.set('block');
  }

  selectTheme(themeId: string) {
    this.selectedThemeId.set(themeId);
    this.auth.setActiveThemeId(themeId);
    this.loading.set(true);
    this.loadExam(themeId);
  }

  selectedTheme() {
    return this.themes().find((theme) => theme.id === this.selectedThemeId()) ?? null;
  }

  goToQuestion(index: number) {
    const attempt = this.attempt();
    if (!attempt) return;
    if (index < 0 || index >= attempt.questions.length) return;
    this.currentIndex.set(index);
  }

  nextQuestion() {
    this.goToQuestion(this.currentIndex() + 1);
  }

  previousQuestion() {
    this.goToQuestion(this.currentIndex() - 1);
  }

  saveAnswer(question: ExamQuestion, selectedOption: string) {
    const attempt = this.attempt();
    if (!attempt || attempt.status !== 'in_progress' || attempt.isTimerPaused) return;

    this.savingQuestionId.set(question.id);
    this.api
      .saveAnswer(attempt.id, question.id, selectedOption, question.isMarked === true)
      .subscribe({
        next: (updated) => {
          this.mergeAttempt(updated);
          this.savingQuestionId.set(null);
        },
        error: () => {
          this.errorMessage.set('Nao consegui salvar a resposta.');
          this.savingQuestionId.set(null);
        },
      });
  }

  toggleMark(question: ExamQuestion) {
    const attempt = this.attempt();
    if (!attempt || attempt.status !== 'in_progress' || attempt.isTimerPaused) return;

    this.api.markQuestion(attempt.id, question.id, question.isMarked !== true).subscribe({
      next: (updated) => this.mergeAttempt(updated),
      error: () => this.errorMessage.set('Nao consegui marcar a questao.'),
    });
  }

  finishAttempt(confirmBeforeFinish = true) {
    const attempt = this.attempt();
    if (!attempt) return;

    const shouldFinish =
      attempt.status === 'finished' ||
      !confirmBeforeFinish ||
      confirm('Finalizar tentativa e abrir o gabarito comentado?');
    if (!shouldFinish) return;

    this.loading.set(true);
    this.api.finishAttempt(attempt.id).subscribe({
      next: (updated) => {
        this.mergeAttempt(updated);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Nao foi possivel finalizar a tentativa.');
        this.loading.set(false);
      },
    });
  }

  pauseAttempt() {
    const attempt = this.attempt();
    if (!attempt || attempt.status !== 'in_progress' || attempt.isTimerPaused) return;

    this.api.pauseAttempt(attempt.id).subscribe({
      next: (updated) => this.mergeAttempt(updated),
      error: () => this.errorMessage.set('Nao consegui pausar a tentativa.'),
    });
  }

  resumeAttempt() {
    const attempt = this.attempt();
    if (!attempt || attempt.status !== 'in_progress' || !attempt.isTimerPaused) return;

    this.api.resumeAttempt(attempt.id).subscribe({
      next: (updated) => this.mergeAttempt(updated),
      error: () => this.errorMessage.set('Nao consegui retomar a tentativa.'),
    });
  }

  newAttempt() {
    this.attempt.set(null);
    this.stopTimer();
    void this.router.navigate(['/simulado']);
  }

  questionStatus(question: ExamQuestion, index: number) {
    if (this.currentIndex() === index) return 'current';

    const attempt = this.attempt();
    if (attempt?.status === 'finished') {
      if (!question.selectedOption) return 'blank';
      return question.isCorrect ? 'correct' : 'wrong';
    }

    if (question.isMarked) return 'marked';
    if (question.selectedOption) return 'answered';
    return 'blank';
  }

  optionClass(question: ExamQuestion, optionKey: string) {
    const attempt = this.attempt();
    if (attempt?.status !== 'finished') {
      return question.selectedOption === optionKey ? 'is-selected' : '';
    }

    if (question.correctOption === optionKey) return 'is-correct';
    if (question.selectedOption === optionKey && question.correctOption !== optionKey) {
      return 'is-wrong';
    }
    return '';
  }

  promptParagraphs(prompt: string): string[] {
    return prompt.split(/\n{2,}/).filter(Boolean);
  }

  formatSeconds(totalSeconds: number | null): string {
    if (totalSeconds === null) return '--:--';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  scoreSeverity(score: number): 'success' | 'warn' | 'danger' {
    if (score >= 80) return 'success';
    if (score >= 65) return 'warn';
    return 'danger';
  }

  private mergeAttempt(updated: AttemptState) {
    const currentQuestionId = this.currentQuestion()?.id;
    this.attempt.set(updated);
    if (currentQuestionId) {
      const nextIndex = updated.questions.findIndex((item) => item.id === currentQuestionId);
      this.currentIndex.set(nextIndex >= 0 ? nextIndex : 0);
    }
    this.syncTimer(updated);
  }

  private syncTimer(attempt: AttemptState | null) {
    this.stopTimer();
    this.timeRemainingSeconds.set(attempt?.timeRemainingSeconds ?? null);

    if (
      !attempt ||
      attempt.status !== 'in_progress' ||
      attempt.isTimerPaused ||
      attempt.timeRemainingSeconds === null
    ) {
      return;
    }

    this.timerId = setInterval(() => {
      const next = Math.max(0, (this.timeRemainingSeconds() ?? 0) - 1);
      this.timeRemainingSeconds.set(next);
      if (next === 0) {
        this.stopTimer();
        this.finishAttempt(false);
      }
    }, 1000);
  }

  private stopTimer() {
    if (!this.timerId) return;
    clearInterval(this.timerId);
    this.timerId = null;
  }

  private pauseAttemptBeforeLeaving() {
    const attempt = this.attempt();
    if (!attempt || attempt.status !== 'in_progress' || attempt.isTimerPaused) return;

    this.stopTimer();
    const token = this.auth.token();
    if (!token) return;

    void fetch(`/api/attempts/${attempt.id}/pause`, {
      method: 'POST',
      keepalive: true,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    });
  }
}
