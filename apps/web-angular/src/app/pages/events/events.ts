import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { MemberService } from '../../services/member.service';
import { AuthService } from '../../services/auth.service';
import { SubscriptionStore } from '@org/data-access-subscription';
import { SharedSidebarComponent } from '../../components/shared-sidebar/shared-sidebar.component';
import { getDefaultAvatar, resolvePhotoUrl } from '../../utils/default-avatar';

interface MeetEvent {
  id: string;
  title: string;
  place: string;
  date: string;
  time: string;
  joined: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, SharedSidebarComponent],
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
            <p class="eyebrow">Community</p>
            <h1>Events & Meets</h1>
            <p>Join local and virtual sessions to connect families and profiles safely.</p>
          </header>

          <section class="cards">
            @if (events().length > 0) {
              @for (event of events(); track event.id) {
              <article class="event-card">
                <div>
                  <h2>{{ event.title }}</h2>
                  <p>{{ event.place }}</p>
                  <small>{{ event.date }} &#8226; {{ event.time }}</small>
                </div>
                <button type="button" [class.joined]="event.joined" (click)="toggleJoin(event.id)">
                  {{ event.joined ? 'RSVP Confirmed' : 'RSVP Now' }}
                </button>
              </article>
              }
            } @else {
              <div class="empty-state">
                <p>No upcoming events at this time.</p>
              </div>
            }
          </section>
        </div>
      </div>
    </section>
  `,
  styleUrl: './events.css',
})
export class Events implements OnInit {
  readonly events = signal<MeetEvent[]>([]);

  private readonly memberService = inject(MemberService);
  private readonly authService = inject(AuthService);
  private readonly subscriptionStore = inject(SubscriptionStore);

  readonly userName = signal('');
  readonly userPhotoUrl = signal('');
  readonly userOccupation = signal('');
  readonly subscriptionStatus = this.subscriptionStore.status;
  readonly subscriptionLoading = computed(() => this.subscriptionStore.loading());

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

  toggleJoin(id: string): void {
    this.events.update(items =>
      items.map((event) => (event.id === id ? { ...event, joined: !event.joined } : event))
    );
  }
}
