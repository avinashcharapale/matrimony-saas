import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, switchMap, throwError, take, filter, of } from 'rxjs';
import { AuthStore, ACCESS_TOKEN_KEY } from '@org/data-access-auth';

const AUTH_PATHS = ['/identity/Auth/login', '/identity/Auth/refresh', '/identity/Auth/logout'];

let refreshInProgress$: Observable<boolean> | null = null;

function addBearerToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

function isAuthRequest(url: string): boolean {
  return AUTH_PATHS.some((p) => url.includes(p));
}

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  if (isAuthRequest(req.url)) {
    return next(req);
  }

  const authStore = inject(AuthStore);
  const router = inject(Router);

  const token = authStore.accessToken() ?? localStorage.getItem(ACCESS_TOKEN_KEY);
  const outgoing = token ? addBearerToken(req, token) : req;

  return next(outgoing).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (!refreshInProgress$) {
        refreshInProgress$ = authStore.refreshAuth().pipe(
          take(1),
          switchMap((refreshed) => {
            refreshInProgress$ = null;
            return of(refreshed);
          }),
        );
      }

      return refreshInProgress$.pipe(
        switchMap((refreshed) => {
          if (!refreshed) {
            authStore.clearSession();
            router.navigateByUrl('/login');
            return throwError(() => error);
          }

          const newToken = authStore.accessToken() ?? localStorage.getItem(ACCESS_TOKEN_KEY);
          const retryReq = newToken ? addBearerToken(req, newToken) : req;
          return next(retryReq);
        }),
      );
    }),
  );
};
