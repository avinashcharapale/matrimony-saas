import { Component, ChangeDetectionStrategy, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from './skeleton.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ui-profile-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="profile-skeleton-grid" [style.grid-template-columns]="gridColumns()">
      @for (item of skeletonItems(); track $index) {
        <div class="profile-skeleton-card">
          <ui-skeleton variant="profile" count="1"></ui-skeleton>
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-skeleton-grid {
      display: grid;
      gap: 1.5rem;
    }

    .profile-skeleton-card {
      background: var(--theme-surface, var(--surface-card));
      border-radius: var(--theme-radius-lg, 20px);
      overflow: hidden;
      box-shadow: var(--theme-shadow-sm, 0 4px 12px rgba(0,0,0,.05));
      border: 1px solid var(--theme-border, var(--border-soft));
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .profile-skeleton-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--theme-shadow-lg, 0 12px 32px rgba(0,0,0,.1));
    }
  `],
})
export class ProfileSkeletonComponent {
  @Input() count = 6;
  @Input() columns = 3;

  skeletonItems = computed(() => Array.from({ length: this.count() }, (_, i) => i));

  gridColumns = computed(() => {
    const cols = this.columns();
    return `repeat(${cols}, 1fr)`;
  });
}