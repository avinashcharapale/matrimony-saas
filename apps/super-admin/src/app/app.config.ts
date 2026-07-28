import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import {
  tenantInterceptor,
  correlationInterceptor,
  loadingInterceptor,
  errorInterceptor,
} from '@org/core';
import { platformAuthInterceptor } from './interceptors/platform-auth.interceptor';
import { TenantService } from './services/tenant.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(
      withInterceptors([
        errorInterceptor,
        loadingInterceptor,
        correlationInterceptor,
        tenantInterceptor,
        platformAuthInterceptor,
      ]),
    ),
    provideAppInitializer(() => inject(TenantService).initialize()),
  ],
};
