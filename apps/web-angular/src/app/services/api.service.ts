import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IdentityClient, ProfileClient, CreateProfileDto } from '@org/generated';

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

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly identity = inject(IdentityClient);
  private readonly profileClient = inject(ProfileClient);

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.identity.login(request);
  }

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.identity.register(request);
  }

  logout(refreshToken: string): Observable<{ message: string }> {
    return this.identity.logout({ refreshToken }).pipe(
      map(() => ({ message: 'Logged out.' }))
    );
  }

  refreshToken(refreshToken: string): Observable<RefreshResponse> {
    return this.identity.refresh({ refreshToken });
  }

  getCurrentUser(): Observable<unknown> {
    return this.identity.getCurrentUser();
  }

  createOrUpdateProfile(profile: CreateProfileDto, photos: File[] = []): Observable<void> {
    return this.profileClient.create(profile, photos);
  }
}
