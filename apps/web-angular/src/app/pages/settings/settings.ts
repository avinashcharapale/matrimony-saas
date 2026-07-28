import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MemberService } from '../../services/member.service';
import { AuthService } from '../../services/auth.service';
import { SubscriptionStore } from '@org/data-access-subscription';
import { SharedSidebarComponent } from '../../components/shared-sidebar/shared-sidebar.component';
import { getDefaultAvatar, resolvePhotoUrl } from '../../utils/default-avatar';

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

          <form class="settings-form" (ngSubmit)="save()">
            <label>
              Profile Visibility
              <select [(ngModel)]="settings.profileVisibility" name="profileVisibility">
                <option value="all">Visible to all members</option>
                <option value="verified">Only verified profiles</option>
                <option value="matches">Only suggested matches</option>
              </select>
            </label>

            <label><input type="checkbox" [(ngModel)]="settings.emailAlerts" name="emailAlerts" /> Email alerts</label>
            <label><input type="checkbox" [(ngModel)]="settings.smsAlerts" name="smsAlerts" /> SMS alerts</label>
            <label><input type="checkbox" [(ngModel)]="settings.eventReminders" name="eventReminders" /> Event reminders</label>

            <button type="submit">Save Settings</button>
            @if (savedMessage()) {
            <p class="saved">{{ savedMessage() }}</p>
            }
          </form>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      :host { display: block; }
      :host {
        --bg-soft: #f7f4f1;
        --card: #ffffff;
        --line: #e5e0db;
        --text-main: #1f2230;
        --text-soft: #6d7285;
        --text-muted: #9ca3af;
        --accent: var(--tenant-primary);
        --accent-dark: var(--tenant-accent);
        --accent-soft: color-mix(in srgb, var(--tenant-primary) 8%, #ffffff);
        --accent-border: color-mix(in srgb, var(--tenant-primary) 25%, #ffffff);
        --radius-sm: 8px;
        --radius-md: 12px;
        --radius-lg: 16px;
        display: block;
      }
      .search-page { width: 100%; color: var(--text-main); }
      .search-shell { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 1.25rem; align-items: start; }
      .page-content { display: grid; gap: 1rem; }
      .page-header, .settings-form { background: #fff; border: 1px solid #eadfd7; border-radius: 1rem; padding: 1rem; }
      .eyebrow { margin: 0; color: #9a5e45; text-transform: uppercase; font-size: 0.74rem; font-weight: 700; }
      h1 { margin: 0.35rem 0 0; color: #24283a; }
      .settings-form { display: grid; gap: 0.8rem; }
      label { color: #363d52; font-weight: 600; display: grid; gap: 0.35rem; }
      select { border: 1px solid #dcc8bc; border-radius: 0.6rem; padding: 0.55rem; }
      input[type='checkbox'] { margin-right: 0.45rem; }
      button { width: fit-content; border: none; border-radius: 0.6rem; background: #9a5e45; color: #fff; font-weight: 700; padding: 0.6rem 0.95rem; }
      .saved { margin: 0; color: #1f7c3d; font-weight: 700; }
      @media (max-width: 900px) { .search-shell { grid-template-columns: 1fr; } }
    `,
  ],
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

  save(): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    this.savedMessage.set('Settings saved successfully.');
  }
}
