import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthStore } from '@org/data-access-auth';
import { ChatClient, MatchClient, RecommendationReason, SubscriptionClient } from '@org/generated';
import { MemberService } from '../../services/member.service';
import { TenantService } from '../../services/tenant.service';
import { getDefaultAvatar, resolvePhotoUrl } from '../../utils/default-avatar';

interface MatchItem {
  id: string;
  profileId?: number;
  name: string;
  detail: string;
  score: number;
  badge: string;
  photoUrl?: string;
}

interface InterestItem {
  id: string;
  name: string;
  profileId?: number;
  status?: string;
  photoUrl?: string;
}

interface ShortlistItem {
  profileId: number;
  name: string;
  detail: string;
  photoUrl?: string;
}

interface MessageItem {
  name: string;
  text: string;
  unread?: number;
  photoUrl?: string;
  conversationId?: number;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  readonly tenant = inject(TenantService).tenant;
  readonly defaultAvatar = getDefaultAvatar();
  private readonly memberService = inject(MemberService);
  private readonly authStore = inject(AuthStore);
  private readonly matchClient = inject(MatchClient);
  private readonly chatClient = inject(ChatClient);
  private readonly subscriptionClient = inject(SubscriptionClient);

  readonly userName = signal('');
  readonly userFirstName = signal('');
  readonly userPhotoUrl = signal('');
  readonly userOccupation = signal('');
  readonly currentDate = signal('');

  readonly interestsCount = signal(0);
  readonly shortlistsCount = signal(0);
  readonly quickStatsLoaded = signal(false);
  readonly quickStats = computed(() => {
    if (!this.quickStatsLoaded()) {
      return [];
    }
    return [
      { label: 'Interests Received', value: String(this.interestsCount()), hint: 'from other profiles', icon: '\u{1F48C}', tone: 'orange' },
      { label: 'Saved Profiles', value: String(this.shortlistsCount()), hint: 'in your shortlist', icon: '\u2B50', tone: 'gold' },
    ];
  });

  readonly subscriptionPlanName = signal('');
  readonly subscriptionActive = signal(false);

  readonly topMatches = signal<MatchItem[]>([]);
  readonly interests = signal<InterestItem[]>([]);
  readonly recentlyShortlisted = signal<ShortlistItem[]>([]);
  readonly messages = signal<MessageItem[]>([]);
  readonly horoscopeTags = signal<string[]>([]);

  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  private myProfileId: number | null = null;
  private myUserId: number | null = null;

