import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ErrorService } from './error.service';

const SUPPRESSED_STATUSES = new Set([401, 403]);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorService);
  const snackBar = inject(MatSnackBar, { optional: true });
  const router = inject(Router, { optional: true });

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 402 && snackBar) {
        snackBar.open(
          'Your subscription has expired. Please renew to continue.',
          'Subscribe',
          { duration: 8000, panelClass: ['snackbar-warning'] },
        ).onAction().subscribe(() => {
          if (router) {
            router.navigateByUrl('/subscription');
          }
        });
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
