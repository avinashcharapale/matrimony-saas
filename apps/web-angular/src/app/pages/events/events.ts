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
  styles: [
    `
      :host { display: block; }
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
      .search-shell { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 1.25rem; align-items: start; }
      .page-content { display: grid; gap: 1rem; }
      .page-header, .cards { background: #fff; border: 1px solid #eadfd7; border-radius: 1rem; padding: 1rem; }
      .eyebrow { margin: 0; color: #9a5e45; text-transform: uppercase; font-size: 0.74rem; font-weight: 700; }
      h1 { margin: 0.35rem 0 0; color: #24283a; }
      .page-header p { margin: 0.45rem 0 0; color: #6f7486; }
      .cards { display: grid; gap: 0.7rem; }
      .event-card { border: 1px solid #efe2d9; border-radius: 0.8rem; padding: 0.8rem; background: #fcf8f5; display: flex; justify-content: space-between; gap: 1rem; align-items: center; }
      h2 { margin: 0; color: #2c3042; font-size: 1.05rem; }
      .event-card p { margin: 0.3rem 0 0; color: #6f7486; }
      .event-card small { color: #7b8197; }
      .event-card button { border: none; border-radius: 0.6rem; background: #9a5e45; color: #fff; font-weight: 700; padding: 0.55rem 0.8rem; cursor: pointer; }
      .event-card button.joined { background: #2f8d4e; }
      .empty-state { text-align: center; padding: 2rem; color: #6f7486; }
      @media (max-width: 900px) { .search-shell { grid-template-columns: 1fr; } }
      @media (max-width: 700px) { .event-card { flex-direction: column; align-items: flex-start; } }
    `,
  ],
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
