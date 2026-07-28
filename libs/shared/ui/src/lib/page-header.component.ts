import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ui-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div class="page-header-text">
        <h1 class="page-header-title">{{ title }}</h1>
        @if (subtitle) {
          <p class="page-header-subtitle">{{ subtitle }}</p>
        }
      </div>
      <div class="page-header-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin-bottom: 24px;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .page-header-text {
      min-width: 0;
    }

    .page-header-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #1a1a1a;
      line-height: 1.3;
    }

    .page-header-subtitle {
      margin: 4px 0 0;
      font-size: 14px;
      color: #757575;
    }

    .page-header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
  `],
})
export class PageHeaderComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle = '';
}
