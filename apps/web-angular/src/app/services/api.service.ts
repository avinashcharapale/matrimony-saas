import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IdentityClient, ProfileClient, CreateProfileDto } from '@org/generated';

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

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.identity.register(request);
  }

  createOrUpdateProfile(profile: CreateProfileDto, photos: File[] = []): Observable<void> {
    return this.profileClient.create(profile, photos);
  }
}
