import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthStore, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@org/data-access-auth';
import type { AuthSession } from '@org/data-access-auth';

export { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@org/data-access-auth';
export type { AuthSession } from '@org/data-access-auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly store = inject(AuthStore);
  private readonly router = inject(Router);

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  getSession(): AuthSession | null {
    return this.store.session();
  }

  isAuthenticated(): boolean {
    return this.store.isAuthenticated();
  }

  login(
    email: string,
    password: string,
  ): Observable<{ ok: boolean; message: string }> {
    return this.store.login(email, password);
  }

  refreshToken(): Observable<boolean> {
    return this.store.refreshAuth();
  }

  logout(): Observable<void> {
    return this.store.logout().pipe(
      tap(() => this.router.navigateByUrl('/login')),
    );
  }

  clearSession(): void {
    this.store.clearSession();
  }
}
