import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-button-spinner',
  standalone: true,
  template: `
    <span class="btn-spinner" [class.small]="size === 'small'">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </span>
  `,
  styles: [`
    :host {
      display: inline-flex;
      vertical-align: middle;
      margin-left: 0.4rem;
    }

    .btn-spinner {
      display: inline-flex;
      gap: 3px;
      align-items: center;
    }

    .btn-spinner .dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: currentColor;
      animation: dotBounce 1s ease-in-out infinite;
    }

    .btn-spinner .dot:nth-child(2) {
      animation-delay: 0.15s;
    }

    .btn-spinner .dot:nth-child(3) {
      animation-delay: 0.3s;
    }

    .btn-spinner.small .dot {
      width: 3px;
      height: 3px;
    }

    @keyframes dotBounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }
  `],
})
export class ButtonSpinnerComponent {
  @Input() size: 'small' | 'normal' = 'normal';
}
