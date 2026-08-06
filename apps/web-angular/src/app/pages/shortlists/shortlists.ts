import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocaleService } from '@org/i18n';
import { MatchClient, ProfileShortlistDto, ProfileViewDto } from '@org/generated';
import { MemberService } from '../../services/member.service';
import { AuthService } from '../../services/auth.service';
import { ProfileClient } from '@org/generated';
import { SubscriptionStore } from '@org/data-access-subscription';
import { SharedSidebarComponent } from '../../components/shared-sidebar/shared-sidebar.component';
import { getDefaultAvatar, resolvePhotoUrl } from '../../utils/default-avatar';
import { finalize, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

interface ShortlistItem {
  profileId: number;
  name: string;
  date: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-shortlists',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedSidebarComponent, TranslateModule],
  templateUrl: './shortlists.html',
  styleUrl: './shortlists.css',
})
export class Shortlists implements OnInit {
  private readonly matchClient = inject(MatchClient);
  private readonly memberService = inject(MemberService);
  private readonly profileClient = inject(ProfileClient);
  private readonly authService = inject(AuthService);
  private readonly subscriptionStore = inject(SubscriptionStore);
  private readonly translate = inject(TranslateService);
  private readonly localeService = inject(LocaleService);

  readonly subscriptionStatus = this.subscriptionStore.status;
  readonly subscriptionLoading = computed(() => this.subscriptionStore.loading());

  readonly userName = signal('');
  readonly userPhotoUrl = signal('');
  readonly userOccupation = signal('');

  readonly activeTab = signal<'saved' | 'viewed'>('saved');
  readonly isLoading = signal(true);
  readonly savedCount = signal(0);
  readonly viewedCount = signal(0);

  private readonly savedItemsRaw = signal<ShortlistItem[]>([]);
  private readonly viewedItemsRaw = signal<ShortlistItem[]>([]);

  readonly savedItems = computed(() => this.savedItemsRaw());
  readonly viewedItems = computed(() => this.viewedItemsRaw());

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

        if (profile.profileId) {
          this.loadData(profile.profileId);
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => this.isLoading.set(false),
    });
  }

  private loadData(profileId: number): void {
    this.isLoading.set(true);

    let completed = 0;
    const checkDone = () => {
      completed++;
      if (completed >= 2) {
        this.isLoading.set(false);
      }
    };

    this.matchClient.getShortlistsByProfile(profileId).pipe(
      finalize(() => checkDone()),
    ).subscribe({
      next: (shortlists) => {
        const items = shortlists.map(s => ({
          profileId: s.targetProfileId ?? 0,
          name: '',
          date: s.createdAt ? this.formatDate(s.createdAt) : '',
        }));
        this.resolveNamesAndSet(items, this.savedItemsRaw, this.savedCount);
      },
      error: () => {},
    });

    this.matchClient.getViewsByViewed(profileId).pipe(
      finalize(() => checkDone()),
    ).subscribe({
      next: (views) => {
        const items = views.map(v => ({
          profileId: v.viewerProfileId ?? 0,
          name: '',
          date: v.viewedAt ? this.formatDate(v.viewedAt) : '',
        }));
        this.resolveNamesAndSet(items, this.viewedItemsRaw, this.viewedCount);
      },
      error: () => {},
    });
  }

  private resolveNamesAndSet(items: ShortlistItem[], target: ReturnType<typeof signal<ShortlistItem[]>>, countSignal?: ReturnType<typeof signal<number>>): void {
    if (items.length === 0) {
      target.set([]);
      countSignal?.set(0);
      return;
    }

    let resolved = 0;
    const results = [...items];

    const finalize = () => {
      const filtered = results.filter(i => i.profileId);
      target.set(filtered);
      countSignal?.set(filtered.length);
    };

    results.forEach((item, index) => {
      if (!item.profileId) {
        resolved++;
        if (resolved >= results.length) finalize();
        return;
      }

      this.profileClient.getPublicProfileById(item.profileId).subscribe({
        next: (profile) => {
          results[index] = { ...item, name: profile.fullName ?? profile.profileCode ?? this.profileLabel(item.profileId) };
          resolved++;
          if (resolved >= results.length) finalize();
        },
        error: () => {
          results[index] = { ...item, name: this.profileLabel(item.profileId) };
          resolved++;
          if (resolved >= results.length) finalize();
        },
      });
    });
  }

  private profileLabel(id: number): string {
    return `${this.translate.instant('home.profileLabel')} ${id}`.trim();
  }

  private formatDate(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return this.localeService.formatDate(d);
  }
}
