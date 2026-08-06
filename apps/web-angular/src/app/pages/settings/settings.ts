import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MemberService } from '../../services/member.service';
import { AuthService } from '../../services/auth.service';
import { SubscriptionStore } from '@org/data-access-subscription';
import { SharedSidebarComponent } from '../../components/shared-sidebar/shared-sidebar.component';
import { LanguageSelectorComponent } from '../../components/language-selector/language-selector.component';
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
  imports: [CommonModule, FormsModule, SharedSidebarComponent, TranslateModule, LanguageSelectorComponent],
  templateUrl: './settings.html',
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
  private readonly translate = inject(TranslateService);

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
    this.savedMessage.set(this.translate.instant('settings.saved'));
  }
}
