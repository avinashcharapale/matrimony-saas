import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface MeetEvent {
  id: string;
  title: string;
  place: string;
  date: string;
  time: string;
  joined: boolean;
}

@Component({
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
        @for (event of events; track event.id) {
        <article class="event-card">
          <div>
            <h2>{{ event.title }}</h2>
            <p>{{ event.place }}</p>
            <small>{{ event.date }} • {{ event.time }}</small>
          </div>
          <button type="button" [class.joined]="event.joined" (click)="toggleJoin(event.id)">
            {{ event.joined ? 'RSVP Confirmed' : 'RSVP Now' }}
          </button>
        </article>
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
      @media (max-width: 700px) { .event-card { flex-direction: column; align-items: flex-start; } }
    `,
  ],
})
export class Events {
  events: MeetEvent[] = [
    { id: 'e1', title: 'Maratha Meet - Pune', place: 'Kothrud Hall, Pune', date: '19 Apr', time: '11:00 AM', joined: false },
    { id: 'e2', title: 'Virtual Family Connect', place: 'Online Zoom Session', date: '26 Apr', time: '7:00 PM', joined: true },
    { id: 'e3', title: 'Navi Mumbai Session', place: 'Vashi Community Center', date: '05 May', time: '4:30 PM', joined: false },
  ];

  toggleJoin(id: string): void {
    this.events = this.events.map((event) => (event.id === id ? { ...event, joined: !event.joined } : event));
  }
}
