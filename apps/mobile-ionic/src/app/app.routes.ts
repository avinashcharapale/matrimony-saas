import { Route } from '@angular/router';
import { Home } from './pages/home/home';
import { Landing } from './pages/landing/landing';
import { Login } from './pages/login/login';
import { MenuPage } from './pages/menu-page/menu-page';
import { ProfileList } from './pages/profile-list/profile-list';
import { ProfileDetail } from './pages/profile-detail/profile-detail';
import { Register } from './pages/register/register';

export const appRoutes: Route[] = [
  { path: '', component: Landing },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'home', component: Home },
  { path: 'profiles', component: ProfileList },
  { path: 'profiles/:id', component: ProfileDetail },
  { path: 'search', component: ProfileList },
  {
    path: 'rules',
    component: MenuPage,
    data: {
      title: 'Rules & Guidelines',
      description: 'Clear and simple membership rules to keep matchmaking safe and respectful for everyone.',
      highlights: [
        'Profiles must contain genuine details and recent information.',
        'Contact details are shared only after account verification.',
        'Respectful communication is required across all interactions.',
      ],
    },
  },
  {
    path: 'success-stories',
    component: MenuPage,
    data: {
      title: 'Success Stories',
      description: 'Real stories from families and couples who found their life partner through our platform.',
      highlights: [
        'Trusted by thousands of families across Maharashtra.',
        'Verified journeys from first match to wedding.',
        'Motivating experiences to guide your own search.',
      ],
    },
  },
  {
    path: 'contact',
    component: MenuPage,
    data: {
      title: 'Contact Us',
      description: 'Reach our support team for registration help, profile updates, and matchmaking guidance.',
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
