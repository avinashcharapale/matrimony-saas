import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '@org/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ui-loader',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatProgressSpinnerModule],
  template: `
    @if (loading.isLoading()) {
      <mat-progress-bar class="ui-loader-bar" mode="indeterminate"></mat-progress-bar>
      @if (showOverlay()) {
        <div class="ui-loader-overlay">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      }
    }
  `,
  styles: [`
    .ui-loader-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      z-index: 1100;
    }
    .ui-loader-overlay {
      position: fixed;
      inset: 0;
      z-index: 1099;
      display: grid;
      place-items: center;
      background: rgba(255, 255, 255, 0.4);
      backdrop-filter: blur(1px);
    }
  `],
})
export class LoaderComponent {
  readonly loading = inject(LoadingService);
  readonly showOverlay = signal(false);
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
        this.hideTimer = null;
      }
      if (this.loading.isLoading()) {
        this.hideTimer = setTimeout(() => {
          if (this.loading.isLoading()) {
            this.showOverlay.set(true);
          }
        }, 400);
      } else {
        this.showOverlay.set(false);
      }
    });
  }
}
