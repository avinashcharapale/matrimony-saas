import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatchClient, InterestRequestDto, InterestRequestStatus } from '@org/generated';
import { MemberService } from '../../services/member.service';
import { AuthService } from '../../services/auth.service';
import { SubscriptionStore } from '@org/data-access-subscription';
import { SharedSidebarComponent } from '../../components/shared-sidebar/shared-sidebar.component';
import { getDefaultAvatar, resolvePhotoUrl } from '../../utils/default-avatar';
import { finalize } from 'rxjs/operators';

interface InterestCard {
  id: string;
  name: string;
  detail: string;
  status: InterestRequestStatus;
  type: 'received' | 'sent';
  profileId: number;
  date: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-interests',
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
            <h1>Interests</h1>
            <p>Review who connected with you and track requests you sent.</p>
          </header>

          <div class="tabs">
            <button type="button" [class.active]="activeTab() === 'received'" (click)="activeTab.set('received')">Received ({{ receivedCount() }})</button>
            <button type="button" [class.active]="activeTab() === 'sent'" (click)="activeTab.set('sent')">Sent ({{ sentCount() }})</button>
          </div>

          <section class="cards">
            @if (isLoading()) {
              <div class="empty-state">Loading...</div>
            } @else if (visibleInterests().length > 0) {
              @for (item of visibleInterests(); track item.id) {
              <article class="card">
                <div class="card-body">
                  <h2><a [routerLink]="['/profiles', item.profileId]" class="profile-link">{{ item.name }}</a></h2>
                  <p>{{ item.detail }}</p>
                  @if (item.date) {
                    <p class="card-date">{{ item.date }}</p>
                  }
                </div>
                <div class="card-actions">
                  <span class="status" [class.accepted]="item.status === 'Accepted'" [class.declined]="item.status === 'Declined'" [class.withdrawn]="item.status === 'Withdrawn'">
                    {{ item.status }}
                  </span>
                  @if (activeTab() === 'received' && item.status === 'Pending') {
                  <button type="button" class="accept" (click)="respondToInterest(item.id, InterestRequestStatus.Accepted)">Accept</button>
                  <button type="button" class="decline" (click)="respondToInterest(item.id, InterestRequestStatus.Declined)">Decline</button>
                  }
                  @if (activeTab() === 'sent' && item.status === 'Pending') {
                  <button type="button" class="withdraw" (click)="withdrawInterest(item.id)">Withdraw</button>
                  }
                </div>
              </article>
              }
            } @else {
              <div class="empty-state">
                <p>No {{ activeTab() }} interests yet.</p>
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
      .card p { margin: 0.35rem 0 0; color: #6c7285; }
      .card-date { font-size: 0.78rem; color: #9a9ab0; }
      .card-actions { display: flex; align-items: center; gap: 0.45rem; flex-shrink: 0; }
      .status { text-transform: capitalize; font-size: 0.8rem; color: #8a5d49; background: #f4e7df; padding: 0.25rem 0.55rem; border-radius: 999px; }
      .status.accepted { background: #e2f4e8; color: #1f7c3d; }
      .status.declined { background: #f8e3e3; color: #9e2c2c; }
      .status.withdrawn { background: #e8e8f0; color: #5a5a7a; }
      .accept, .decline, .withdraw { border: none; border-radius: 0.5rem; padding: 0.45rem 0.7rem; cursor: pointer; font-weight: 600; }
      .accept { background: #2f8d4e; color: #fff; }
      .decline { background: #be4343; color: #fff; }
      .withdraw { background: #6f7486; color: #fff; }
      .empty-state { text-align: center; padding: 2rem; color: #6f7486; }
      @media (max-width: 900px) {
        .search-shell { grid-template-columns: 1fr; }
      }
      @media (max-width: 700px) { .card { flex-direction: column; } }
    `,
  ],
})
export class Interests implements OnInit {
  readonly InterestRequestStatus = InterestRequestStatus;
  private readonly matchClient = inject(MatchClient);
  private readonly memberService = inject(MemberService);
  private readonly authService = inject(AuthService);
  private readonly subscriptionStore = inject(SubscriptionStore);

  readonly subscriptionStatus = this.subscriptionStore.status;
  readonly subscriptionLoading = computed(() => this.subscriptionStore.loading());

  readonly userName = signal('');
  readonly userPhotoUrl = signal('');
  readonly userOccupation = signal('');

  readonly activeTab = signal<'received' | 'sent'>('received');
  readonly isLoading = signal(true);
  readonly receivedCount = signal(0);
  readonly sentCount = signal(0);

  private readonly interests = signal<InterestCard[]>([]);

  readonly visibleInterests = computed(() =>
    this.interests().filter((item) => item.type === this.activeTab())
  );

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
          this.loadInterests(profile.profileId);
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => this.isLoading.set(false),
    });
  }

  private loadInterests(profileId: number): void {
    this.isLoading.set(true);

    let completedCount = 0;
    const allCards: InterestCard[] = [];

    const checkDone = () => {
      completedCount++;
      if (completedCount >= 2) {
        this.receivedCount.set(allCards.filter((c) => c.type === 'received').length);
        this.sentCount.set(allCards.filter((c) => c.type === 'sent').length);
        this.interests.set(allCards);
        this.isLoading.set(false);
      }
    };

    this.matchClient.getInterestRequestsByTarget(profileId).pipe(
      finalize(() => checkDone()),
    ).subscribe({
      next: (requests) => {
        const cards = requests.map((r) => this.mapToCard(r, 'received'));
        allCards.push(...cards);
      },
      error: () => {},
    });

    this.matchClient.getInterestRequestsByRequester(profileId).pipe(
      finalize(() => checkDone()),
    ).subscribe({
      next: (requests) => {
        const cards = requests.map((r) => this.mapToCard(r, 'sent'));
        allCards.push(...cards);
      },
      error: () => {},
    });
  }

  private mapToCard(r: InterestRequestDto, type: 'received' | 'sent'): InterestCard {
    const name = type === 'received' ? (r.requesterName ?? 'Unknown') : (r.targetName ?? 'Unknown');
    const status = r.status ?? InterestRequestStatus.Pending;
    const profileId = type === 'received' ? (r.requesterProfileId ?? 0) : (r.targetProfileId ?? 0);
    const date = r.createdAt ? this.formatDate(r.createdAt) : '';
    return {
      id: String(r.interestRequestId ?? ''),
      name,
      detail: r.message ?? `Interest ${status}`,
      status,
      type,
      profileId,
      date,
    };
  }

  private formatDate(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  respondToInterest(id: string, newStatus: InterestRequestStatus): void {
    const numId = Number(id);
    if (isNaN(numId)) return;

    this.matchClient.respondToInterestRequest(numId, { status: newStatus }).subscribe({
      next: () => {
        this.interests.update(items =>
          items.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
      },
      error: (err: unknown) => {
        console.error('Failed to respond to interest:', err);
      },
    });
  }

  withdrawInterest(id: string): void {
    const numId = Number(id);
    if (isNaN(numId)) return;

    this.matchClient.withdrawInterestRequest(numId).subscribe({
      next: () => {
        this.interests.update(items => {
          const updated = items.map((item) =>
            item.id === id ? { ...item, status: InterestRequestStatus.Withdrawn } : item
          );
          this.sentCount.set(updated.filter((c) => c.type === 'sent').length);
          return updated;
        });
      },
      error: (err: unknown) => {
        console.error('Failed to withdraw interest:', err);
      },
    });
  }
}
