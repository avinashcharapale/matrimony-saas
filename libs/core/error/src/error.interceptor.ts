import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, map, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateLoader, TranslateService } from '@ngx-translate/core';
import { ErrorService } from './error.service';

const SUPPRESSED_STATUSES = new Set([401, 403]);

function translateWithFallback(translate: TranslateService | null, key: string, fallback: string): Promise<string> {
  if (!translate) {
    return Promise.resolve(fallback);
  }
  return new Promise((resolve) => {
    translate.get(key).pipe(map((value) => (typeof value === 'string' && value && value !== key ? value : fallback)))
      .subscribe(resolve);
  });
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorService);
  const snackBar = inject(MatSnackBar, { optional: true });
  const router = inject(Router, { optional: true });
  const translateLoader = inject(TranslateLoader, { optional: true });
  const translate: TranslateService | null = translateLoader ? inject(TranslateService) : null;

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 402 && snackBar) {
        const detail = (error.error as { error?: string } | null)?.error ?? '';
        const isTenantLevel = detail.toLowerCase().includes('tenant');

        if (isTenantLevel) {
          void translateWithFallback(
            translate,
            'subscription.tenantExpired',
            "Your organization's subscription has expired. Please contact your administrator.",
          ).then((message) => {
            snackBar.open(message, undefined, {
              duration: 8000,
              panelClass: ['app-snackbar', 'app-snackbar-warning'],
            });
          });
        } else {
          void Promise.all([
            translateWithFallback(translate, 'subscription.userExpired', 'Your subscription has expired. Please renew to continue.'),
            translateWithFallback(translate, 'subscription.renew', 'Subscribe'),
          ]).then(([message, actionLabel]) => {
            snackBar
              .open(message, actionLabel, {
                duration: 8000,
                panelClass: ['app-snackbar', 'app-snackbar-warning'],
              })
              .onAction()
              .subscribe(() => {
                if (router) {
                  router.navigateByUrl('/plans');
                }
              });
          });
        }
      }

      if (!SUPPRESSED_STATUSES.has(error.status)) {
        const correlationId = error.headers.get('X-Correlation-Id') ?? undefined;
        const message = errorService.formatHttpError(error);

        errorService.addError({
          status: error.status,
          message,
          correlationId,
          timestamp: Date.now(),
        });
      }

      return throwError(() => error);
    }),
  );
};
