import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceId?: string;
  deviceInfo?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: number;
    email: string;
    tenantId: number;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  tenantId?: number;
}

export type RegisterResponse = LoginResponse;

export interface ProfileSearchResult {
  profileId: number;
  userId: number;
  profileCode: string;
  fullName: string;
  age?: number;
  bio?: string;
  locationText?: string;
  occupationText?: string;
  email: string;
  createdAt: string;
}

export interface ProfileListResponse {
  profiles: ProfileSearchResult[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ProfileDetail extends ProfileSearchResult {
  personal?: any;
  horoscope?: any;
  professional?: any;
  contact?: any;
  family?: any;
  expectations?: any;
  verification?: any;
  photos?: any[];
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

  refreshToken(refreshToken: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/refresh`, { refreshToken });
  }

  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/me`);
  }

  /**
   * Profile Endpoints
   */

  getProfiles(filters?: {
    name?: string;
    location?: string;
    occupation?: string;
    ageMin?: number;
    ageMax?: number;
    pageNumber?: number;
    pageSize?: number;
  }): Observable<ProfileListResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.name) params = params.set('name', filters.name);
      if (filters.location) params = params.set('location', filters.location);
      if (filters.occupation) params = params.set('occupation', filters.occupation);
      if (filters.ageMin !== undefined) params = params.set('ageMin', filters.ageMin.toString());
      if (filters.ageMax !== undefined) params = params.set('ageMax', filters.ageMax.toString());
      if (filters.pageNumber) params = params.set('pageNumber', filters.pageNumber.toString());
      if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());
    }

    return this.http.get<ProfileListResponse>(`${this.apiUrl}/profiles`, { params });
  }

  searchProfiles(filters?: {
    name?: string;
    location?: string;
    occupation?: string;
    ageMin?: number;
    ageMax?: number;
    religion?: string;
    caste?: string;
    education?: string;
    maritalStatus?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Observable<ProfileListResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.name) params = params.set('name', filters.name);
      if (filters.location) params = params.set('location', filters.location);
      if (filters.occupation) params = params.set('occupation', filters.occupation);
      if (filters.ageMin !== undefined) params = params.set('ageMin', filters.ageMin.toString());
      if (filters.ageMax !== undefined) params = params.set('ageMax', filters.ageMax.toString());
      if (filters.religion) params = params.set('religion', filters.religion);
      if (filters.caste) params = params.set('caste', filters.caste);
      if (filters.education) params = params.set('education', filters.education);
      if (filters.maritalStatus) params = params.set('maritalStatus', filters.maritalStatus);
      if (filters.pageNumber) params = params.set('pageNumber', filters.pageNumber.toString());
      if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());
    }

    return this.http.get<ProfileListResponse>(`${this.apiUrl}/profiles/search`, { params });
  }

  getProfileById(id: number): Observable<ProfileDetail> {
    return this.http.get<ProfileDetail>(`${this.apiUrl}/profiles/${id}`);
  }

  getProfileByUserId(userId: number): Observable<ProfileDetail> {
    return this.http.get<ProfileDetail>(`${this.apiUrl}/profiles/user/${userId}`);
  }

  createOrUpdateProfile(profile: ProfileUpsertRequest): Observable<ProfileDetail> {
    return this.http.post<ProfileDetail>(`${this.apiUrl}/profiles`, profile);
  }
}
