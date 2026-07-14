import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';

interface InterestCard {
  id: string;
  name: string;
  detail: string;
  status: 'pending' | 'accepted' | 'declined';
  type: 'received' | 'sent';
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-interests',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <p class="eyebrow">My Activity</p>
        <h1>Interests</h1>
        <p>Review who connected with you and track requests you sent.</p>
      </header>

      <div class="tabs">
        <button type="button" [class.active]="activeTab() === 'received'" (click)="activeTab.set('received')">Received</button>
        <button type="button" [class.active]="activeTab() === 'sent'" (click)="activeTab.set('sent')">Sent</button>
      </div>

      <section class="cards">
        @for (item of visibleInterests(); track item.id) {
        <article class="card">
          <div>
            <h2>{{ item.name }}</h2>
            <p>{{ item.detail }}</p>
          </div>
          <div class="card-actions">
            <span class="status" [class.accepted]="item.status === 'accepted'" [class.declined]="item.status === 'declined'">
              {{ item.status }}
            </span>
            @if (activeTab() === 'received' && item.status === 'pending') {
            <button type="button" class="accept" (click)="updateStatus(item.id, 'accepted')">Accept</button>
            <button type="button" class="decline" (click)="updateStatus(item.id, 'declined')">Decline</button>
            }
          </div>
        </article>
        }
      </section>
    </section>
  `,
  styles: [
    `
      .page-shell { width: min(100%, 980px); margin: 0 auto; display: grid; gap: 1rem; }
      .page-header, .tabs, .cards { background: #fff; border: 1px solid #eadfd7; border-radius: 1rem; padding: 1rem; }
      .eyebrow { margin: 0; color: #9a5e45; text-transform: uppercase; font-size: 0.74rem; font-weight: 700; }
      h1 { margin: 0.35rem 0 0; color: #24283a; }
      .page-header p { margin: 0.45rem 0 0; color: #6f7486; }
      .tabs { display: flex; gap: 0.6rem; }
      .tabs button { border: 1px solid #ddcabe; background: #fff; border-radius: 0.6rem; padding: 0.55rem 0.9rem; font-weight: 600; color: #4f566b; cursor: pointer; }
      .tabs button.active { background: #9a5e45; color: #fff; border-color: #9a5e45; }
      .cards { display: grid; gap: 0.7rem; }
      .card { display: flex; justify-content: space-between; gap: 1rem; border: 1px solid #efe2d9; border-radius: 0.8rem; padding: 0.8rem; background: #fcf8f5; }
      .card h2 { margin: 0; font-size: 1rem; color: #2c3042; }
      .card p { margin: 0.35rem 0 0; color: #6c7285; }
      .card-actions { display: flex; align-items: center; gap: 0.45rem; }
      .status { text-transform: capitalize; font-size: 0.8rem; color: #8a5d49; background: #f4e7df; padding: 0.25rem 0.55rem; border-radius: 999px; }
      .status.accepted { background: #e2f4e8; color: #1f7c3d; }
      .status.declined { background: #f8e3e3; color: #9e2c2c; }
      .accept, .decline { border: none; border-radius: 0.5rem; padding: 0.45rem 0.7rem; cursor: pointer; font-weight: 600; }
      .accept { background: #2f8d4e; color: #fff; }
      .decline { background: #be4343; color: #fff; }
      @media (max-width: 700px) { .card { flex-direction: column; } }
    `,
  ],
})
export class Interests {
  readonly activeTab = signal<'received' | 'sent'>('received');

  private readonly interests = signal<InterestCard[]>([
    { id: 'i1', name: 'Priya Shinde', detail: 'Viewed your profile and sent interest.', status: 'pending', type: 'received' },
    { id: 'i2', name: 'Snehal Deshmukh', detail: 'Family approved and waiting for your response.', status: 'pending', type: 'received' },
    { id: 'i3', name: 'Kavya Jadhav', detail: 'You sent interest 2 days ago.', status: 'accepted', type: 'sent' },
    { id: 'i4', name: 'Anita Patil', detail: 'You sent interest yesterday.', status: 'pending', type: 'sent' },
  ]);

  readonly visibleInterests = computed(() =>
    this.interests().filter((item) => item.type === this.activeTab())
  );

  updateStatus(id: string, status: InterestCard['status']): void {
    this.interests.update(items =>
      items.map((item) => (item.id === id ? { ...item, status } : item))
    );
  }
}
