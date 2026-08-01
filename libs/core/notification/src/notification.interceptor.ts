import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { NotificationService } from './notification.service';
import { ErrorService } from '../../error/src/error.service';

const SUPPRESSED_STATUSES = new Set([401, 402, 403]);
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const NO_SUCCESS_URL_PATTERN = /\/(auth|login|refresh|token|register)(\b|\/)/i;
const SKIP_HEADER = 'X-Skip-Notification';

function successMessage(method: string): string {
  switch (method.toUpperCase()) {
    case 'POST':
      return 'Created successfully.';
    case 'PUT':
    case 'PATCH':
      return 'Updated successfully.';
    case 'DELETE':
      return 'Deleted successfully.';
    default:
      return 'Operation completed successfully.';
  }
}

export const notificationInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  const errorService = inject(ErrorService);
  const skip = req.headers.has(SKIP_HEADER);
  const outgoing = skip ? req.clone({ headers: req.headers.delete(SKIP_HEADER) }) : req;

  return next(outgoing).pipe(
    tap((event) => {
      if (skip || !(event instanceof HttpResponse)) {
        return;
      }
      if (!MUTATING_METHODS.has(req.method.toUpperCase())) {
        return;
      }
      if (NO_SUCCESS_URL_PATTERN.test(req.url)) {
        return;
      }
      if (event.status >= 200 && event.status < 300) {
        notifications.success(successMessage(req.method));
      }
    }),
    catchError((error: HttpErrorResponse) => {
      if (!skip && !SUPPRESSED_STATUSES.has(error.status)) {
        notifications.error(errorService.formatHttpError(error));
      }
      return throwError(() => error);
    }),
  );
};
