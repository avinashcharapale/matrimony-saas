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
  styleUrl: './loader.component.css',
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
