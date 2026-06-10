import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { tenantInterceptor } from './interceptors/tenant.interceptor';
import { authInterceptor } from './interceptors/auth.interceptor';
import { TenantService } from './services/tenant.service';
import { provideApi as provideIdentityApi } from '@org/api/identity';
import { provideApi as provideTenantApi } from '@org/api/tenant';
import { provideApi as provideProfileApi } from '@org/api/profile';
import { provideApi as provideSubscriptionApi } from '@org/api/subscription';
import { provideApi as provideMatchApi } from '@org/api/match';
import { provideApi as provideChatApi } from '@org/api/chat';
import { environment } from '../environments/environment';

function resolveGatewayUrl(): string {
  // Allow runtime override (e.g. injected by IIS/server-side rendering)
  const runtimeGatewayUrl = (globalThis as { __gatewayUrl?: string }).__gatewayUrl;
  if (runtimeGatewayUrl) {
    return runtimeGatewayUrl;
  }

  // Use environment file value when set (production builds should set this)
  if (environment.gatewayUrl) {
    return environment.gatewayUrl;
  }

  // Fallback: same origin (IIS/production deployment)
  return globalThis.location?.origin ?? '';
}

export const GATEWAY_URL = resolveGatewayUrl();

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideAnimations(),
    provideHttpClient(withInterceptors([tenantInterceptor, authInterceptor])),
    provideIdentityApi(GATEWAY_URL),
    provideTenantApi(GATEWAY_URL),
    provideProfileApi(GATEWAY_URL),
    provideSubscriptionApi(GATEWAY_URL),
    provideMatchApi(GATEWAY_URL),
    provideChatApi(GATEWAY_URL),
    provideAppInitializer(() => inject(TenantService).initialize()),
  ],
};
