import { Route } from '@angular/router';
import { authGuard } from '@org/core';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout').then((m) => m.Layout),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'tenants', pathMatch: 'full' },
      {
        path: 'tenants',
        loadComponent: () =>
          import('./pages/tenants/tenants').then((m) => m.Tenants),
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./pages/analytics/analytics').then((m) => m.Analytics),
      },
      {
        path: 'system',
        loadComponent: () =>
          import('./pages/system/system').then((m) => m.System),
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then((m) => m.Login),
  },
  { path: '**', redirectTo: '' },
];
