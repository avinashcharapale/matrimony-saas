import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenantService } from '../services/tenant.service';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantService = inject(TenantService);
  const tenantId = tenantService.tenant.id;

  if (!tenantId) {
    return next(req);
  }

  const absoluteApiPrefix = `${window.location.origin}/api`;
  const isApiRequest = req.url.startsWith('/api') || req.url.startsWith(absoluteApiPrefix);

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
