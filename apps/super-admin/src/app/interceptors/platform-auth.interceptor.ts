import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState } from '@ngrx/signals';
import { Observable, catchError, switchMap, throwError, take, of } from 'rxjs';
import {
  AuthStore,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from '@org/data-access-auth';
import { PlatformAuthService } from '../services/platform-auth.service';

const USER_ID_KEY = 'auth_user_id';
const TENANT_ID_KEY = 'auth_tenant_id';
const ROLE_KEY = 'auth_role';
const EXPIRES_AT_KEY = 'auth_expires_at';

const PLATFORM_AUTH_PATHS = [
  '/identity/PlatformAuth/login',
  '/identity/PlatformAuth/refresh',
  '/identity/PlatformAuth/logout',
];

let refreshInProgress$: Observable<boolean> | null = null;

function addBearerToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

function isPlatformAuthRequest(url: string): boolean {
  return PLATFORM_AUTH_PATHS.some((p) => url.includes(p));
}

function persistAuthToStorage(data: {
  accessToken: string | null;
  refreshToken: string | null;
  userId: number | null;
  tenantId: number | null;
  role: string | null;
  expiresAt: string | null;
}): void {
  const set = (key: string, val: string | null) =>
    val != null ? localStorage.setItem(key, val) : localStorage.removeItem(key);

  set(ACCESS_TOKEN_KEY, data.accessToken);
  set(REFRESH_TOKEN_KEY, data.refreshToken);
  set(USER_ID_KEY, data.userId != null ? String(data.userId) : null);
  set(TENANT_ID_KEY, data.tenantId != null ? String(data.tenantId) : null);
  set(ROLE_KEY, data.role);
  set(EXPIRES_AT_KEY, data.expiresAt);
}

export const platformAuthInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  if (isPlatformAuthRequest(req.url)) {
    return next(req);
  }

  const authStore = inject(AuthStore);
  const platformAuthService = inject(PlatformAuthService);
  const router = inject(Router);

  const token = authStore.accessToken() ?? localStorage.getItem(ACCESS_TOKEN_KEY);
  const outgoing = token ? addBearerToken(req, token) : req;

  return next(outgoing).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (!refreshInProgress$) {
        const storedRefreshToken = authStore.storedRefreshToken() ?? localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!storedRefreshToken) {
          authStore.clearSession();
          router.navigateByUrl('/login');
          return throwError(() => error);
        }

        refreshInProgress$ = platformAuthService.refresh(storedRefreshToken).pipe(
          take(1),
          switchMap((response) => {
            refreshInProgress$ = null;

            const partialState = {
              accessToken: response.accessToken,
              storedRefreshToken: response.refreshToken,
              userId: response.userId,
              tenantId: response.tenantId,
              role: response.role,
              expiresAt: response.expiresAt,
            };

            patchState(authStore as never, partialState);
            persistAuthToStorage({
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
              userId: response.userId,
              tenantId: response.tenantId,
              role: response.role,
              expiresAt: response.expiresAt,
            });

            return of(true);
          }),
          catchError(() => {
            refreshInProgress$ = null;
            authStore.clearSession();
            router.navigateByUrl('/login');
            return of(false);
          }),
        );
      }

      return refreshInProgress$.pipe(
        switchMap((refreshed) => {
          if (!refreshed) {
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
