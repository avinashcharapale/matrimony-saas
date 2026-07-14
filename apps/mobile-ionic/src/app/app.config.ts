import {
  ApplicationConfig,
  inject,
  importProvidersFrom,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { appRoutes } from './app.routes';
import { tenantInterceptor } from './interceptors/tenant.interceptor';
import { authInterceptor } from '@org/core-auth';
import { TenantService } from './services/tenant.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    importProvidersFrom(IonicModule.forRoot()),
    provideHttpClient(withInterceptors([tenantInterceptor, authInterceptor])),
    provideAppInitializer(() => inject(TenantService).initialize()),
  ],
};
