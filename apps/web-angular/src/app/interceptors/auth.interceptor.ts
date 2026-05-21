import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Get token from localStorage
  const token = localStorage.getItem('auth_token');

  if (token) {
    // Clone the request and add the Authorization header
    const requestWithAuth = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(requestWithAuth);
  }

  return next(req);
};
