import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MemberService } from '../../services/member.service';
import { AuthService } from '../../services/auth.service';
import { SubscriptionStore } from '@org/data-access-subscription';
import { SharedSidebarComponent } from '../../components/shared-sidebar/shared-sidebar.component';
import { getDefaultAvatar, resolvePhotoUrl } from '../../utils/default-avatar';
import { TenantService } from '../../services/tenant.service';

interface UserSettings {
  profileVisibility: 'all' | 'verified' | 'matches';
  emailAlerts: boolean;
  smsAlerts: boolean;
  eventReminders: boolean;
}

const SETTINGS_KEY = 'matrimony_user_settings';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedSidebarComponent],
  template: `
    <section class="search-page">
      <div class="search-shell">
        <app-shared-sidebar
          [userName]="userName()"
          [userPhotoUrl]="userPhotoUrl()"
          [userOccupation]="userOccupation()"
          [subscriptionStatus]="subscriptionStatus()"
          [subscriptionLoading]="subscriptionLoading()">
        </app-shared-sidebar>

        <div class="page-content">
          <header class="page-header">
            <p class="eyebrow">Preferences</p>
            <h1>Settings</h1>
          </header>

          <section class="theme-preferences" aria-labelledby="theme-heading">
            <div class="section-heading">
              <p class="eyebrow">Appearance</p>
              <h2 id="theme-heading">Choose a theme</h2>
              <p class="section-description">Your selection is saved on this device and updates the app immediately.</p>
            </div>
            <div class="theme-options" role="radiogroup" aria-label="Available themes">
              @for (theme of themes; track theme.id) {
                <button
                  type="button"
                  class="theme-option"
                  [class.selected]="activeThemeId() === theme.id"
                  [attr.aria-checked]="activeThemeId() === theme.id"
                  role="radio"
                  (click)="selectTheme(theme.id)">
                  <span class="theme-swatch" [style.background]="'linear-gradient(135deg, ' + theme.primary + ', ' + theme.accent + ')'" aria-hidden="true"></span>
                  <span class="theme-option-copy">
                    <strong>{{ theme.name }}</strong>
                    <span>{{ theme.id === activeThemeId() ? 'Active theme' : 'Use this theme' }}</span>
                  </span>
                </button>
              }
            </div>
          </section>

          <form class="settings-form" (ngSubmit)="save()">
            <label class="field-label">
              <span>Profile Visibility</span>
              <select [(ngModel)]="settings.profileVisibility" name="profileVisibility">
                <option value="all">Visible to all members</option>
                <option value="verified">Only verified profiles</option>
                <option value="matches">Only suggested matches</option>
              </select>
            </label>

            <label class="checkbox-label"><input type="checkbox" [(ngModel)]="settings.emailAlerts" name="emailAlerts" /> <span>Email alerts</span></label>
            <label class="checkbox-label"><input type="checkbox" [(ngModel)]="settings.smsAlerts" name="smsAlerts" /> <span>SMS alerts</span></label>
            <label class="checkbox-label"><input type="checkbox" [(ngModel)]="settings.eventReminders" name="eventReminders" /> <span>Event reminders</span></label>

            <button class="save-settings-button" type="submit">Save Settings</button>
            @if (savedMessage()) {
            <p class="saved">{{ savedMessage() }}</p>
            }
          </form>
        </div>
      </div>
    </section>
  `,
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  readonly savedMessage = signal('');
  settings: UserSettings = {
    profileVisibility: 'verified',
    emailAlerts: true,
    smsAlerts: false,
    eventReminders: true,
  };

  private readonly memberService = inject(MemberService);
  private readonly authService = inject(AuthService);
  private readonly subscriptionStore = inject(SubscriptionStore);
  private readonly tenantService = inject(TenantService);

  readonly themes = this.tenantService.themes;
  readonly activeThemeId = signal(this.tenantService.activeThemeId);

  readonly userName = signal('');
  readonly userPhotoUrl = signal('');
  readonly userOccupation = signal('');
  readonly subscriptionStatus = this.subscriptionStore.status;
  readonly subscriptionLoading = computed(() => this.subscriptionStore.loading());

  constructor() {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      this.settings = { ...this.settings, ...(JSON.parse(raw) as Partial<UserSettings>) };
    }
  }

  ngOnInit(): void {
    const userId = this.authService.getSession()?.userId ?? 0;
    if (userId) {
      this.subscriptionStore.loadSubscriptionStatus(userId).subscribe();
    }

    this.memberService.getMyProfile().subscribe({
      next: (profile) => {
        const fullName = profile.fullName ?? '';
        const genderId = profile.personalDetails?.genderId ?? null;
        const primaryPhoto = (profile.photos ?? []).find(ph => ph.isPrimary) ?? profile.photos?.[0];
        const photoUrl = primaryPhoto
          ? resolvePhotoUrl(primaryPhoto.fileUrl, fullName, genderId)
          : getDefaultAvatar(fullName, genderId);

        this.userName.set(fullName);
        this.userPhotoUrl.set(photoUrl);
        this.userOccupation.set(profile.occupationText ?? '');
      },
      error: () => {},
    });
  }

  selectTheme(themeId: string): void {
    this.tenantService.setTheme(themeId);
    this.activeThemeId.set(this.tenantService.activeThemeId);
  }

  save(): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    this.savedMessage.set('Settings saved successfully.');
  }
}
