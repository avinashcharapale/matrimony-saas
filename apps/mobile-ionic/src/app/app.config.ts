import {
  ApplicationConfig,
  inject,
  importProvidersFrom,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { appRoutes } from './app.routes';
import {
  authInterceptor,
  correlationInterceptor,
  errorInterceptor,
  loadingInterceptor,
  tenantInterceptor,
} from '@org/core';
import { LocaleService } from '@org/i18n';
import { TenantService } from './services/tenant.service';
import { TENANT_CONTEXT, TenantContextFactory } from '@org/data-access-registration';

function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    importProvidersFrom(IonicModule.forRoot()),
    provideHttpClient(
      withInterceptors([
        errorInterceptor,
        loadingInterceptor,
        correlationInterceptor,
        tenantInterceptor,
        authInterceptor,
      ]),
    ),
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
