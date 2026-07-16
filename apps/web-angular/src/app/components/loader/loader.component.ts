import { Component, ChangeDetectionStrategy, inject, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '@org/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loading.isLoading()) {
      <div class="loader-top-bar">
        <div class="loader-progress"></div>
      </div>
    }
    @if (showOverlay()) {
      <div class="loader-center">
        <div class="loader-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-dot"></div>
        </div>
      </div>
    }
  `,
  styles: [`
    .loader-top-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      z-index: 9999;
      background: transparent;
      overflow: hidden;
    }

    .loader-progress {
      height: 100%;
      background: linear-gradient(90deg, var(--tenant-primary, #9a5e45), var(--tenant-accent, #c49a6c), var(--tenant-primary, #9a5e45));
      background-size: 200% 100%;
      animation: progressSlide 1.5s ease-in-out infinite;
      border-radius: 0 2px 2px 0;
      box-shadow: 0 0 10px color-mix(in srgb, var(--tenant-primary, #9a5e45) 40%, transparent);
    }

    @keyframes progressSlide {
      0% { width: 0%; margin-left: 0%; }
      50% { width: 60%; margin-left: 20%; }
      100% { width: 0%; margin-left: 100%; }
    }

    .loader-center {
      position: fixed;
      inset: 0;
      z-index: 9998;
      display: grid;
      place-items: center;
      background: rgba(255, 255, 255, 0.35);
      backdrop-filter: blur(2px);
      animation: fadeIn 0.25s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .loader-spinner {
      position: relative;
      width: 56px;
      height: 56px;
    }

    .spinner-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 3px solid transparent;
    }

    .spinner-ring:nth-child(1) {
      border-top-color: var(--tenant-primary, #9a5e45);
      animation: spin 1.2s linear infinite;
    }

    .spinner-ring:nth-child(2) {
      inset: 5px;
      border-right-color: var(--tenant-accent, #c49a6c);
      animation: spinReverse 1s linear infinite;
    }

    .spinner-ring:nth-child(3) {
      inset: 10px;
      border-bottom-color: var(--tenant-primary, #9a5e45);
      opacity: 0.6;
      animation: spin 0.8s linear infinite;
    }

    .spinner-dot {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 6px;
      height: 6px;
      margin: -3px 0 0 -3px;
      border-radius: 50%;
      background: var(--tenant-primary, #9a5e45);
      animation: pulse 1s ease-in-out infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes spinReverse {
      to { transform: rotate(-360deg); }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.6); opacity: 0.5; }
    }
  `],
})
export class LoaderComponent {
  readonly loading = inject(LoadingService);
  readonly showOverlay = signal(false);
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const loading = this.loading.isLoading();
      if (loading) {
        if (this.hideTimer) {
          clearTimeout(this.hideTimer);
          this.hideTimer = null;
        }
        this.hideTimer = setTimeout(() => {
          if (this.loading.isLoading()) {
            this.showOverlay.set(true);
          }
        }, 500);
      } else {
        if (this.hideTimer) {
          clearTimeout(this.hideTimer);
          this.hideTimer = null;
        }
        this.showOverlay.set(false);
      }
    });
  }
}
