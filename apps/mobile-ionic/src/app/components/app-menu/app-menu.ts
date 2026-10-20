import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ProfileClient } from '@org/generated';
import { AuthStore } from '@org/data-access-auth';
import { TenantService } from '../../services/tenant.service';
import { getDefaultAvatar, resolvePhotoUrl } from '../../utils/default-avatar';

interface MenuNavItem {
  path: string;
  icon: string;
  label: string;
  flag: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-menu',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app-menu.html',
  styleUrl: './app-menu.css',
})
export class AppMenu {
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly profileClient = inject(ProfileClient);
  private readonly tenantService = inject(TenantService);

  readonly tenant = this.tenantService.tenant;
  readonly defaultAvatar = getDefaultAvatar();
  readonly userName = signal('');
  readonly userOccupation = signal('');
  readonly userPhotoUrl = signal('');

  readonly navItems: MenuNavItem[] = [
    { path: '/home', icon: 'home-outline', label: 'Home', flag: 'dashboard' },
    { path: '/my-profile', icon: 'person-outline', label: 'My Profile', flag: 'myProfile' },
    { path: '/my-photos', icon: 'images-outline', label: 'My Photos', flag: 'myPhotos' },
    { path: '/profiles', icon: 'search-outline', label: 'Search', flag: 'search' },
    { path: '/interests', icon: 'heart-outline', label: 'Interests', flag: 'interests' },
    { path: '/shortlists', icon: 'star-outline', label: 'Shortlists', flag: 'shortlists' },
    { path: '/messages', icon: 'mail-outline', label: 'Messages', flag: 'messages' },
    { path: '/events', icon: 'calendar-outline', label: 'Events', flag: 'events' },
    { path: '/payments', icon: 'cash-outline', label: 'Payments', flag: 'payments' },
    { path: '/settings', icon: 'settings-outline', label: 'Settings', flag: 'settings' },
  ];

  constructor() {
    effect(() => {
      const userId = this.authStore.userId();
      if (userId) {
        this.loadProfile();
      } else {
        this.userName.set('');
        this.userOccupation.set('');
        this.userPhotoUrl.set('');
      }
    });
  }

  flagEnabled(code: string): boolean {
    return this.tenantService.flagEnabled(code);
  }

  private loadProfile(): void {
    this.profileClient.getMyProfile().subscribe({
      next: (profile) => {
        const fullName = profile.fullName ?? '';
        const genderId = profile.personalDetails?.genderId ?? null;
        const primaryPhoto =
          (profile.photos ?? []).find((photo) => photo.isPrimary) ?? profile.photos?.[0];
        this.userName.set(fullName);
        this.userOccupation.set(profile.occupationText ?? '');
        this.userPhotoUrl.set(
          primaryPhoto?.fileUrl
            ? resolvePhotoUrl(primaryPhoto.fileUrl, fullName, genderId)
            : getDefaultAvatar(fullName, genderId),
        );
      },
      error: () => undefined,
    });
  }

  logout(): void {
    this.authStore.logout().subscribe(() => this.router.navigateByUrl('/login'));
  }
}
