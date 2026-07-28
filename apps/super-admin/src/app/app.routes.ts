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
        path: 'platform-admins',
        loadComponent: () =>
          import('./pages/platform-admins/platform-admins').then((m) => m.PlatformAdmins),
      },
      {
        path: 'platform-roles',
        loadComponent: () =>
          import('./pages/platform-roles/platform-roles').then((m) => m.PlatformRoles),
      },
      {
        path: 'platform-permissions',
        loadComponent: () =>
          import('./pages/platform-permissions/platform-permissions').then((m) => m.PlatformPermissions),
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
