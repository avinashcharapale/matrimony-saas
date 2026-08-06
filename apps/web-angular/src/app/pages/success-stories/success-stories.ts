import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

interface Story {
  id: string;
  couple: string;
  location: string;
  summary: string;
  expanded?: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-success-stories',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <p class="eyebrow">Real Matches</p>
        <h1>Success Stories</h1>
        <p>Journeys from first connect to family-approved wedding.</p>
      </header>

      <section class="stories">
        @if (stories().length > 0) {
          @for (story of stories(); track story.id) {
          <article class="story-card">
            <h2>{{ story.couple }}</h2>
            <small>{{ story.location }}</small>
            <p>{{ story.expanded ? story.summary : (story.summary | slice:0:120) + '...' }}</p>
            <button type="button" (click)="toggleExpand(story.id)">
              {{ story.expanded ? 'Show less' : 'Read more' }}
            </button>
          </article>
          }
        } @else {
          <div class="empty-state">
            <p>No success stories available yet.</p>
          </div>
        }
      </section>
    </section>
  `,
  styleUrl: './success-stories.css',
})
export class SuccessStories {
  readonly stories = signal<Story[]>([]);

  toggleExpand(id: string): void {
    this.stories.update(items =>
      items.map((s) => (s.id === id ? { ...s, expanded: !s.expanded } : s))
    );
  }
}
