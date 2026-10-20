import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

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
  imports: [IonicModule, TranslateModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <ion-page>
      <ion-header class="ion-no-border">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
          <ion-title>{{ 'nav.events' | translate }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="shell">
          <header class="page-header">
            <p class="eyebrow">{{ 'events.eyebrow' | translate }}</p>
            <h1>{{ 'nav.events' | translate }}</h1>
            <p class="subtitle">{{ 'events.subtitle' | translate }}</p>
          </header>

          <section class="cards">
            @if (events().length > 0) {
              @for (event of events(); track event.id) {
              <article class="event-card">
                <div class="event-body">
                  <h2>{{ event.title }}</h2>
                  <p>{{ event.place }}</p>
                  <small>{{ event.date }} &bull; {{ event.time }}</small>
                </div>
                <ion-button size="small" [fill]="event.joined ? 'solid' : 'outline'" (click)="toggleJoin(event.id)">
                  {{ event.joined ? ('events.rsvpConfirmed' | translate) : ('events.rsvpNow' | translate) }}
                </ion-button>
              </article>
              }
            } @else {
              <div class="empty-state">
                <p>{{ 'events.noEvents' | translate }}</p>
              </div>
            }
          </section>
        </div>
      </ion-content>
    </ion-page>
  `,
  styles: [
    `
      .shell {
        padding: 1rem;
      }

      .page-header h1 {
        margin: 0;
      }

      .subtitle {
        color: var(--text-muted);
        margin: 0.25rem 0 0;
      }

      .eyebrow {
        margin: 0 0 0.25rem;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--tenant-primary);
      }

      .cards {
        display: grid;
        gap: 0.75rem;
        margin-top: 1rem;
      }

      .event-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.9rem;
        border-radius: 0.75rem;
        background: var(--surface-overlay, #f3f4f6);
      }

      .event-body h2 {
        margin: 0 0 0.2rem;
        font-size: 1rem;
      }

      .event-body p {
        margin: 0;
        color: var(--text-muted);
      }

      .event-body small {
        color: var(--text-muted);
      }

      .empty-state p {
        color: var(--text-muted);
      }
    `,
  ],
})
export class Events {
  readonly events = signal<MeetEvent[]>([]);

  toggleJoin(id: string): void {
    this.events.update((items) =>
      items.map((event) => (event.id === id ? { ...event, joined: !event.joined } : event)),
    );
  }
}
