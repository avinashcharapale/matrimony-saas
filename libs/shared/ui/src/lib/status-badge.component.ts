import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'default';

const STATUS_MAP: Record<string, BadgeVariant> = {
  active: 'success',
  inactive: 'danger',
  expired: 'danger',
  trial: 'warning',
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ui-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [class]="'badge badge--' + variant">
      {{ status }}
    </span>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.6;
      white-space: nowrap;
    }

    .badge--success {
      background: #dcfce7;
      color: #166534;
    }

    .badge--danger {
      background: #fee2e2;
      color: #991b1b;
    }

    .badge--warning {
      background: #fef9c3;
      color: #854d0e;
    }

    .badge--default {
      background: #f3f4f6;
      color: #374151;
    }
  `],
})
export class StatusBadgeComponent {
  @Input({ required: true }) status = '';

  get variant(): BadgeVariant {
    return STATUS_MAP[this.status.toLowerCase()] ?? 'default';
  }
}
