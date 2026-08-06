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
  styleUrl: './button-spinner.component.css',
})
export class ButtonSpinnerComponent {
  @Input() size: 'small' | 'normal' = 'normal';
}
