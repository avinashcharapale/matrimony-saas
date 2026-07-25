import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { TenantService } from '../../services/tenant.service';
import { MemberService } from '../../services/member.service';
import { AuthService } from '../../services/auth.service';
import { MatchClient, InterestRequestStatus } from '@org/generated';
import { HomeSidebarComponent } from './components/home-sidebar.component';
import { HomeHeaderComponent } from './components/home-header.component';
import { HomeStatsComponent } from './components/home-stats.component';
import { HomeContentComponent } from './components/home-content.component';
import { HomeBottomComponent } from './components/home-bottom.component';
import { ActivityItem, EventItem, InterestItem, MatchItem, MessageItem, NotificationCard, ShortlistItem } from './home.models';
import { finalize, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

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
  readonly upcomingEvents = signal<EventItem[]>([]);
  readonly horoscopeTags = signal<string[]>([]);
  readonly recentlyShortlisted = signal<ShortlistItem[]>([]);

  ngOnInit(): void {
    this.currentDate.set(this.formatDate(new Date()));
    this.loadMyProfile();
    this.loadTopMatches();
    this.loadQuickStats();
  }

  private formatDate(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  private loadMyProfile(): void {
    this.memberService.getMyProfile().subscribe({
      next: (profile) => {
        const fullName = profile.fullName ?? '';
        const firstName = fullName.split(' ')[0] ?? '';
        this.userName.set(fullName);
        this.userFirstName.set(firstName);

        if (profile.profileId) {
          this.loadInterests(profile.profileId);
          this.loadShortlists(profile.profileId);
        }
      },
      error: () => {},
    });
  }

  private loadTopMatches(): void {
    this.memberService.getProfiles(1, 5).subscribe({
      next: (response) => {
        const matches: MatchItem[] = response.profiles.map((p) => ({
          id: p.profileCode ?? String(p.profileId),
          name: p.fullName,
          detail: [p.age ? `${p.age} y` : '', p.locationText, p.occupationText].filter(Boolean).join(', '),
          score: 0,
          badge: 'new' as string,
        }));
        this.topMatches.set(matches);
      },
      error: () => {},
    });
  }

  private loadQuickStats(): void {
    this.memberService.getMyProfile().pipe(
      switchMap((profile) => {
        const profileId = profile.profileId;
        if (!profileId) return of({ interests: 0, shortlists: 0 });

        let interestsCount = 0;
        let shortlistsCount = 0;
        let completed = 0;

        return new Promise<{ interests: number; shortlists: number }>((resolve) => {
          const done = () => {
            completed++;
            if (completed >= 2) resolve({ interests: interestsCount, shortlists: shortlistsCount });
          };

          this.matchClient.getInterestRequestsByTarget(profileId).subscribe({
            next: (r) => { interestsCount = r.length; done(); },
            error: () => done(),
          });

          this.matchClient.getShortlistsByProfile(profileId).subscribe({
            next: (s) => { shortlistsCount = s.length; done(); },
            error: () => done(),
          });
        });
      }),
    ).subscribe({
      next: (counts) => {
        this.quickStats.set([
          { label: 'Interests', value: String(counts.interests), hint: 'received', tone: 'orange' },
          { label: 'Shortlisted', value: String(counts.shortlists), hint: 'saved profiles', tone: 'gold' },
        ]);
      },
      error: () => {},
    });
  }

  private loadInterests(profileId: number): void {
    this.matchClient.getInterestRequestsByTarget(profileId).subscribe({
      next: (requests) => {
        const interests: InterestItem[] = requests.map((r) => ({
          id: String(r.interestRequestId ?? ''),
          name: r.requesterName ?? 'Unknown',
          detail: r.status === InterestRequestStatus.Pending
            ? (r.message ?? 'Sent you an interest')
            : `${r.status}${r.message ? ' — ' + r.message : ''}`,
          profileId: r.requesterProfileId,
        }));
        this.interests.set(interests.slice(0, 5));
      },
      error: () => {},
    });
  }

  private loadShortlists(profileId: number): void {
    this.matchClient.getShortlistsByProfile(profileId).pipe(
      switchMap((shortlists) => {
        if (shortlists.length === 0) return of([]);
        const items: ShortlistItem[] = shortlists.slice(0, 5).map(s => ({
          profileId: s.targetProfileId ?? 0,
          name: '',
          detail: s.createdAt ? `Saved ${this.formatShortDate(s.createdAt)}` : 'Saved',
        }));

        let resolved = 0;
        return new Promise<ShortlistItem[]>((resolve) => {
          items.forEach((item, index) => {
            this.memberService.getProfiles(1, 1).subscribe({
              next: () => {
                items[index] = { ...item, name: `Profile #${item.profileId}` };
                resolved++;
                if (resolved >= items.length) resolve(items);
              },
              error: () => {
                items[index] = { ...item, name: `Profile #${item.profileId}` };
                resolved++;
                if (resolved >= items.length) resolve(items);
              },
            });
          });
        });
      }),
    ).subscribe({
      next: (items) => this.recentlyShortlisted.set(items),
      error: () => {},
    });
  }

  private formatShortDate(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  }
}
