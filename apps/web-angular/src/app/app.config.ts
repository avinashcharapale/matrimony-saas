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
import {
  tenantInterceptor,
  authInterceptor,
  correlationInterceptor,
  loadingInterceptor,
  errorInterceptor,
} from '@org/core';
import { TenantService } from './services/tenant.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([
        errorInterceptor,
        loadingInterceptor,
        correlationInterceptor,
        tenantInterceptor,
        authInterceptor,
      ]),
    ),
    provideAppInitializer(() => inject(TenantService).initialize()),
  ],
};
