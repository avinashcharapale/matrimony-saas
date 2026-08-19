import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PlatformLoginRequest {
  email: string;
  password: string;
}

export interface PlatformAuthResponse {
  userId: number;
  email: string;
  role: string;
  tenantId: number;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

@Injectable({ providedIn: 'root' })
export class PlatformAuthService {
  private readonly http = inject(HttpClient);

  login(request: PlatformLoginRequest): Observable<PlatformAuthResponse> {
    return this.http.post<PlatformAuthResponse>('/identity/PlatformAuth/login', request);
  }

  refresh(refreshToken: string): Observable<PlatformAuthResponse> {
    return this.http.post<PlatformAuthResponse>('/identity/PlatformAuth/refresh', {
      refreshToken,
      accessToken: '',
    });
  }

  logout(refreshToken: string): Observable<void> {
    return this.http.post<void>('/identity/PlatformAuth/logout', {
      refreshToken,
      accessToken: '',
    });
  }
}
