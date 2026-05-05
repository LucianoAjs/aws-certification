import { Injectable, signal } from '@angular/core';

interface RuntimeConfig {
  apiBaseUrl: string;
}

@Injectable({ providedIn: 'root' })
export class RuntimeConfigService {
  private readonly config = signal<RuntimeConfig>({ apiBaseUrl: '' });

  async load() {
    try {
      const response = await fetch('/app-config.json', { cache: 'no-store' });
      if (!response.ok) return;

      const config = (await response.json()) as Partial<RuntimeConfig>;
      this.config.set({
        apiBaseUrl: this.normalizeUrl(config.apiBaseUrl),
      });
    } catch {
      this.config.set({ apiBaseUrl: '' });
    }
  }

  apiUrl(path: string) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.config().apiBaseUrl}${normalizedPath}`;
  }

  private normalizeUrl(url?: string) {
    const trimmed = url?.trim() ?? '';
    return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
  }
}
