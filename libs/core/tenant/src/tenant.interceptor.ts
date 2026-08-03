import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenantStore } from '@org/data-access-tenant';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantStore = inject(TenantStore);
  const tenantId = tenantStore.tenantHeaderId();
  const isProfileMasterDataRequest = req.url.includes('/profile/master-data');

  if (!tenantId) {
    if (isProfileMasterDataRequest) {
      console.debug('[tenant-interceptor] No tenant header id available for request:', req.url);
    }
    return next(req);
  }

  const absoluteApiPrefix = `${window.location.origin}/api`;
  const absoluteProfilePrefix = `${window.location.origin}/profile`;
  const isApiRequest =
    req.url.startsWith('/api') ||
    req.url.startsWith('/profile') ||
    req.url.startsWith('/identity') ||
    req.url.startsWith('/tenant') ||
    req.url.startsWith('/subscription') ||
    req.url.startsWith('/match') ||
    req.url.startsWith('/chat') ||
    req.url.startsWith('/billing') ||
    req.url.startsWith('/gateway') ||
    req.url.startsWith(absoluteApiPrefix) ||
    req.url.startsWith(absoluteProfilePrefix);

  if (!isApiRequest || req.headers.has('x-tenant-id')) {
    return next(req);
  }

  const requestWithTenant = req.clone({
    setHeaders: {
      'x-tenant-id': tenantId,
      'x-tenant-host': window.location.hostname,
    },
  });

  if (isProfileMasterDataRequest) {
    console.debug('[tenant-interceptor] Added tenant headers for request:', {
      url: req.url,
      tenantId,
      tenantHost: window.location.hostname,
    });
  }

  return next(requestWithTenant);
};
