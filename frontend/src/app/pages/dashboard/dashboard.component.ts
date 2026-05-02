import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { forkJoin } from 'rxjs';
import {
  AttemptListItem,
  Exam,
  ExamBlock,
  ProgressPayload,
  StudyTheme,
} from '../../core/models/exam.models';
import { ExamApiService } from '../../core/services/exam-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    ChartModule,
    ProgressBarModule,
    TagModule,
    DatePipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ExamApiService);
  private readonly router = inject(Router);

  readonly exam = signal<Exam | null>(null);
  readonly themes = signal<StudyTheme[]>([]);
  readonly selectedThemeId = signal<string | null>(localStorage.getItem('activeThemeId'));
  readonly progress = signal<ProgressPayload | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading.set(true);
    forkJoin({
      themes: this.api.getThemes(),
      progress: this.api.getProgress(),
    }).subscribe({
      next: ({ themes, progress }) => {
        this.themes.set(themes);
        this.progress.set(progress);
        const selectedThemeId =
          themes.find((theme) => theme.id === this.selectedThemeId())?.id ??
          themes[0]?.id ??
          null;
        this.selectedThemeId.set(selectedThemeId);
        if (selectedThemeId) {
          localStorage.setItem('activeThemeId', selectedThemeId);
        }
        this.loadExam(selectedThemeId);
      },
      error: () => this.loading.set(false),
    });
  }

  loadExam(themeId: string | null) {
    this.api.getExam(themeId).subscribe({
      next: (exam) => {
        this.exam.set(exam);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  selectTheme(themeId: string) {
    this.selectedThemeId.set(themeId);
    localStorage.setItem('activeThemeId', themeId);
    this.loading.set(true);
    this.loadExam(themeId);
  }

  startFullExam() {
    this.api.createAttempt('full', undefined, this.selectedThemeId()).subscribe((attempt) => {
      void this.router.navigate(['/simulado', attempt.id]);
    });
  }

  startBlock(block: ExamBlock) {
    this.api.createAttempt('block', block.number, this.selectedThemeId()).subscribe((attempt) => {
      void this.router.navigate(['/simulado', attempt.id]);
    });
  }

  selectedTheme() {
    return this.themes().find((theme) => theme.id === this.selectedThemeId()) ?? null;
  }

  resume(attempt: AttemptListItem) {
    void this.router.navigate(['/simulado', attempt.id]);
  }

  openAttempt(attempt: AttemptListItem) {
    void this.router.navigate(['/simulado', attempt.id]);
  }

  scoreSeverity(score: number): 'success' | 'warn' | 'danger' {
    if (score >= 80) return 'success';
    if (score >= 65) return 'warn';
    return 'danger';
  }
}
