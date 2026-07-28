import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ui-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="empty-state">
      @if (icon) {
        <mat-icon class="empty-state-icon">{{ icon }}</mat-icon>
      }
      <p class="empty-state-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 64px 24px;
      text-align: center;
    }

    .empty-state-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: #bdbdbd;
    }

    .empty-state-message {
      margin: 0;
      font-size: 15px;
      color: #757575;
      max-width: 320px;
    }
  `],
})
export class EmptyStateComponent {
  @Input({ required: true }) message = '';
  @Input() icon = '';
}
