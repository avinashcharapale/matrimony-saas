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
} from '@org/core';
import { TenantService } from './services/tenant.service';
import { LocaleService } from '@org/i18n';

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
  ],
};
