import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shared/layouts/app-shell/app-shell.component').then(
        (m) => m.AppShellComponent,
      ),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'simulado',
        loadComponent: () =>
          import('./pages/exam/exam.component').then((m) => m.ExamComponent),
      },
      {
        path: 'simulado/:id',
        loadComponent: () =>
          import('./pages/exam/exam.component').then((m) => m.ExamComponent),
      },
      {
        path: 'tentativas',
        loadComponent: () =>
          import('./pages/history/history.component').then(
            (m) => m.HistoryComponent,
          ),
      },
      {
        path: 'temas',
        loadComponent: () =>
          import('./pages/themes/themes.component').then(
            (m) => m.ThemesComponent,
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
