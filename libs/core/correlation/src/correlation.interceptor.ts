import { HttpInterceptorFn } from '@angular/common/http';

function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const correlationInterceptor: HttpInterceptorFn = (req, next) => {
  const correlationId = req.headers.get('X-Correlation-Id') ?? generateCorrelationId();

  const traced = req.clone({
    setHeaders: { 'X-Correlation-Id': correlationId },
  });

  return next(traced);
};
