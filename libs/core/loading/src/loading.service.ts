import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly activeRequests = signal(0);

  readonly isLoading = this.activeRequests.asReadonly();

  track<T>(request: T): T {
    this.activeRequests.update((count) => count + 1);
    return request;
  }

  complete(): void {
    this.activeRequests.update((count) => Math.max(0, count - 1));
  }

  reset(): void {
    this.activeRequests.set(0);
  }
}
