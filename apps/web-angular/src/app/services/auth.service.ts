import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService, LoginResponse } from './api.service';

export const ACCESS_TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const USER_ID_KEY = 'auth_user_id';
export const TENANT_ID_KEY = 'auth_tenant_id';
export const ROLE_KEY = 'auth_role';
export const EXPIRES_AT_KEY = 'auth_expires_at';

export interface AuthSession {
  userId: number;
  tenantId: number;
  role: string;
  expiresAt: string;
}

interface NormalizedAuthPayload {
  accessToken: string;
  refreshToken: string;
  userId: number;
  tenantId: number;
  role: string;
  expiresAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);

  // ── Token accessors ──────────────────────────────────────────────────────────

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  getSession(): AuthSession | null {
    const userId = localStorage.getItem(USER_ID_KEY);
    const tenantId = localStorage.getItem(TENANT_ID_KEY);
    const role = localStorage.getItem(ROLE_KEY);
    const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);
    if (!userId || !tenantId || !role || !expiresAt) return null;
    return {
      userId: Number(userId),
      tenantId: Number(tenantId),
      role,
      expiresAt,
    };
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);
    if (expiresAt) {
      return new Date(expiresAt) > new Date();
    }
    return true;
  }

  // ── Session storage ──────────────────────────────────────────────────────────

  private storeSession(payload: NormalizedAuthPayload): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
    localStorage.setItem(USER_ID_KEY, String(payload.userId));
    localStorage.setItem(TENANT_ID_KEY, String(payload.tenantId));
    localStorage.setItem(ROLE_KEY, payload.role);
    localStorage.setItem(EXPIRES_AT_KEY, payload.expiresAt);
  }

  clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(TENANT_ID_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
  }

  // ── Auth operations ──────────────────────────────────────────────────────────

  /**
   * POST /api/auth/login
   */
  async login(email: string, password: string): Promise<{ ok: boolean; message: string }> {
    try {
      const response = await firstValueFrom(
        this.apiService.login({ email, password })
      );
      const normalized = this.normalizeAuthPayload(response);
      this.storeSession(normalized);
      return { ok: true, message: 'Login successful.' };
    } catch (error: unknown) {
      return { ok: false, message: this.extractErrorMessage(error, 'Invalid email or password.') };
    }
  }

  /**
   * POST /api/auth/refresh
   * Returns true if refresh succeeded, false otherwise.
   */
  async refreshToken(): Promise<boolean> {
    const token = this.getRefreshToken();
    if (!token) return false;
    try {
      const response = await firstValueFrom(
        this.apiService.refreshToken(token)
      );
      const normalized = this.normalizeAuthPayload(response, this.getSession());
      this.storeSession(normalized);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * POST /api/auth/logout then clears session and redirects to /login.
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        await firstValueFrom(this.apiService.logout(refreshToken));
      }
    } catch {
      // ignore server errors – clear locally regardless
    } finally {
      this.clearSession();
      this.router.navigateByUrl('/login');
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private extractErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === 'object') {
      const e = error as {
        message?: string;
        error?:
          | string
          | {
            error?: string;
            message?: string;
            title?: string;
            detail?: string;
            errors?: Record<string, string[] | string>;
          };
      };

      if (typeof e.error === 'string' && e.error.trim().length > 0) {
        return e.error;
      }

      if (e.error && typeof e.error === 'object') {
        if (typeof e.error.error === 'string' && e.error.error.trim().length > 0) {
          return e.error.error;
        }
        if (typeof e.error.message === 'string' && e.error.message.trim().length > 0) {
          return e.error.message;
        }
        if (typeof e.error.detail === 'string' && e.error.detail.trim().length > 0) {
          return e.error.detail;
        }
        if (typeof e.error.title === 'string' && e.error.title.trim().length > 0) {
          return e.error.title;
        }
        if (e.error.errors && typeof e.error.errors === 'object') {
          const firstError = Object.values(e.error.errors)
            .flatMap((value) => (Array.isArray(value) ? value : [value]))
            .find((value) => typeof value === 'string' && value.trim().length > 0);
          if (firstError) {
            return firstError;
          }
        }
      }

      if (typeof e.message === 'string' && e.message.trim().length > 0) {
        return e.message;
      }
    }

    return fallback;
  }

  private normalizeAuthPayload(
    response: LoginResponse,
    previousSession: AuthSession | null = null
  ): NormalizedAuthPayload {
    const payload = response as unknown as {
      accessToken?: string;
      refreshToken?: string;
      userId?: number;
      tenantId?: number;
      role?: string;
      expiresAt?: string;
      expiresIn?: number;
      user?: {
        id?: number;
        tenantId?: number;
      };
    };

    const accessToken = payload.accessToken;
    const refreshToken = payload.refreshToken;
    const userId = payload.userId ?? payload.user?.id ?? previousSession?.userId;
    const tenantId = payload.tenantId ?? payload.user?.tenantId ?? previousSession?.tenantId;
    const role = payload.role ?? previousSession?.role ?? 'member';
    const expiresAt = payload.expiresAt ?? this.resolveExpiresAt(payload.expiresIn) ?? previousSession?.expiresAt;

    if (!accessToken || !refreshToken || !userId || !tenantId || !expiresAt) {
      throw new Error('Invalid authentication response from server.');
    }

    return {
      accessToken,
      refreshToken,
      userId,
      tenantId,
      role,
      expiresAt,
    };
  }

  private resolveExpiresAt(expiresInSeconds?: number): string | null {
    if (!expiresInSeconds || !Number.isFinite(expiresInSeconds) || expiresInSeconds <= 0) {
      return null;
    }

    return new Date(Date.now() + expiresInSeconds * 1000).toISOString();
  }
}
