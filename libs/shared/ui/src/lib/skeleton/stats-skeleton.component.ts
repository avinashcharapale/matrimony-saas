import { Component, ChangeDetectionStrategy, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from './skeleton.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ui-stats-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="stats-skeleton-grid" [style.grid-template-columns]="gridColumns()">
      @for (item of skeletonItems(); track $index) {
        <div class="stat-skeleton-card">
          <ui-skeleton variant="stat" count="1"></ui-skeleton>
        </div>
      }
    </div>
  `,
  styles: [`
    .stats-skeleton-grid {
      display: grid;
      gap: 1rem;
    }

    .stat-skeleton-card {
      background: var(--theme-surface, var(--surface-card));
      border-radius: var(--theme-radius-lg, 16px);
      padding: 1.5rem;
      border: 1px solid var(--theme-border, var(--border-soft));
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-skeleton-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--theme-shadow-md, 0 8px 24px rgba(0,0,0,.08));
    }
  `],
})
export class StatsSkeletonComponent {
  @Input() count = 4;
  @Input() columns = 4;

  skeletonItems = computed(() => Array.from({ length: this.count() }, (_, i) => i));

  gridColumns = computed(() => {
    const cols = this.columns();
    if (cols <= 2) return `repeat(${cols}, 1fr)`;
    return `repeat(auto-fit, minmax(140px, 1fr))`;
  });
}