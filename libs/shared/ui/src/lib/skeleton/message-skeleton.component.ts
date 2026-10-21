import { Component, ChangeDetectionStrategy, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from './skeleton.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ui-message-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="message-skeleton-list">
      @for (item of skeletonItems(); track $index) {
        <div class="message-skeleton-item">
          <div class="message-skeleton-avatar">
            <ui-skeleton variant="avatar" count="1"></ui-skeleton>
          </div>
          <div class="message-skeleton-content">
            <ui-skeleton variant="text" count="2"></ui-skeleton>
            <ui-skeleton variant="text" count="1" style="width: 60%"></ui-skeleton>
          </div>
          <div class="message-skeleton-meta">
            <ui-skeleton variant="text" count="1" style="width: 50px; height: 12px"></ui-skeleton>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .message-skeleton-list {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .message-skeleton-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--theme-border, var(--border-soft));
      transition: background 0.2s ease;
    }

    .message-skeleton-item:last-child {
      border-bottom: none;
    }

    .message-skeleton-item:hover {
      background: var(--theme-surface-soft, var(--surface-soft));
    }

    .message-skeleton-avatar {
      flex-shrink: 0;
    }

    .message-skeleton-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .message-skeleton-meta {
      flex-shrink: 0;
      text-align: right;
    }
  `],
})
export class MessageSkeletonComponent {
  @Input() count = 5;

  skeletonItems = computed(() => Array.from({ length: this.count() }, (_, i) => i));
}