import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  RegisterRequestDto as RegisterRequest,
  LoginRequestDto as LoginRequest,
  RefreshTokenRequestDto as RefreshTokenRequest,
  AuthResponseDto,
  UserDetailDto,
  UserListDto,
  CreateUserRequestDto as CreateUserRequest,
  UpdateUserRequestDto as UpdateUserRequest,
} from './dtos';

@Injectable({ providedIn: 'root' })
export class IdentityClient {
  private readonly http = inject(HttpClient);

  register(body: RegisterRequest): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>('/identity/Auth/register', body);
  }

  login(body: LoginRequest): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>('/identity/Auth/login', body);
  }

  refresh(body: RefreshTokenRequest): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>('/identity/Auth/refresh', body);
  }

  logout(body: RefreshTokenRequest): Observable<void> {
    return this.http.post<void>('/identity/Auth/logout', body);
  }

  getCurrentUser(): Observable<UserDetailDto> {
    return this.http.get<UserDetailDto>('/identity/Auth/me');
  }
}

@Injectable({ providedIn: 'root' })
export class UsersClient {
  private readonly http = inject(HttpClient);

  getById(id: number): Observable<UserDetailDto> {
    return this.http.get<UserDetailDto>(`/identity/Users/${id}`);
  }

  update(id: number, body: UpdateUserRequest): Observable<void> {
    return this.http.put<void>(`/identity/Users/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/identity/Users/${id}`);
  }

  getByTenant(tenantId: number): Observable<UserListDto[]> {
    return this.http.get<UserListDto[]>(`/identity/Users/by-tenant/${tenantId}`);
  }

  create(body: CreateUserRequest): Observable<void> {
    return this.http.post<void>('/identity/Users', body);
  }
}
