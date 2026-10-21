import { Component, ChangeDetectionStrategy, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ui-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-container" [style.--skeleton-count]="count()">
      @for (item of skeletonItems(); track $index) {
        <div class="skeleton-item" [class]="'skeleton-' + variant()">
          <div class="skeleton-shimmer"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .skeleton-container {
      display: flex;
      flex-direction: column;
      gap: var(--skeleton-gap, 1rem);
    }

    .skeleton-item {
      position: relative;
      overflow: hidden;
      background: var(--skeleton-bg, color-mix(in srgb, var(--theme-border) 40%, transparent));
      border-radius: var(--skeleton-radius, var(--theme-radius-md, 12px));
    }

    .skeleton-shimmer {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        var(--skeleton-highlight, color-mix(in srgb, var(--theme-surface-raised) 60%, transparent)) 50%,
        transparent 100%
      );
      animation: shimmer 1.5s infinite ease-in-out;
      transform: translateX(-100%);
    }

    @keyframes shimmer {
      100% { transform: translateX(100%); }
    }

    /* Variants */
    .skeleton-text {
      height: 1rem;
      width: 100%;
      border-radius: 4px;
    }

    .skeleton-text:last-child {
      width: 70%;
    }

    .skeleton-card {
      height: 200px;
      display: flex;
      flex-direction: column;
    }

    .skeleton-card .skeleton-shimmer {
      animation-delay: calc(var(--i, 0) * 0.1s);
    }

    .skeleton-profile {
      height: 280px;
      display: grid;
      grid-template-rows: 180px 1fr;
      gap: 1rem;
    }

    .skeleton-profile .skeleton-image {
      border-radius: var(--theme-radius-lg, 20px) var(--theme-radius-lg, 20px) 0 0;
    }

    .skeleton-profile .skeleton-content {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .skeleton-list {
      height: auto;
      min-height: 100px;
    }

    .skeleton-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
    }

    .skeleton-button {
      height: 44px;
      width: 100%;
      max-width: 200px;
      border-radius: var(--theme-radius-sm, 8px);
    }

    .skeleton-stat {
      height: 100px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1.5rem;
      border-radius: var(--theme-radius-lg, 16px);
    }

    .skeleton-stat .skeleton-value {
      width: 60px;
      height: 32px;
      border-radius: 8px;
    }

    .skeleton-stat .skeleton-label {
      width: 80px;
      height: 14px;
      border-radius: 4px;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .skeleton-profile {
        height: 240px;
        grid-template-rows: 140px 1fr;
      }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .skeleton-shimmer {
        animation: none;
        background: var(--skeleton-highlight, color-mix(in srgb, var(--theme-surface-raised) 60%, transparent));
      }
    }
  `],
})
export class SkeletonComponent {
  @Input() variant: 'text' | 'card' | 'profile' | 'list' | 'avatar' | 'button' | 'stat' = 'text';
  @Input() count = 1;
  @Input() gap = '1rem';

  skeletonItems = computed(() => Array.from({ length: this.count() }, (_, i) => i));
}