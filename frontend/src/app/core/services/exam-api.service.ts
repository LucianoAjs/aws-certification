import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  AttemptState,
  Exam,
  ExamMode,
  ProgressPayload,
  StudyTheme,
} from '../models/exam.models';

@Injectable({ providedIn: 'root' })
export class ExamApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api';

  getExam(themeId?: string | null) {
    const options = themeId ? { params: { themeId } } : undefined;
    return this.http.get<Exam>(`${this.apiUrl}/exam`, options);
  }

  getThemes() {
    return this.http.get<StudyTheme[]>(`${this.apiUrl}/themes`);
  }

  createTheme(input: { name: string; description?: string; color?: string; isShared?: boolean }) {
    return this.http.post<StudyTheme>(`${this.apiUrl}/themes`, input);
  }

  updateThemeSharing(themeId: string, isShared: boolean) {
    return this.http.patch<StudyTheme>(`${this.apiUrl}/themes/${themeId}/sharing`, {
      isShared,
    });
  }

  uploadQuestions(themeId: string, file: File, replace: boolean) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('replace', String(replace));
    return this.http.post<{
      theme: StudyTheme;
      importedQuestions: number;
      mode: 'replace' | 'append';
    }>(`${this.apiUrl}/themes/${themeId}/upload`, formData);
  }

  downloadTemplate() {
    return this.http.get(`${this.apiUrl}/import-template`, {
      responseType: 'blob',
    });
  }

  getProgress() {
    return this.http.get<ProgressPayload>(`${this.apiUrl}/progress`);
  }

  createAttempt(mode: ExamMode, blockNumber?: number, themeId?: string | null) {
    return this.http.post<AttemptState>(`${this.apiUrl}/attempts`, {
      mode,
      blockNumber,
      themeId,
    });
  }

  getAttempt(id: string) {
    return this.http.get<AttemptState>(`${this.apiUrl}/attempts/${id}`);
  }

  reviewAttempt(id: string) {
    return this.http.get<AttemptState>(`${this.apiUrl}/attempts/${id}/review`);
  }

  saveAnswer(
    attemptId: string,
    questionId: number,
    selectedOption: string,
    isMarked: boolean,
  ) {
    return this.http.patch<AttemptState>(
      `${this.apiUrl}/attempts/${attemptId}/answers/${questionId}`,
      { selectedOption, isMarked },
    );
  }

  markQuestion(attemptId: string, questionId: number, isMarked: boolean) {
    return this.http.patch<AttemptState>(
      `${this.apiUrl}/attempts/${attemptId}/answers/${questionId}/mark`,
      { isMarked },
    );
  }

  finishAttempt(id: string) {
    return this.http.post<AttemptState>(`${this.apiUrl}/attempts/${id}/finish`, {});
  }

  resetProgress() {
    return this.http.delete<void>(`${this.apiUrl}/progress`);
  }
}
