import { Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface AppError {
  status: number;
  message: string;
  correlationId?: string;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class ErrorService {
  readonly errors = signal<AppError[]>( []);

  addError(error: AppError): void {
    this.errors.update((list) => [...list.slice(-4), error]);
  }

  clearErrors(): void {
    this.errors.set([]);
  }

  formatHttpError(error: HttpErrorResponse): string {
    const status = error.status;

    if (status === 0) {
      return 'Network error. Please check your connection and try again.';
    }

    const body = error.error;
    const detail = this.extractDetail(body);

    if (detail) {
      return detail;
    }

    switch (status) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'Session expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'A conflict occurred. The resource may have been modified.';
      case 422:
        return 'Validation failed. Please check your input.';
      case 503:
        return 'Service is temporarily unavailable. Please try again later.';
      default:
        if (status >= 500) {
          return 'A server error occurred. Please try again later.';
        }
        return `Request failed (HTTP ${status}).`;
    }
  }

  private extractDetail(body: unknown): string | null {
    if (!body || typeof body !== 'object') {
      return null;
    }

    const obj = body as Record<string, unknown>;

    if (typeof obj['error'] === 'string' && obj['error'].trim()) {
      return obj['error'] as string;
    }

    if (typeof obj['detail'] === 'string' && obj['detail'].trim()) {
      return obj['detail'] as string;
    }

    if (typeof obj['title'] === 'string' && obj['title'].trim()) {
      return obj['title'] as string;
    }

    if (typeof obj['message'] === 'string' && obj['message'].trim()) {
      return obj['message'] as string;
    }

    if (obj['errors'] && typeof obj['errors'] === 'object') {
      const fieldErrors = Object.entries(obj['errors'] as Record<string, unknown>)
        .flatMap(([field, value]) => {
          if (Array.isArray(value)) {
            return value
              .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
              .map((v) => `${field}: ${v}`);
          }
          if (typeof value === 'string' && value.trim()) {
            return [`${field}: ${value}`];
          }
          return [];
        });

      if (fieldErrors.length > 0) {
        return fieldErrors.slice(0, 3).join(' | ');
      }
    }

    return null;
  }
}
