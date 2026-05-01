import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { StudyTheme } from '../../core/models/exam.models';
import { ExamApiService } from '../../core/services/exam-api.service';

@Component({
  selector: 'app-themes',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TagModule],
  templateUrl: './themes.component.html',
  styleUrl: './themes.component.scss',
})
export class ThemesComponent implements OnInit {
  private readonly api = inject(ExamApiService);
  private readonly router = inject(Router);

  readonly themes = signal<StudyTheme[]>([]);
  readonly selectedThemeId = signal<string | null>(localStorage.getItem('activeThemeId'));
  readonly loading = signal(false);
  readonly message = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  newThemeName = '';
  newThemeDescription = '';
  replaceExisting = true;
  selectedFile: File | null = null;

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getThemes().subscribe({
      next: (themes) => {
        this.themes.set(themes);
        const selected =
          themes.find((theme) => theme.id === this.selectedThemeId())?.id ??
          themes[0]?.id ??
          null;
        this.selectTheme(selected);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Nao consegui carregar os temas.');
        this.loading.set(false);
      },
    });
  }

  selectTheme(themeId: string | null) {
    this.selectedThemeId.set(themeId);
    if (themeId) {
      localStorage.setItem('activeThemeId', themeId);
    }
  }

  selectedTheme() {
    return this.themes().find((theme) => theme.id === this.selectedThemeId()) ?? null;
  }

  createTheme() {
    const name = this.newThemeName.trim();
    if (!name) {
      this.error.set('Informe um nome para o tema.');
      return;
    }

    this.loading.set(true);
    this.clearMessages();
    this.api
      .createTheme({
        name,
        description: this.newThemeDescription.trim() || undefined,
        color: '#147eba',
      })
      .subscribe({
        next: (theme) => {
          this.newThemeName = '';
          this.newThemeDescription = '';
          this.message.set('Tema criado. Agora voce pode enviar a planilha.');
          this.load();
          this.selectTheme(theme.id);
        },
        error: (err) => {
          this.error.set(err?.error?.message || 'Nao foi possivel criar o tema.');
          this.loading.set(false);
        },
      });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  uploadQuestions() {
    const themeId = this.selectedThemeId();
    if (!themeId) {
      this.error.set('Selecione um tema antes de enviar a planilha.');
      return;
    }
    if (!this.selectedFile) {
      this.error.set('Selecione um arquivo .csv.');
      return;
    }

    this.loading.set(true);
    this.clearMessages();
    this.api
      .uploadQuestions(themeId, this.selectedFile, this.replaceExisting)
      .subscribe({
        next: (result) => {
          this.message.set(`${result.importedQuestions} questoes importadas.`);
          this.selectedFile = null;
          this.load();
          this.selectTheme(themeId);
        },
        error: (err) => {
          this.error.set(err?.error?.message || 'Nao foi possivel importar a planilha.');
          this.loading.set(false);
        },
      });
  }

  downloadTemplate() {
    this.api.downloadTemplate().subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'modelo-questoes.csv';
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  startSelectedTheme() {
    const themeId = this.selectedThemeId();
    if (!themeId) return;
    localStorage.setItem('activeThemeId', themeId);
    void this.router.navigate(['/simulado']);
  }

  private clearMessages() {
    this.message.set(null);
    this.error.set(null);
  }
}
