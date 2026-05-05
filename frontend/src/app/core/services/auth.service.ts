import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { AuthPayload, AuthUser } from '../models/auth.models';
import { RuntimeConfigService } from './runtime-config.service';

const TOKEN_STORAGE_KEY = 'awsTrainerAuthToken';
const USER_STORAGE_KEY = 'awsTrainerAuthUser';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfigService);
  private readonly tokenSignal = signal<string | null>(
    localStorage.getItem(TOKEN_STORAGE_KEY),
  );

  readonly currentUser = signal<AuthUser | null>(this.readStoredUser());
  readonly isAuthenticated = computed(() => Boolean(this.tokenSignal() && this.currentUser()));

  token(): string | null {
    return this.tokenSignal();
  }

  login(input: { email: string; password: string }) {
    return this.http.post<AuthPayload>(this.authUrl('/login'), input).pipe(
      tap((payload) => this.setSession(payload)),
    );
  }

  register(input: { name: string; email: string; password: string }) {
    return this.http.post<AuthPayload>(this.authUrl('/register'), input).pipe(
      tap((payload) => this.setSession(payload)),
    );
  }

  loadMe() {
    return this.http.get<{ user: AuthUser }>(this.authUrl('/me')).pipe(
      tap(({ user }) => {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        this.currentUser.set(user);
      }),
    );
  }

  logout() {
    return this.http.post<{ ok: true }>(this.authUrl('/logout'), {}).pipe(
      tap(() => this.clearSession()),
    );
  }

  clearSession() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    this.tokenSignal.set(null);
    this.currentUser.set(null);
  }

  getActiveThemeId(): string | null {
    return localStorage.getItem(this.activeThemeStorageKey());
  }

  setActiveThemeId(themeId: string) {
    localStorage.setItem(this.activeThemeStorageKey(), themeId);
  }

  private setSession(payload: AuthPayload) {
    localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload.user));
    this.tokenSignal.set(payload.token);
    this.currentUser.set(payload.user);
  }

  private authUrl(path: string) {
    return this.runtimeConfig.apiUrl(`/api/auth${path}`);
  }

  private activeThemeStorageKey() {
    return `activeThemeId:${this.currentUser()?.id ?? 'anonymous'}`;
  }

  private readStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
  }
}
