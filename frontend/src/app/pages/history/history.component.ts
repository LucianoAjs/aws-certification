import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { AttemptListItem, ProgressPayload } from '../../core/models/exam.models';
import { ExamApiService } from '../../core/services/exam-api.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, ProgressBarModule, DatePipe],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
})
export class HistoryComponent implements OnInit {
  private readonly api = inject(ExamApiService);
  private readonly router = inject(Router);

  readonly progress = signal<ProgressPayload | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getProgress().subscribe({
      next: (progress) => {
        this.progress.set(progress);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openAttempt(attempt: AttemptListItem) {
    void this.router.navigate(['/simulado', attempt.id]);
  }

  resetProgress() {
    if (!confirm('Apagar todas as tentativas salvas localmente?')) return;
    this.api.resetProgress().subscribe(() => this.load());
  }

  modeLabel(attempt: AttemptListItem): string {
    return attempt.mode === 'full' ? 'Prova completa' : `Bloco ${attempt.blockNumber}`;
  }

  scoreSeverity(score: number): 'success' | 'warn' | 'danger' {
    if (score >= 80) return 'success';
    if (score >= 65) return 'warn';
    return 'danger';
  }
}
