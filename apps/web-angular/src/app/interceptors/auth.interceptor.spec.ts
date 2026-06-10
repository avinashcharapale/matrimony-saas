import { TestBed } from '@angular/core/testing';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
  HttpClient,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { ACCESS_TOKEN_KEY, AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authService: AuthService;

  const mockRefreshResponse = {
    accessToken: 'new-access-token',
    refreshToken: 'new-refresh-token',
    userId: 1,
    tenantId: 1,
    role: 'member',
    expiresAt: new Date(Date.now() + 3600_000).toISOString(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        ApiService,
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should attach Authorization header when access token exists', () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'my-token');

    httpClient.get('/api/profiles').subscribe();

    const req = httpMock.expectOne('/api/profiles');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    req.flush([]);
  });

  it('should not attach Authorization header when no token', () => {
    httpClient.get('/api/profiles').subscribe();

    const req = httpMock.expectOne('/api/profiles');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush([]);
  });

  it('should not attach Authorization header for /api/auth/login', () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'my-token');

    httpClient.post('/api/auth/login', {}).subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('should retry request with new token after 401 when refresh succeeds', () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'old-token');
    localStorage.setItem('refresh_token', 'refresh-token');

    httpClient.get('/api/profiles').subscribe();

    // First request returns 401
    const firstReq = httpMock.expectOne('/api/profiles');
    expect(firstReq.request.headers.get('Authorization')).toBe('Bearer old-token');
    firstReq.flush({}, { status: 401, statusText: 'Unauthorized' });

    // Interceptor calls refresh
    const refreshReq = httpMock.expectOne('/api/auth/refresh');
    expect(refreshReq.request.method).toBe('POST');
    refreshReq.flush(mockRefreshResponse);

    // Retry original request with new token
    const retryReq = httpMock.expectOne('/api/profiles');
    expect(retryReq.request.headers.get('Authorization')).toBe('Bearer new-access-token');
    retryReq.flush([]);
  });

  it('should clear session and not retry when refresh fails', () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, 'old-token');
    localStorage.setItem('refresh_token', 'expired-refresh');
    spyOn(authService, 'clearSession').and.callThrough();

    httpClient.get('/api/profiles').subscribe({ error: () => {} });

    const firstReq = httpMock.expectOne('/api/profiles');
    firstReq.flush({}, { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpMock.expectOne('/api/auth/refresh');
    refreshReq.flush({}, { status: 401, statusText: 'Unauthorized' });

    // No retry request
    httpMock.expectNone('/api/profiles');
    expect(authService.clearSession).toHaveBeenCalled();
  });
});
