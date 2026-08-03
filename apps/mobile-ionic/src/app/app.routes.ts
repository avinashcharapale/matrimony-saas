import { Route } from '@angular/router';
import { authGuard } from '@org/core-auth';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing').then((m) => m.Landing),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then((m) => m.Register),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'payments',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/payments/payments').then((m) => m.Payments),
  },
  {
    path: 'profiles',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/profile-list/profile-list').then((m) => m.ProfileList),
  },
  {
    path: 'profiles/:id',
    loadComponent: () =>
      import('./pages/profile-detail/profile-detail').then(
        (m) => m.ProfileDetail,
      ),
  },
  {
    path: 'plans',
    loadComponent: () =>
      import('./pages/plans/plans').then((m) => m.Plans),
  },
  {
    path: 'search',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/profile-list/profile-list').then((m) => m.ProfileList),
  },
  {
    path: 'rules',
    loadComponent: () =>
      import('./pages/menu-page/menu-page').then((m) => m.MenuPage),
    data: {
      title: 'Rules & Guidelines',
      description:
        'Clear and simple membership rules to keep matchmaking safe and respectful for everyone.',
      highlights: [
        'Profiles must contain genuine details and recent information.',
        'Contact details are shared only after account verification.',
        'Respectful communication is required across all interactions.',
      ],
    },
  },
  {
    path: 'success-stories',
    loadComponent: () =>
      import('./pages/menu-page/menu-page').then((m) => m.MenuPage),
    data: {
      title: 'Success Stories',
      description:
        'Real stories from families and couples who found their life partner through our platform.',
      highlights: [
        'Trusted by thousands of families across Maharashtra.',
        'Verified journeys from first match to wedding.',
        'Motivating experiences to guide your own search.',
      ],
    },
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/menu-page/menu-page').then((m) => m.MenuPage),
    data: {
      title: 'Contact Us',
      description:
        'Reach our support team for registration help, profile updates, and matchmaking guidance.',
      highlights: [
        'Phone and email support for quick assistance.',
        'Guidance for profile creation and verification.',
        'Help desk available for renewal and login issues.',
      ],
    },
  },
  { path: 'success', redirectTo: 'success-stories', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];
