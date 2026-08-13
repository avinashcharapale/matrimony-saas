import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IdentityClient } from '@org/generated';

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  tenantId: number;
  role: string;
  roles?: string[];
  permissions?: string[];
  expiresAt: string;
}

export interface AuthRefreshRequest {
  refreshToken: string;
}

export interface AuthLogoutRequest {
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthRepository {
  private readonly identity = inject(IdentityClient);

  login(request: AuthLoginRequest): Observable<AuthLoginResponse> {
    return this.identity.login(request);
  }

  register(request: {
    email: string;
    password: string;
    confirmPassword: string;
    tenantId?: number;
  }): Observable<AuthLoginResponse> {
    return this.identity.register(request);
  }

  refreshToken(accessToken: string, refreshToken: string): Observable<AuthLoginResponse> {
    return this.identity.refresh({ accessToken, refreshToken });
  }

  logout(refreshToken: string): Observable<void> {
    return this.identity.logout({ refreshToken });
  }
}
