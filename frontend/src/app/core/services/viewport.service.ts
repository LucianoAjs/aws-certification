import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ViewportService {
  private readonly media = window.matchMedia('(max-width: 900px)');
  private readonly isNarrowShellSubject = new BehaviorSubject<boolean>(
    this.media.matches,
  );

  readonly isNarrowShell$ = this.isNarrowShellSubject.asObservable();

  constructor() {
    this.media.addEventListener('change', (event) => {
      this.isNarrowShellSubject.next(event.matches);
    });
  }
}
