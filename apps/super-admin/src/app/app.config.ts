import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNativeDateAdapter } from '@angular/material/core';
import { appRoutes } from './app.routes';
import {
  correlationInterceptor,
  loadingInterceptor,
  errorInterceptor,
  notificationInterceptor,
} from '@org/core';
import { platformAuthInterceptor } from './interceptors/platform-auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideNativeDateAdapter(),
    provideRouter(appRoutes),
    provideHttpClient(
      withInterceptors([
        errorInterceptor,
        notificationInterceptor,
        loadingInterceptor,
        correlationInterceptor,
        platformAuthInterceptor,
      ]),
    ),
  ],
};
