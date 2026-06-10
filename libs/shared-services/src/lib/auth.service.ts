import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse, User } from '@org/models';
import { API_CONFIG } from './config/api.config';

interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
  tenantId?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = API_CONFIG.baseUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadStoredUser();
  }

  /**
   * Set the base URL for API requests (useful for environment overrides)
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    const url = `${this.baseUrl}/auth/login`;
    return this.http.post<LoginResponse>(url, credentials).pipe(
      tap((response) => {
        // Store user and token
        this.currentUserSubject.next(response.user as User);
        if (response.accessToken) {
          localStorage.setItem('accessToken', response.accessToken);
          if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
          }
        }
      })
    );
  }

  /**
   * Register a new user
   */
  register(userData: RegisterPayload): Observable<LoginResponse> {
    const url = `${this.baseUrl}/auth/register`;
    return this.http.post<LoginResponse>(url, userData).pipe(
      tap((response) => {
        this.currentUserSubject.next(response.user as User);
        if (response.accessToken) {
          localStorage.setItem('accessToken', response.accessToken);
        }
      })
    );
  }

  /**
   * Logout the current user
   */
  logout(): Observable<void> {
    const url = `${this.baseUrl}/auth/logout`;
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<void>(url, { refreshToken }).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
    );
  }

  /**
   * Refresh the access token
   */
  refreshToken(): Observable<LoginResponse> {
    const url = `${this.baseUrl}/auth/refresh`;
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<LoginResponse>(url, { refreshToken }).pipe(
      tap((response) => {
        if (response.accessToken) {
          localStorage.setItem('accessToken', response.accessToken);
        }
      })
    );
  }

  /**
   * Get the current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.getValue();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  /**
   * Get the access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Load stored user from localStorage (for session persistence)
   */
  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
    }
  }
}
