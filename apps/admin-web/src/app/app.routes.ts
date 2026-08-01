import { Route } from '@angular/router';
import { authGuard } from '@org/core';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout').then((m) => m.Layout),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/users/users').then((m) => m.Users),
      },
      {
        path: 'profiles',
        loadComponent: () =>
          import('./pages/profiles/profiles').then((m) => m.Profiles),
      },
      {
        path: 'profiles/:id',
        loadComponent: () =>
          import('./pages/profile-detail/profile-detail').then((m) => m.ProfileDetail),
      },
      {
        path: 'tenants',
        loadComponent: () =>
          import('./pages/tenants/tenants').then((m) => m.Tenants),
      },
      {
        path: 'subscriptions',
        loadComponent: () =>
          import('./pages/subscriptions/subscriptions').then((m) => m.Subscriptions),
      },
      {
        path: 'subscription-plans',
        loadComponent: () =>
          import('./pages/user-subscription-plans/user-subscription-plans').then((m) => m.UserSubscriptionPlans),
      },
      {
        path: 'tenant-features',
        loadComponent: () =>
          import('./pages/tenant-features/tenant-features').then((m) => m.TenantFeatures),
      },
      {
        path: 'permissions',
        loadComponent: () =>
          import('./pages/permissions/permissions').then((m) => m.Permissions),
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./pages/roles/roles').then((m) => m.Roles),
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
