import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Story {
  id: string;
  couple: string;
  location: string;
  summary: string;
  expanded?: boolean;
}

@Component({
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
        @for (story of stories; track story.id) {
        <article class="story-card">
          <h2>{{ story.couple }}</h2>
          <small>{{ story.location }}</small>
          <p>{{ story.expanded ? story.summary : (story.summary | slice:0:120) + '...' }}</p>
          <button type="button" (click)="story.expanded = !story.expanded">
            {{ story.expanded ? 'Show less' : 'Read more' }}
          </button>
        </article>
        }
      </section>
    </section>
  `,
  styles: [
    `
      .page-shell { width: min(100%, 980px); margin: 0 auto; display: grid; gap: 1rem; }
      .page-header, .stories { background: #fff; border: 1px solid #eadfd7; border-radius: 1rem; padding: 1rem; }
      .eyebrow { margin: 0; color: #9a5e45; text-transform: uppercase; font-size: 0.74rem; font-weight: 700; }
      h1 { margin: 0.35rem 0 0; color: #24283a; }
      .page-header p { margin: 0.45rem 0 0; color: #6f7486; }
      .stories { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.8rem; }
      .story-card { border: 1px solid #e8d9cf; border-radius: 0.8rem; padding: 0.85rem; background: #fcf8f5; }
      .story-card h2 { margin: 0; color: #2d3348; font-size: 1.05rem; }
      .story-card small { color: #7a8095; }
      .story-card p { color: #5f667c; line-height: 1.55; }
      .story-card button { border: none; background: #9a5e45; color: #fff; border-radius: 0.5rem; padding: 0.45rem 0.7rem; font-weight: 600; }
    `,
  ],
})
export class SuccessStories {
  stories: Story[] = [
    {
      id: 's1',
      couple: 'Neha & Rahul',
      location: 'Pune',
      summary: 'We connected through shared values and family priorities. After a few guided calls and one family meet, everything aligned naturally and we got engaged within four months.',
    },
    {
      id: 's2',
      couple: 'Shweta & Saurabh',
      location: 'Nashik',
      summary: 'Our match score was high but what really helped was profile transparency. We discussed goals clearly, involved both families early, and planned a smooth wedding journey.',
    },
    {
      id: 's3',
      couple: 'Aarti & Pratik',
      location: 'Mumbai',
      summary: 'The platform made it easy to filter by lifestyle and expectations. We met in a community event, stayed in touch, and finalized after both families were confident.',
    },
  ];
}
