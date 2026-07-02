import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { ACCESS_TOKEN_KEY, AuthService } from '../services/auth.service';

/** Paths that should never have a Bearer token attached */
const AUTH_PATHS = ['/api/auth/login', '/api/auth/refresh', '/api/auth/logout'];

function addBearerToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Don't attach token for auth endpoints themselves
  const isAuthPath = AUTH_PATHS.some(p => req.url.includes(p));
  if (isAuthPath) {
    return next(req);
  }

  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const outgoing = token ? addBearerToken(req, token) : req;

  return next(outgoing).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      // Attempt a single token refresh, then retry the original request
      return authService.refreshToken().pipe(
        switchMap((refreshed) => {
          if (!refreshed) {
            authService.clearSession();
            router.navigateByUrl('/login');
            return throwError(() => error);
          }
          const newToken = localStorage.getItem(ACCESS_TOKEN_KEY);
          const retryReq = newToken ? addBearerToken(req, newToken) : req;
          return next(retryReq);
        }),
      );
    }),
  );
};
