import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from './loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.headers.has('X-Skip-Loading')) {
    const cleaned = req.clone({ headers: req.headers.delete('X-Skip-Loading') });
    return next(cleaned);
  }

  const loadingService = inject(LoadingService);
  loadingService.track(undefined);

  return next(req).pipe(
    finalize(() => loadingService.complete()),
  );
};
