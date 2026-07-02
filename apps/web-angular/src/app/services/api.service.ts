import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  tenantId: number;
  role: string;
  expiresAt: string;
}

export type RefreshResponse = LoginResponse;

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  tenantId?: number;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  tenantId: number;
  role: string;
  expiresAt: string;
}

export interface ProfileUpsertRequest {
  fullName: string;
  age?: number;
  bio?: string;
  locationText?: string;
  occupationText?: string;
  personal?: Record<string, unknown>;
  horoscope?: Record<string, unknown>;
  professional?: Record<string, unknown>;
  contact?: Record<string, unknown>;
  family?: Record<string, unknown>;
  expectations?: Record<string, unknown>;
  verification?: Record<string, unknown>;
  photos?: Array<Record<string, unknown>>;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api';

  /**
   * Authentication Endpoints
   */

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, request);
  }

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, request);
  }

  logout(refreshToken: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/logout`, { refreshToken });
  }

  refreshToken(refreshToken: string): Observable<RefreshResponse> {
    return this.http.post<RefreshResponse>(`${this.apiUrl}/auth/refresh`, { refreshToken });
  }

  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/me`);
  }

  createOrUpdateProfile(profile: ProfileUpsertRequest): Observable<any> {
    return this.http.post<any>('/profile/UserProfiles', profile);
  }
}
