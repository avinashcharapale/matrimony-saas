import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenantService } from '../services/tenant.service';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantService = inject(TenantService);
  const tenantId = tenantService.tenant.id;

  if (!tenantId) {
    return next(req);
  }

  const isApiRequest =
    req.url.startsWith('/api') ||
    req.url.startsWith('/profile') ||
    req.url.startsWith('/identity') ||
    req.url.startsWith('/tenant') ||
    req.url.startsWith('/subscription') ||
    req.url.startsWith('/match') ||
    req.url.startsWith('/chat') ||
    req.url.startsWith('/gateway');

  if (!isApiRequest || req.headers.has('x-tenant-id')) {
    return next(req);
  }

  const requestWithTenant = req.clone({
    setHeaders: {
      'x-tenant-id': tenantId,
      'x-tenant-host': window.location.hostname,
    },
  });

  return next(requestWithTenant);
};
