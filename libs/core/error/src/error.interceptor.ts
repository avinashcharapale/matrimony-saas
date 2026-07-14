import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorService } from './error.service';

const SUPPRESSED_STATUSES = new Set([401, 403]);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
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
