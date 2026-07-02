import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  AuthService,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  EXPIRES_AT_KEY,
  TENANT_ID_KEY,
  USER_ID_KEY,
  ROLE_KEY,
} from './auth.service';
import { ApiService } from './api.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockResponse = {
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-456',
    userId: 42,
    tenantId: 1,
    role: 'member',
    expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
  };

  const nestedMockResponse = {
    accessToken: 'nested-access-token',
    refreshToken: 'nested-refresh-token',
    expiresIn: 3600,
    user: {
      id: 77,
      email: 'nested@demo.matrimony.local',
      tenantId: 9,
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('login()', () => {
    it('should POST /api/auth/login and store tokens on success', async () => {
      const promise = firstValueFrom(service.login('admin@demo.matrimony.local', 'Admin@123'));

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'admin@demo.matrimony.local', password: 'Admin@123' });
      expect(req.request.headers.get('Content-Type')).toContain('application/json');
      req.flush(mockResponse);

      const result = await promise;
      expect(result.ok).toBeTrue();
      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe('access-token-123');
      expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-token-456');
    });

    it('should return ok:false on 401', async () => {
      const promise = firstValueFrom(service.login('bad@user.com', 'wrong'));

      const req = httpMock.expectOne('/api/auth/login');
      req.flush({ error: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

      const result = await promise;
      expect(result.ok).toBeFalse();
      expect(result.message).toBe('Invalid credentials');
    });

    it('should return error message when backend sends a plain string', async () => {
      const promise = firstValueFrom(service.login('bad@user.com', 'wrong'));

      const req = httpMock.expectOne('/api/auth/login');
      req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });

      const result = await promise;
      expect(result.ok).toBeFalse();
      expect(result.message).toBe('Invalid credentials');
    });

    it('should store tenant and user from nested login payload shape', async () => {
      const promise = firstValueFrom(service.login('nested@demo.matrimony.local', 'Password@123'));

      const req = httpMock.expectOne('/api/auth/login');
      req.flush(nestedMockResponse);

      const result = await promise;
      expect(result.ok).toBeTrue();
      expect(localStorage.getItem(TENANT_ID_KEY)).toBe('9');
      expect(localStorage.getItem(USER_ID_KEY)).toBe('77');
      expect(localStorage.getItem(ROLE_KEY)).toBe('member');
      expect(localStorage.getItem(EXPIRES_AT_KEY)).toBeTruthy();
    });
  });

  describe('refreshToken()', () => {
    it('should POST /api/auth/refresh with stored refresh token', async () => {
      localStorage.setItem(REFRESH_TOKEN_KEY, 'old-refresh');

      const promise = firstValueFrom(service.refreshToken());

      const req = httpMock.expectOne('/api/auth/refresh');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'old-refresh' });
      req.flush(mockResponse);

      const result = await promise;
      expect(result).toBeTrue();
      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe('access-token-123');
    });

    it('should return false when no refresh token is stored', async () => {
      const result = await firstValueFrom(service.refreshToken());
      expect(result).toBeFalse();
      httpMock.expectNone('/api/auth/refresh');
    });

    it('should return false when refresh endpoint returns 401', async () => {
      localStorage.setItem(REFRESH_TOKEN_KEY, 'expired-token');

      const promise = firstValueFrom(service.refreshToken());

      const req = httpMock.expectOne('/api/auth/refresh');
      req.flush({}, { status: 401, statusText: 'Unauthorized' });

      const result = await promise;
      expect(result).toBeFalse();
    });

    it('should preserve tenant and user on refresh token-only payload', async () => {
      localStorage.setItem(REFRESH_TOKEN_KEY, 'old-refresh');
      localStorage.setItem(USER_ID_KEY, '42');
      localStorage.setItem(TENANT_ID_KEY, '7');
      localStorage.setItem(ROLE_KEY, 'member');
      localStorage.setItem(EXPIRES_AT_KEY, new Date(Date.now() + 1000).toISOString());

      const promise = firstValueFrom(service.refreshToken());

      const req = httpMock.expectOne('/api/auth/refresh');
      req.flush({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 1800,
        tokenType: 'Bearer',
      });

      const result = await promise;
      expect(result).toBeTrue();
      expect(localStorage.getItem(TENANT_ID_KEY)).toBe('7');
      expect(localStorage.getItem(USER_ID_KEY)).toBe('42');
      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe('new-access-token');
      expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('new-refresh-token');
    });
  });

  describe('logout()', () => {
    it('should POST /api/auth/logout and clear session', async () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, 'access-token');
      localStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-token');

      const promise = firstValueFrom(service.logout());

      const req = httpMock.expectOne('/api/auth/logout');
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Logged out' });

      await promise;
      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    });

    it('should clear session even when logout endpoint fails', async () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, 'access-token');
      localStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-token');

      const promise = firstValueFrom(service.logout());

      const req = httpMock.expectOne('/api/auth/logout');
      req.flush({}, { status: 500, statusText: 'Server Error' });

      await promise;
      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
    });
  });

  describe('isAuthenticated()', () => {
    it('should return false when no token', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should return true when token exists and not expired', () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, 'token');
      localStorage.setItem(EXPIRES_AT_KEY, new Date(Date.now() + 3600_000).toISOString());
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should return false when token is expired', () => {
      localStorage.setItem(ACCESS_TOKEN_KEY, 'token');
      localStorage.setItem(EXPIRES_AT_KEY, new Date(Date.now() - 1000).toISOString());
      expect(service.isAuthenticated()).toBeFalse();
    });
  });
});
