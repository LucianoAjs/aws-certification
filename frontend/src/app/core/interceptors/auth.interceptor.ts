import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token();
  const authRequest = token
    ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : request;

  return next(authRequest).pipe(
    catchError((err) => {
      const isAuthEndpoint = request.url.includes('/api/auth/login') ||
        request.url.includes('/api/auth/register');
      if (err?.status === 401 && !isAuthEndpoint) {
        auth.clearSession();
        void router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};
