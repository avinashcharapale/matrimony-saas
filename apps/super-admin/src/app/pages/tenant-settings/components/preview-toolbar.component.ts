import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-preview-toolbar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, MatButtonModule],
  template: `
    <div class="builder-preview__toolbar">
      <span style="font-size:12px;font-weight:600;color:#374151">Preview</span>

      <div style="flex:1"></div>

      <div style="display:flex;gap:4px">
        @for (d of devices; track d.key) {
          <button class="builder-preview__device-btn"
                  [class.active]="device() === d.key"
                  (click)="device.set(d.key)"
                  [title]="d.label">
            <mat-icon>{{ d.icon }}</mat-icon>
            <span>{{ d.label }}</span>
          </button>
        }
      </div>

      <div style="flex:1"></div>

      @if (saving()) {
        <span class="builder-toolbar__status builder-toolbar__status--saving">
          <mat-spinner diameter="14"></mat-spinner>
          Saving...
        </span>
      } @else if (dirty()) {
        <span class="builder-toolbar__status builder-toolbar__status--dirty">
          <mat-icon style="font-size:14px;width:14px;height:14px">circle</mat-icon>
          Unsaved changes
        </span>
      } @else {
        <span class="builder-toolbar__status builder-toolbar__status--saved">
          <mat-icon style="font-size:14px;width:14px;height:14px">check_circle</mat-icon>
          Saved {{ lastSavedText() }}
        </span>
      }

      <button class="builder-btn builder-btn--secondary builder-btn--sm" (click)="saveDraft.emit()">
        <mat-icon style="font-size:14px;width:14px;height:14px">save</mat-icon>
        Save Draft
      </button>
      @if (dirty()) {
        <button class="builder-btn builder-btn--ghost builder-btn--sm" style="color:#dc2626" (click)="discard.emit()" title="Discard unsaved changes">
          <mat-icon style="font-size:14px;width:14px;height:14px">restart_alt</mat-icon>
          Discard
        </button>
      }
      <button class="builder-btn builder-btn--primary builder-btn--sm" (click)="publish.emit()">
        <mat-icon style="font-size:14px;width:14px;height:14px">publish</mat-icon>
        Publish
      </button>
      <button class="builder-btn builder-btn--ghost builder-btn--sm" (click)="versionHistory.emit()" title="Version History">
        <mat-icon style="font-size:16px;width:16px;height:16px">history</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }

    .builder-preview__toolbar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      background: #fff;
      border-bottom: 1px solid #e5e7eb;
      flex-shrink: 0;
    }

    .builder-preview__device-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 5px 10px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      background: #fff;
      color: #6b7280;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }

    .builder-preview__device-btn:hover {
      background: #f9fafb;
      border-color: #d1d5db;
      color: #374151;
    }

    .builder-preview__device-btn.active {
      background: #7c3aed;
      border-color: #7c3aed;
      color: #fff;
    }

    .builder-preview__device-btn mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .builder-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      border: 1px solid transparent;
    }

    .builder-btn--primary {
      background: #7c3aed;
      color: #fff;
      border-color: #7c3aed;
    }
    .builder-btn--primary:hover { background: #6d28d9; }

    .builder-btn--secondary {
      background: #fff;
      color: #374151;
      border-color: #d1d5db;
    }
    .builder-btn--secondary:hover { background: #f9fafb; border-color: #9ca3af; }

    .builder-btn--ghost {
      background: transparent;
      color: #6b7280;
    }
    .builder-btn--ghost:hover { background: #f3f4f6; color: #374151; }

    .builder-btn--sm { padding: 4px 10px; font-size: 11px; }
    .builder-btn mat-icon { font-size: 14px; width: 14px; height: 14px; }

    .builder-toolbar__status {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 500;
    }
    .builder-toolbar__status--saving { color: #f59e0b; }
    .builder-toolbar__status--saved { color: #10b981; }
    .builder-toolbar__status--dirty { color: #ef4444; }
  `],
})
export class PreviewToolbarComponent {
  @Input() device = signal<DeviceType>('desktop');
  @Input() saving = signal(false);
  @Input() dirty = signal(false);
  @Input() lastSavedAt = signal<Date | null>(null);
  @Output() saveDraft = new EventEmitter<void>();
  @Output() publish = new EventEmitter<void>();
  @Output() discard = new EventEmitter<void>();
  @Output() versionHistory = new EventEmitter<void>();

  readonly devices: { key: DeviceType; label: string; icon: string }[] = [
    { key: 'desktop', label: 'Desktop', icon: 'desktop_windows' },
    { key: 'tablet', label: 'Tablet', icon: 'tablet' },
    { key: 'mobile', label: 'Mobile', icon: 'phone_iphone' },
  ];

  lastSavedText(): string {
    const d = this.lastSavedAt();
    if (!d) return '';
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  }
}
