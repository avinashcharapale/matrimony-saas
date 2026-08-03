import { Route } from '@angular/router';
import { adminGuard } from '@org/core';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout').then((m) => m.Layout),
    canActivate: [adminGuard],
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
        path: 'profiles/:id/edit',
        loadComponent: () =>
          import('./pages/edit-profile/edit-profile').then((m) => m.EditProfile),
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
        path: 'payments',
        loadComponent: () =>
          import('./pages/payments/payments').then((m) => m.Payments),
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
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/notifications/notifications').then((m) => m.Notifications),
      },
      {
        path: 'master-data',
        loadComponent: () =>
          import('./pages/master-data/master-data').then((m) => m.MasterData),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings').then((m) => m.Settings),
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
