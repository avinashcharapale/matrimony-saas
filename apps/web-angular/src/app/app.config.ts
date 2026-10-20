import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  TranslateHttpLoader,
} from '@ngx-translate/http-loader';
import {
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';
import { appRoutes } from './app.routes';
import {
  tenantInterceptor,
  authInterceptor,
  correlationInterceptor,
  loadingInterceptor,
  errorInterceptor,
  TENANT_HOST_OVERRIDE,
  SIGNALR_BASE_URL,
} from '@org/core';
import { baseUrlInterceptor } from './interceptors/base-url.interceptor';
import { environment } from '../environments/environment';
import { TenantService } from './services/tenant.service';
import { LocaleService } from '@org/i18n';
import { TENANT_CONTEXT, TenantContextFactory } from '@org/data-access-registration';

function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

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
        // Rewrites relative API URLs to the native API origin — must stay last.
        baseUrlInterceptor,
      ]),
    ),
    { provide: TENANT_HOST_OVERRIDE, useValue: environment.tenantHost ?? '' },
    { provide: SIGNALR_BASE_URL, useValue: environment.apiBaseUrl ?? '' },
    ...(TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => createTranslateLoader(http),
        deps: [HttpClient],
      },
    }).providers ?? []),
    provideAppInitializer(() => inject(TenantService).initialize()),
    provideAppInitializer(() => {
      const tenant = inject(TenantService);
      const locale = inject(LocaleService);
      locale.initialize(tenant.tenant);
    }),
    {
      provide: TENANT_CONTEXT,
      useFactory: (tenant: TenantService): TenantContextFactory => () => ({
        tenantId: (tenant.tenantHeaderId ?? tenant.tenant.id ?? 'default') as string,
        tenantHeaderId: tenant.tenantHeaderId,
      }),
      deps: [TenantService],
    },
  ],
};
