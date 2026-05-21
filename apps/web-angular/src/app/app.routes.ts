import { Route } from '@angular/router';
import { Layout } from './layout/layout';
import { Home } from './pages/home/home';
import { Landing } from './pages/landing/landing';
import { MenuPage } from './pages/menu-page/menu-page';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { ProfileList } from './pages/profile-list/profile-list';
import { ProfileDetail } from './pages/profile-detail/profile-detail';
import { Interests } from './pages/interests/interests';
import { Messages } from './pages/messages/messages';
import { Events } from './pages/events/events';
import { PhotoGallery } from './pages/photo-gallery/photo-gallery';
import { Settings } from './pages/settings/settings';
import { SuccessStories } from './pages/success-stories/success-stories';

export const appRoutes: Route[] = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', component: Landing },
      { path: 'login', component: Login },
      { path: 'register', component: Register },
      { path: 'home', component: Home },
      { path: 'profiles', component: ProfileList },
      { path: 'profiles/:id', component: ProfileDetail },
      { path: 'interests', component: Interests },
      { path: 'messages', component: Messages },
      { path: 'events', component: Events },
      { path: 'gallery', component: PhotoGallery },
      { path: 'settings', component: Settings },
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
      { path: 'search', component: ProfileList },
      { path: 'success-stories', component: SuccessStories },
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
    ],
  },
];
