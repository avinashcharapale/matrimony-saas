import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
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
  imports: [CommonModule, RouterModule, TranslateModule, SharedSidebarComponent],
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
            <p class="eyebrow">{{ 'interests.eyebrow' | translate }}</p>
            <h1>{{ 'nav.interests' | translate }}</h1>
            <p>{{ 'interests.subtitle' | translate }}</p>
          </header>

          <div class="tabs">
            <button type="button" [class.active]="activeTab() === 'received'" (click)="activeTab.set('received')">{{ 'interests.received' | translate }} ({{ receivedCount() }})</button>
            <button type="button" [class.active]="activeTab() === 'sent'" (click)="activeTab.set('sent')">{{ 'interests.sent' | translate }} ({{ sentCount() }})</button>
          </div>

          <section class="cards">
            @if (isLoading()) {
              <div class="empty-state">{{ 'common.loading' | translate }}</div>
            } @else if (visibleInterests().length > 0) {
              @for (item of visibleInterests(); track item.id) {
              <article class="card">
                <div class="card-body">
                  <h2><a [routerLink]="['/profiles', item.profileId]" class="profile-link">{{ item.name || ('interests.unknown' | translate) }}</a></h2>
                  <p>{{ item.detail || (('interests.interest' | translate) + ' ' + item.status) }}</p>
                  @if (item.date) {
                    <p class="card-date">{{ item.date }}</p>
                  }
                </div>
                <div class="card-actions">
                  <span class="status" [class.accepted]="item.status === 'Accepted'" [class.declined]="item.status === 'Declined'" [class.withdrawn]="item.status === 'Withdrawn'">
                    {{ item.status }}
                  </span>
                  @if (activeTab() === 'received' && item.status === 'Pending') {
                  <button type="button" class="accept" (click)="respondToInterest(item.id, InterestRequestStatus.Accepted)">{{ 'interests.accept' | translate }}</button>
                  <button type="button" class="decline" (click)="respondToInterest(item.id, InterestRequestStatus.Declined)">{{ 'interests.decline' | translate }}</button>
                  }
                  @if (activeTab() === 'sent' && item.status === 'Pending') {
                  <button type="button" class="withdraw" (click)="withdrawInterest(item.id)">{{ 'interests.withdraw' | translate }}</button>
                  }
                </div>
              </article>
              }
            } @else {
              <div class="empty-state">
                @if (activeTab() === 'received') {
                <p>{{ 'interests.noReceivedYet' | translate }}</p>
                } @else {
                <p>{{ 'interests.noSentYet' | translate }}</p>
                }
              </div>
            }
          </section>
        </div>
      </div>
    </section>
  `,
  styleUrl: './interests.css',
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
    const name = type === 'received' ? (r.requesterName ?? '') : (r.targetName ?? '');
    const status = r.status ?? InterestRequestStatus.Pending;
    const profileId = type === 'received' ? (r.requesterProfileId ?? 0) : (r.targetProfileId ?? 0);
    const date = r.createdAt ? this.formatDate(r.createdAt) : '';
    return {
      id: String(r.interestRequestId ?? ''),
      name,
      detail: r.message ?? '',
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
