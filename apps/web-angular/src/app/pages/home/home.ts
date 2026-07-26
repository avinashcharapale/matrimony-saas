import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed } from '@angular/core';
import { TenantService } from '../../services/tenant.service';
import { MemberService } from '../../services/member.service';
import { AuthService } from '../../services/auth.service';
import { MatchClient, RecommendationReason } from '@org/generated';
import { ChatClient } from '@org/generated';
import { SubscriptionStore } from '@org/data-access-subscription';
import { HomeSidebarComponent } from './components/home-sidebar.component';
import { HomeHeaderComponent } from './components/home-header.component';
import { HomeStatsComponent } from './components/home-stats.component';
import { HomeContentComponent } from './components/home-content.component';
import { HomeBottomComponent } from './components/home-bottom.component';
import { ActivityItem, InterestItem, MatchItem, MessageItem, NotificationCard, ShortlistItem } from './home.models';
import { forkJoin } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  standalone: true,
  imports: [
    HomeSidebarComponent,
    HomeHeaderComponent,
    HomeStatsComponent,
    HomeContentComponent,
    HomeBottomComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  readonly tenant = inject(TenantService).tenant;
  private readonly memberService = inject(MemberService);
  private readonly authService = inject(AuthService);
  private readonly matchClient = inject(MatchClient);
  private readonly chatClient = inject(ChatClient);
  private readonly subscriptionStore = inject(SubscriptionStore);

  readonly subscriptionStatus = this.subscriptionStore.status;
  readonly subscriptionLoading = computed(() => this.subscriptionStore.loading());

  get brandMark(): string {
    return this.tenant.logoText
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  readonly userName = signal('');
  readonly userFirstName = signal('');
  readonly currentDate = signal('');
  readonly quickStats = signal<NotificationCard[]>([]);
  readonly topMatches = signal<MatchItem[]>([]);
  readonly interests = signal<InterestItem[]>([]);
  readonly activities = signal<ActivityItem[]>([]);
  readonly messages = signal<MessageItem[]>([]);
  readonly horoscopeTags = signal<string[]>([]);
  readonly recentlyShortlisted = signal<ShortlistItem[]>([]);
  readonly sidebarOpen = signal(false);

  private myProfileId: number | null = null;
  private myUserId: number | null = null;

  ngOnInit(): void {
    this.currentDate.set(this.formatDate(new Date()));
    this.loadMyProfile();
    this.loadSubscriptionStatus();
  }

  private formatDate(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
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
      Pending: 'Pending',
      Accepted: 'Accepted',
      Declined: 'Declined',
      Withdrawn: 'Withdrawn',
      Rejected: 'Rejected',
    };
    return map[val] ?? val;
  }

  private getProfilePhoto(photos?: Array<{ fileUrl?: string }>): string | undefined {
    if (photos && photos.length > 0) {
      const primary = photos.find((p) => p.fileUrl);
      return primary?.fileUrl;
    }
    return undefined;
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  private loadMyProfile(): void {
    this.memberService.getMyProfile().subscribe({
      next: (profile) => {
        const fullName = profile.fullName ?? '';
        const firstName = fullName.split(' ')[0] ?? '';
        this.userName.set(fullName);
        this.userFirstName.set(firstName);
        this.myProfileId = profile.profileId ?? null;

        const session = this.authService.getSession();
        this.myUserId = session?.userId ?? null;

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
      error: () => {},
    });
  }

  private loadTopMatches(profileId: number): void {
    this.matchClient.getRecommendationsByProfile(profileId).subscribe({
      next: (recommendations) => {
        if (recommendations.length === 0) {
          this.loadFallbackMatches();
          return;
        }
        const top = recommendations
          .filter((r) => r.recommendedProfileId)
          .slice(0, 5);

        const profileCalls = top.map((r) =>
          this.memberService.getProfileById(r.recommendedProfileId!)
        );

        forkJoin(profileCalls).subscribe({
          next: (profiles) => {
            const matches: MatchItem[] = profiles.map((p, i) => {
              const rec = top[i];
              const score = rec.score ? Math.round(rec.score) : 0;
              return {
                id: p.profileCode ?? String(p.profileId),
                profileId: p.profileId,
                name: p.fullName ?? 'Unknown',
                detail: [p.age ? `${p.age} y` : '', p.locationText, p.occupationText]
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
          detail: [p.age ? `${p.age} y` : '', p.locationText, p.occupationText]
            .filter(Boolean)
            .join(', '),
          score: 0,
          badge: 'new',
          photoUrl: p.thumbnailUrl,
        }));
        this.topMatches.set(matches);
      },
      error: () => {},
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
        if (requests.length === 0) {
          this.interests.set([]);
          return;
        }
        const top = requests.slice(0, 5);
        const profileCalls = top
          .filter((r) => r.requesterProfileId)
          .map((r) => this.memberService.getProfileById(r.requesterProfileId!));

        if (profileCalls.length === 0) {
          this.interests.set(
            requests.slice(0, 5).map((r) => ({
              id: String(r.interestRequestId ?? ''),
              name: r.requesterName ?? 'Unknown',
              detail: this.getInterestDetail(r.status, r.message),
              profileId: r.requesterProfileId,
              status: this.mapInterestStatus(r.status),
            }))
          );
          return;
        }

        forkJoin(profileCalls).subscribe({
          next: (profiles) => {
            const profileMap = new Map(
              profiles.map((p) => [p.profileId, p])
            );
            const interests: InterestItem[] = top.map((r) => {
              const profile = r.requesterProfileId
                ? profileMap.get(r.requesterProfileId)
                : undefined;
              return {
                id: String(r.interestRequestId ?? ''),
                name: r.requesterName ?? 'Unknown',
                detail: this.getInterestDetail(r.status, r.message),
                profileId: r.requesterProfileId,
                photoUrl: profile
                  ? this.getProfilePhoto(profile.photos)
                  : undefined,
                status: this.mapInterestStatus(r.status),
              };
            });
            this.interests.set(interests);
          },
          error: () => {},
        });
      },
      error: () => {},
    });
  }

  private getInterestDetail(status: unknown, message?: string | null): string {
    return '';
  }

  private loadShortlists(profileId: number): void {
    this.matchClient.getShortlistsByProfile(profileId).subscribe({
      next: (shortlists) => {
        if (shortlists.length === 0) {
          this.recentlyShortlisted.set([]);
          return;
        }
        const top = shortlists.slice(0, 5);
        const profileCalls = top
          .filter((s) => s.targetProfileId)
          .map((s) => this.memberService.getProfileById(s.targetProfileId!));

        if (profileCalls.length === 0) {
          this.recentlyShortlisted.set(
            top.map((s) => ({
              profileId: s.targetProfileId ?? 0,
              name: `Profile #${s.targetProfileId}`,
              detail: s.createdAt
                ? `Saved ${this.formatShortDate(s.createdAt)}`
                : 'Saved',
            }))
          );
          return;
        }

        forkJoin(profileCalls).subscribe({
          next: (profiles) => {
            const profileMap = new Map(
              profiles.map((p) => [p.profileId, p])
            );
            const items: ShortlistItem[] = top.map((s) => {
              const profile = s.targetProfileId
                ? profileMap.get(s.targetProfileId)
                : undefined;
              return {
                profileId: s.targetProfileId ?? 0,
                name: profile?.fullName ?? `Profile #${s.targetProfileId}`,
                detail: s.createdAt
                  ? `Saved ${this.formatShortDate(s.createdAt)}`
                  : 'Saved',
                photoUrl: profile
                  ? this.getProfilePhoto(profile.photos)
                  : undefined,
              };
            });
            this.recentlyShortlisted.set(items);
          },
          error: () => {},
        });
      },
      error: () => {},
    });
  }

  private loadQuickStats(profileId: number): void {
    let interestsCount = 0;
    let shortlistsCount = 0;
    let completed = 0;

    const done = () => {
      completed++;
      if (completed >= 2) {
        this.quickStats.set([
          {
            label: 'Interests Received',
            value: String(interestsCount),
            hint: 'from other profiles',
            icon: '\u{1F48C}',
            tone: 'orange',
          },
          {
            label: 'Saved Profiles',
            value: String(shortlistsCount),
            hint: 'in your shortlist',
            icon: '\u2B50',
            tone: 'gold',
          },
        ]);
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

        const messages: MessageItem[] = active.map((c) => {
          const otherParticipant = (c.participants ?? []).find(
            (p) => p.userId !== this.myUserId
          );
          const unread =
            (this.myUserId === c.userId1
              ? c.unreadMessagesCount1
              : c.unreadMessagesCount2) ?? 0;
          return {
            name: otherParticipant?.displayName ?? c.conversationName ?? 'Chat',
            text: c.lastMessagePreview ?? c.lastMessage?.content ?? '',
            unread: unread > 0 ? unread : undefined,
            photoUrl: otherParticipant?.profilePhotoUrl,
            conversationId: c.conversationId,
          };
        });
        this.messages.set(messages);
      },
      error: () => {},
    });
  }

  private loadHoroscope(profile: any): void {
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

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  private loadSubscriptionStatus(): void {
    const session = this.authService.getSession();
    const userId = session?.userId;
    if (userId) {
      this.subscriptionStore.loadSubscriptionStatus(userId).subscribe();
    }
  }
}
