import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

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
  imports: [CommonModule],
  template: `
    <section class="page-shell">
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
    </section>
  `,
  styles: [
    `
      .page-shell { width: min(100%, 980px); margin: 0 auto; display: grid; gap: 1rem; }
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
      @media (max-width: 700px) { .event-card { flex-direction: column; align-items: flex-start; } }
    `,
  ],
})
export class Events {
  readonly events = signal<MeetEvent[]>([]);

  toggleJoin(id: string): void {
    this.events.update(items =>
      items.map((event) => (event.id === id ? { ...event, joined: !event.joined } : event))
    );
  }
}
