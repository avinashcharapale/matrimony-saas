import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'features',
    loadComponent: () =>
      import('./pages/features/features').then((m) => m.Features),
  },
  {
    path: 'pricing',
    loadComponent: () =>
      import('./pages/pricing/pricing').then((m) => m.Pricing),
  },
  { path: '**', redirectTo: '' },
];
