import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileClient, SubscriptionClient } from '@org/generated';
import { AuthStore } from '@org/data-access-auth';
import {
  LocaleService,
  SUPPORTED_LANGUAGES,
} from '@org/i18n';
import { TenantService } from '../../services/tenant.service';
import { resolvePhotoUrl } from '../../utils/default-avatar';

interface UserSettings {
  profileVisibility: 'all' | 'verified' | 'matches';
  emailAlerts: boolean;
  smsAlerts: boolean;
  eventReminders: boolean;
}

const SETTINGS_KEY = 'matrimony_user_settings';
const DEFAULT_SETTINGS: UserSettings = {
  profileVisibility: 'verified',
  emailAlerts: true,
  smsAlerts: false,
  eventReminders: true,
};

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule, TranslateModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly profileClient = inject(ProfileClient);
  private readonly subscriptionClient = inject(SubscriptionClient);
  readonly localeService = inject(LocaleService);
  private readonly tenantService = inject(TenantService);

  readonly userName = signal('');
  readonly userPhotoUrl = signal('');
  readonly userOccupation = signal('');
  readonly subscriptionLabel = signal('');
  readonly languages = SUPPORTED_LANGUAGES;
  readonly themes = this.tenantService.themes;
  readonly activeThemeId = signal(this.tenantService.activeThemeId);
  readonly settings = signal<UserSettings>(this.loadSettings());
  readonly savedMessage = signal('');

  ngOnInit(): void {
    this.fetchProfile();
  }

  private loadSettings(): UserSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) as Partial<UserSettings> };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  private fetchProfile(): void {
    this.profileClient.getMyProfile().subscribe({
      next: (profile) => {
        const genderId = profile.personalDetails?.genderId ?? null;
        this.userName.set(profile.fullName || 'My Account');
        const primaryPhoto =
          profile.photos?.find((photo) => photo.isPrimary) ?? profile.photos?.[0];
        this.userPhotoUrl.set(
          resolvePhotoUrl(primaryPhoto?.fileUrl, profile.fullName, genderId),
        );
        this.userOccupation.set(profile.occupationText || '');
        const userId = this.authStore.userId();
        if (userId) {
          this.subscriptionClient.getUserSubscriptionStatus(userId).subscribe({
            next: (s) => {
              if (s.isExpired) this.subscriptionLabel.set('Expired');
              else if (s.planName) this.subscriptionLabel.set(s.planName);
              else if (s.isActive) this.subscriptionLabel.set('Active');
              else this.subscriptionLabel.set('Free');
            },
          });
        }
      },
    });
  }

  onLanguageChange(event: Event): void {
    const code = (event as CustomEvent<{ value?: string }>).detail?.value;
    if (code) {
      this.localeService.setLanguage(code);
    }
  }

  onThemeChange(themeId: string): void {
    this.tenantService.setTheme(themeId);
    this.activeThemeId.set(this.tenantService.activeThemeId);
  }

  setVisibility(event: Event): void {
    const value = (event as CustomEvent<{ value?: UserSettings['profileVisibility'] }>).detail?.value;
    if (value) {
      this.settings.update(s => ({ ...s, profileVisibility: value }));
    }
  }

  togglePref(key: 'emailAlerts' | 'smsAlerts' | 'eventReminders', event: Event): void {
    const checked = (event as CustomEvent<{ checked?: boolean }>).detail?.checked ?? false;
    this.settings.update(s => ({ ...s, [key]: checked }));
  }

  save(): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings()));
    this.savedMessage.set('settings.saved');
    setTimeout(() => this.savedMessage.set(''), 2500);
  }

  logout(): void {
    this.authStore.logout().subscribe(() => this.router.navigateByUrl('/login'));
  }
}