  get brandMark(): string {
    return (this.tenant.logoText ?? 'M')
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  ngOnInit(): void {
    this.currentDate.set(this.formatDate(new Date()));
    this.myUserId = this.authStore.session()?.userId ?? null;
    this.loadMyProfile();
    this.loadSubscriptionStatus();
  }

  private formatDate(date: Date): string {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  private formatShortDate(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  }

  private mapInterestStatus(status: unknown): string {
    const val = String(status);
    const map: Record<string, string> = {
      '0': 'Pending',
      '1': 'Accepted',
      '2': 'Declined',
      '3': 'Withdrawn',
      '4': 'Rejected',
    };
    if (map[val]) return map[val];
    const named: Record<string, string> = {
      pending: 'Pending',
      accepted: 'Accepted',
      declined: 'Declined',
      withdrawn: 'Withdrawn',
      rejected: 'Rejected',
    };
    return named[val.trim().toLowerCase()] ?? val;
  }

  private getProfilePhoto(photos?: Array<{ fileUrl?: string }>): string | undefined {
    if (photos && photos.length > 0) {
      const primary = photos.find((p) => p.fileUrl);
      return primary?.fileUrl;
    }
    return undefined;
  }

  private loadMyProfile(): void {
    this.isLoading.set(true);
    this.memberService.getMyProfile().subscribe({
      next: (profile) => {
        const fullName = profile.fullName ?? '';
        const firstName = fullName.split(' ')[0] ?? '';
        const genderId = profile.personalDetails?.genderId ?? null;
        const primaryPhoto = (profile.photos ?? []).find((ph) => ph.isPrimary) ?? profile.photos?.[0];
        const photoUrl = primaryPhoto
          ? resolvePhotoUrl(primaryPhoto.fileUrl, fullName, genderId)
          : getDefaultAvatar(fullName, genderId);

        this.userName.set(fullName);
        this.userFirstName.set(firstName);
        this.userPhotoUrl.set(photoUrl);
        this.userOccupation.set(profile.occupationText ?? '');
        this.myProfileId = profile.profileId ?? null;
        this.isLoading.set(false);

        if (profile.profileId) {
          this.loadTopMatches(profile.profileId);
          this.loadInterests(profile.profileId);
          this.loadShortlists(profile.profileId);
          this.loadQuickStats(profile.profileId);
        }
        this.loadHoroscope(profile);
        if (this.myUserId) {
          this.loadMessages();
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.error.set('Failed to load your dashboard. Please try again.');
      },
    });
  }

  private loadTopMatches(profileId: number): void {
    this.matchClient.getRecommendationsByProfile(profileId).subscribe({
      next: (recommendations) => {
        if (recommendations.length === 0) {
          this.loadFallbackMatches();
          return;
        }
        const top = recommendations.filter((r) => r.recommendedProfileId).slice(0, 5);
        const profileCalls = top.map((r) => this.memberService.getProfileById(r.recommendedProfileId ?? 0, true));

        if (profileCalls.length === 0) {
          this.loadFallbackMatches();
          return;
        }

        forkJoin(profileCalls).subscribe({
          next: (profiles) => {
            const matches: MatchItem[] = profiles.map((p, i) => {
              const rec = top[i];
              const score = rec.score ? Math.round(rec.score) : 0;
              return {
                id: p.profileCode ?? String(p.profileId),
                profileId: p.profileId,
                name: p.fullName ?? 'Unknown',
                detail: [p.age ? `${p.age} yrs` : '', p.locationText, p.occupationText]
                  .filter(Boolean)
                  .join(', '),
                score,
                badge: this.mapRecommendationReason(rec.reasonCode),
                photoUrl: this.getProfilePhoto(p.photos),
              };
            });
            this.topMatches.set(matches);
          },
          error: () => this.loadFallbackMatches(),
        });
      },
      error: () => this.loadFallbackMatches(),
    });
  }

  private loadFallbackMatches(): void {
    this.memberService.getProfiles(1, 5).subscribe({
      next: (response) => {
        const matches: MatchItem[] = response.profiles.map((p) => ({
          id: p.profileCode ?? String(p.profileId),
          profileId: p.profileId,
          name: p.fullName,
          detail: [p.age ? `${p.age} yrs` : '', p.locationText, p.occupationText]
            .filter(Boolean)
            .join(', '),
          score: 0,
          badge: 'new',
          photoUrl: p.thumbnailUrl,
        }));
        this.topMatches.set(matches);
      },
      error: () => { /* noop */ },
    });
  }

  private mapRecommendationReason(code?: RecommendationReason): string {
    if (!code) return 'match';
    const map: Record<number, string> = {
      [RecommendationReason.HighCompatibility]: 'compatibility',
      [RecommendationReason.SimilarProfile]: 'similar',
      [RecommendationReason.RecentlyJoined]: 'new',
      [RecommendationReason.Trending]: 'trending',
      [RecommendationReason.PremiumBoost]: 'premium',
      [RecommendationReason.AiRecommended]: 'AI pick',
      [RecommendationReason.CollaborativeFilter]: 'suggested',
    };
    return map[Number(code)] ?? 'match';
  }

  private loadInterests(profileId: number): void {
    this.matchClient.getInterestRequestsByTarget(profileId).subscribe({
      next: (requests) => {
        const top = requests.slice(0, 5);
        const profileCalls = top
          .filter((r) => r.requesterProfileId)
          .map((r) => this.memberService.getProfileById(r.requesterProfileId ?? 0, true));

        if (profileCalls.length === 0) {
          this.interests.set(
            top.map((r) => ({
              id: String(r.interestRequestId ?? ''),
              name: r.requesterName ?? 'Unknown',
              profileId: r.requesterProfileId,
              status: this.mapInterestStatus(r.status),
            })),
          );
          return;
        }

        forkJoin(profileCalls).subscribe({
          next: (profiles) => {
            const profileMap = new Map(profiles.map((p) => [p.profileId, p]));
            const items: InterestItem[] = top.map((r) => {
              const profile = r.requesterProfileId ? profileMap.get(r.requesterProfileId) : undefined;
              return {
                id: String(r.interestRequestId ?? ''),
                name: r.requesterName ?? profile?.fullName ?? 'Unknown',
                profileId: r.requesterProfileId,
                status: this.mapInterestStatus(r.status),
                photoUrl: profile ? this.getProfilePhoto(profile.photos) : undefined,
              };
            });
            this.interests.set(items);
          },
          error: () => { /* noop */ },
        });
      },
      error: () => { /* noop */ },
    });
  }

  private loadShortlists(profileId: number): void {
    this.matchClient.getShortlistsByProfile(profileId).subscribe({
      next: (shortlists) => {
        const top = shortlists.slice(0, 5);
        const profileCalls = top
          .filter((s) => s.targetProfileId)
          .map((s) => this.memberService.getProfileById(s.targetProfileId ?? 0, true));

        if (profileCalls.length === 0) {
          this.recentlyShortlisted.set(
            top.map((s) => ({
              profileId: s.targetProfileId ?? 0,
              name: `Profile ${s.targetProfileId ?? ''}`.trim(),
              detail: s.createdAt ? `Saved ${this.formatShortDate(s.createdAt)}` : 'Saved',
            })),
          );
          return;
        }

        forkJoin(profileCalls).subscribe({
          next: (profiles) => {
            const profileMap = new Map(profiles.map((p) => [p.profileId, p]));
            const items: ShortlistItem[] = top.map((s) => {
              const profile = s.targetProfileId ? profileMap.get(s.targetProfileId) : undefined;
              return {
                profileId: s.targetProfileId ?? 0,
                name: profile?.fullName ?? `Profile ${s.targetProfileId ?? ''}`.trim(),
                detail: s.createdAt ? `Saved ${this.formatShortDate(s.createdAt)}` : 'Saved',
                photoUrl: profile ? this.getProfilePhoto(profile.photos) : undefined,
              };
            });
            this.recentlyShortlisted.set(items);
          },
          error: () => { /* noop */ },
        });
      },
      error: () => { /* noop */ },
    });
  }

  private loadQuickStats(profileId: number): void {
    let interestsCount = 0;
    let shortlistsCount = 0;
    let completed = 0;

    const done = () => {
      completed++;
      if (completed >= 2) {
        this.interestsCount.set(interestsCount);
        this.shortlistsCount.set(shortlistsCount);
        this.quickStatsLoaded.set(true);
      }
    };

    this.matchClient.getInterestRequestsByTarget(profileId).subscribe({
      next: (r) => {
        interestsCount = r.length;
        done();
      },
      error: () => done(),
    });

    this.matchClient.getShortlistsByProfile(profileId).subscribe({
      next: (s) => {
        shortlistsCount = s.length;
        done();
      },
      error: () => done(),
    });
  }

  private loadMessages(): void {
    if (!this.myUserId) return;
    this.chatClient.getConversationsByUser(this.myUserId).subscribe({
      next: (conversations) => {
        const active = conversations
          .filter((c) => c.status !== 'Deleted' && c.status !== 'Archived')
          .sort((a, b) => {
            const da = a.lastMessageDate ? new Date(a.lastMessageDate).getTime() : 0;
            const db = b.lastMessageDate ? new Date(b.lastMessageDate).getTime() : 0;
            return db - da;
          })
          .slice(0, 5);

        const items: MessageItem[] = active.map((c) => {
          const otherParticipant = (c.participants ?? []).find((p) => p.userId !== this.myUserId);
          const unread =
            (this.myUserId === c.userId1 ? c.unreadMessagesCount1 : c.unreadMessagesCount2) ?? 0;
          return {
            name: otherParticipant?.displayName ?? c.conversationName ?? 'Chat',
            text: c.lastMessagePreview ?? c.lastMessage?.content ?? '',
            unread: unread > 0 ? unread : undefined,
            photoUrl: otherParticipant?.profilePhotoUrl,
            conversationId: c.conversationId,
          };
        });
        this.messages.set(items);
      },
      error: () => { /* noop */ },
    });
  }

  private loadHoroscope(profile: {
    horoscope?: {
      rashiName?: string;
      nakshatraName?: string;
      ganName?: string;
      nadiName?: string;
      charanName?: string;
      devak?: string;
      manglik?: boolean;
    };
  }): void {
    const horoscope = profile.horoscope;
    if (!horoscope) {
      this.horoscopeTags.set([]);
      return;
    }
    const tags: string[] = [];
    if (horoscope.rashiName) tags.push(horoscope.rashiName);
    if (horoscope.nakshatraName) tags.push(horoscope.nakshatraName);
    if (horoscope.ganName) tags.push(`Gan: ${horoscope.ganName}`);
    if (horoscope.nadiName) tags.push(`Nadi: ${horoscope.nadiName}`);
    if (horoscope.charanName) tags.push(horoscope.charanName);
    if (horoscope.devak) tags.push(`Devak: ${horoscope.devak}`);
    if (horoscope.manglik) tags.push('Manglik');
    this.horoscopeTags.set(tags);
  }

  private loadSubscriptionStatus(): void {
    const userId = this.myUserId;
    if (!userId) return;
    this.subscriptionClient.getUserSubscriptionStatus(userId).subscribe({
      next: (status) => {
        this.subscriptionPlanName.set(status?.planName ?? '');
        this.subscriptionActive.set(Boolean(status?.isActive));
      },
      error: () => { /* noop */ },
    });
  }
}
