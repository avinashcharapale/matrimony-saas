import { Route } from '@angular/router';
import { authGuard } from '@org/core';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout').then((m) => m.Layout),
    children: [
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
        loadComponent: () =>
          import('./pages/home/home').then((m) => m.Home),
        canActivate: [authGuard],
      },
      {
        path: 'profiles',
        loadComponent: () =>
          import('./pages/profile-list/profile-list').then((m) => m.ProfileList),
        canActivate: [authGuard],
      },
      {
        path: 'profiles/:id',
        loadComponent: () =>
          import('./pages/profile-detail/profile-detail').then(
            (m) => m.ProfileDetail,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'interests',
        loadComponent: () =>
          import('./pages/interests/interests').then((m) => m.Interests),
        canActivate: [authGuard],
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./pages/messages/messages').then((m) => m.Messages),
        canActivate: [authGuard],
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./pages/events/events').then((m) => m.Events),
        canActivate: [authGuard],
      },
      {
        path: 'gallery',
        loadComponent: () =>
          import('./pages/photo-gallery/photo-gallery').then(
            (m) => m.PhotoGallery,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings').then((m) => m.Settings),
        canActivate: [authGuard],
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
        path: 'search',
        loadComponent: () =>
          import('./pages/profile-list/profile-list').then((m) => m.ProfileList),
        canActivate: [authGuard],
      },
      {
        path: 'success-stories',
        loadComponent: () =>
          import('./pages/success-stories/success-stories').then(
            (m) => m.SuccessStories,
          ),
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
    ],
  },
];
