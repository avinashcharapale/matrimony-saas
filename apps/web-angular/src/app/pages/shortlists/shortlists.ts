import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
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
  imports: [CommonModule, RouterModule, SharedSidebarComponent],
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
            <p class="eyebrow">My Activity</p>
            <h1>Shortlists</h1>
            <p>Manage profiles you saved and see who viewed you.</p>
          </header>

          <div class="tabs">
            <button type="button" [class.active]="activeTab() === 'saved'" (click)="activeTab.set('saved')">Saved ({{ savedCount() }})</button>
            <button type="button" [class.active]="activeTab() === 'viewed'" (click)="activeTab.set('viewed')">Viewed By Others ({{ viewedCount() }})</button>
          </div>

          <section class="cards">
            @if (isLoading()) {
              <div class="empty-state">Loading...</div>
            } @else if (activeTab() === 'saved' && savedItems().length > 0) {
              @for (item of savedItems(); track item.profileId) {
              <article class="card">
                <div class="card-body">
                  <h2><a [routerLink]="['/profiles', item.profileId]" class="profile-link">{{ item.name }}</a></h2>
                  <p class="card-date">Saved {{ item.date }}</p>
                </div>
              </article>
              }
            } @else if (activeTab() === 'viewed' && viewedItems().length > 0) {
              @for (item of viewedItems(); track item.profileId) {
              <article class="card">
                <div class="card-body">
                  <h2><a [routerLink]="['/profiles', item.profileId]" class="profile-link">{{ item.name }}</a></h2>
                  <p class="card-date">Viewed {{ item.date }}</p>
                </div>
              </article>
              }
            } @else {
              <div class="empty-state">
                @if (activeTab() === 'saved') {
                  <p>No saved profiles yet. Browse profiles and tap Save to add them here.</p>
                } @else {
                  <p>No one has viewed your profile yet.</p>
                }
              </div>
            }
          </section>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
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
      .search-shell {
        display: grid;
        grid-template-columns: 240px minmax(0, 1fr);
        gap: 1.25rem;
        align-items: start;
      }
      .page-content { display: grid; gap: 1rem; }
      .page-header, .tabs, .cards { background: #fff; border: 1px solid #eadfd7; border-radius: 1rem; padding: 1rem; }
      .eyebrow { margin: 0; color: #9a5e45; text-transform: uppercase; font-size: 0.74rem; font-weight: 700; }
      h1 { margin: 0.35rem 0 0; color: #24283a; }
      .page-header p { margin: 0.45rem 0 0; color: #6f7486; }
      .tabs { display: flex; gap: 0.6rem; }
      .tabs button { border: 1px solid #ddcabe; background: #fff; border-radius: 0.6rem; padding: 0.55rem 0.9rem; font-weight: 600; color: #4f566b; cursor: pointer; }
      .tabs button.active { background: #9a5e45; color: #fff; border-color: #9a5e45; }
      .cards { display: grid; gap: 0.7rem; }
      .card { display: flex; justify-content: space-between; gap: 1rem; border: 1px solid #efe2d9; border-radius: 0.8rem; padding: 0.8rem; background: #fcf8f5; }
      .card-body { min-width: 0; }
      .card h2 { margin: 0; font-size: 1rem; color: #2c3042; }
      .profile-link { color: #9a5e45; text-decoration: none; }
      .profile-link:hover { text-decoration: underline; }
      .card-date { margin: 0.35rem 0 0; color: #6c7285; font-size: 0.78rem; }
      .empty-state { text-align: center; padding: 2rem; color: #6f7486; }
      @media (max-width: 900px) {
        .search-shell { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class Shortlists implements OnInit {
  private readonly matchClient = inject(MatchClient);
  private readonly memberService = inject(MemberService);
  private readonly profileClient = inject(ProfileClient);
  private readonly authService = inject(AuthService);
  private readonly subscriptionStore = inject(SubscriptionStore);

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
          results[index] = { ...item, name: profile.fullName ?? profile.profileCode ?? `Profile #${item.profileId}` };
          resolved++;
          if (resolved >= results.length) finalize();
        },
        error: () => {
          results[index] = { ...item, name: `Profile #${item.profileId}` };
          resolved++;
          if (resolved >= results.length) finalize();
        },
      });
    });
  }

  private formatDate(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }
}
