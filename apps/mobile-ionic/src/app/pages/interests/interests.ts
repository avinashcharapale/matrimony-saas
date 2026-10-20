import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthStore } from '@org/data-access-auth';
import { MatchClient, ProfileClient, InterestRequestStatus, InterestRequestDto } from '@org/generated';

interface InterestCard {
  id: number;
  otherProfileId: number;
  name: string;
  message: string;
  status: InterestRequestStatus;
  type: 'received' | 'sent';
  date: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-interests',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './interests.html',
  styleUrl: './interests.css',
})
export class Interests implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly matchClient = inject(MatchClient);
  private readonly profileClient = inject(ProfileClient);

  currentTab = signal<'received' | 'sent'>('received');
  readonly receivedCards = signal<InterestCard[]>([]);
  readonly sentCards = signal<InterestCard[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly busyId = signal<number | null>(null);

  readonly receivedCount = () => this.receivedCards().length;
  readonly sentCount = () => this.sentCards().length;

  private myProfileId = 0;

  ngOnInit(): void {
    if (!this.authStore.isAuthenticated()) {
      this.isLoading.set(false);
      return;
    }
    const userId = this.authStore.userId();
    if (!userId) {
      this.errorMessage.set('Please sign in to view interests.');
      this.isLoading.set(false);
      return;
    }

    this.profileClient.getMyProfile().subscribe({
      next: (profile) => {
        const pid = (profile as Record<string, unknown>)['profileId'] ?? (profile as Record<string, unknown>)['userId'];
        this.myProfileId = Number(pid ?? userId);
        this.loadInterests();
      },
      error: () => {
        this.errorMessage.set('Could not load your profile.');
        this.isLoading.set(false);
      },
    });
  }

  switchTab(tab: 'received' | 'sent'): void {
    this.currentTab.set(tab);
  }

  accept(card: InterestCard): void {
    if (this.busyId()) return;
    this.busyId.set(card.id);
    this.matchClient.respondToInterestRequest(card.id, { status: InterestRequestStatus.Accepted }).subscribe({
      next: () => {
        this.receivedCards.update((cards) => cards.map((c) => c.id === card.id ? { ...c, status: InterestRequestStatus.Accepted } : c));
        this.busyId.set(null);
      },
      error: () => this.busyId.set(null),
    });
  }

  decline(card: InterestCard): void {
    if (this.busyId()) return;
    this.busyId.set(card.id);
    this.matchClient.respondToInterestRequest(card.id, { status: InterestRequestStatus.Declined }).subscribe({
      next: () => {
        this.receivedCards.update((cards) => cards.map((c) => c.id === card.id ? { ...c, status: InterestRequestStatus.Declined } : c));
        this.busyId.set(null);
      },
      error: () => this.busyId.set(null),
    });
  }

  withdraw(card: InterestCard): void {
    if (this.busyId()) return;
    this.busyId.set(card.id);
    this.matchClient.withdrawInterestRequest(card.id).subscribe({
      next: () => {
        this.sentCards.update((cards) => cards.map((c) => c.id === card.id ? { ...c, status: InterestRequestStatus.Withdrawn } : c));
        this.busyId.set(null);
      },
      error: () => this.busyId.set(null),
    });
  }

  private loadInterests(): void {
    if (!this.myProfileId) {
      this.errorMessage.set('Could not load your profile.');
      this.isLoading.set(false);
      return;
    }

    let done = 0;
    const finalize = () => { done += 1; if (done === 2) this.isLoading.set(false); };

    this.matchClient.getInterestRequestsByTarget(this.myProfileId).subscribe({
      next: (list) => {
        this.receivedCards.set(list.map((r) => this.mapToCard(r, 'received')));
        finalize();
      },
      error: () => finalize(),
    });

    this.matchClient.getInterestRequestsByRequester(this.myProfileId).subscribe({
      next: (list) => {
        this.sentCards.set(list.map((r) => this.mapToCard(r, 'sent')));
        finalize();
      },
      error: () => finalize(),
    });
  }

  private mapToCard(r: InterestRequestDto, type: 'received' | 'sent'): InterestCard {
    const isReceived = type === 'received';
    const otherId = isReceived ? (r.requesterProfileId ?? 0) : (r.targetProfileId ?? 0);
    const name = isReceived ? (r.requesterName ?? 'Unknown') : (r.targetName ?? 'Unknown');
    const date = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    return {
      id: r.interestRequestId ?? 0,
      otherProfileId: otherId,
      name,
      message: r.message ?? '',
      status: r.status ?? InterestRequestStatus.Pending,
      type,
      date,
    };
  }

  profileLink(profileId: number): string {
    return `/profiles/${profileId}`;
  }
}