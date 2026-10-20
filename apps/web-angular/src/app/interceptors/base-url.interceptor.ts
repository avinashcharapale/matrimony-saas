import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

/**
 * Relative API prefixes used by the generated clients and SignalR.
 * Mirrors the dev proxy configuration in `apps/web-angular/proxy.conf.json`.
 */
const API_PREFIXES = [
  '/api',
  '/profile',
  '/identity',
  '/tenant',
  '/subscription',
  '/match',
  '/chat',
  '/notification',
  '/billing',
  '/gateway',
  '/hubs',
];

/**
 * Rewrites relative API requests to the absolute native API origin.
 *
 * No-op on web and dev live-reload (where `environment.apiBaseUrl` is empty and
 * requests stay same-origin through the Angular dev proxy). Registered LAST so
 * the tenant/auth/error interceptors still see the original relative URLs.
 */
export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const base = environment.apiBaseUrl?.replace(/\/+$/, '');
  if (!base || /^https?:\/\//i.test(req.url)) {
    return next(req);
  }

  const isApiRequest = API_PREFIXES.some(
    (prefix) => req.url === prefix || req.url.startsWith(`${prefix}/`),
  );
  if (!isApiRequest) {
    return next(req);
  }

  return next(req.clone({ url: `${base}${req.url}` }));
};
