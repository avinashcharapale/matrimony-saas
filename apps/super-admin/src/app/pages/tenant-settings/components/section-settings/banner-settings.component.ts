import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsTab } from './shared/section-base';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-banner-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="builder-settings__body">
      @switch (activeTab) {
        @case ('content') {
          <div class="builder-settings__section">
            <div class="builder-settings__section-title">Content</div>
            <div class="builder-field">
              <label>Heading</label>
              <input type="text" [(ngModel)]="data.heading" (ngModelChange)="emit()" placeholder="Trusted by Marathi Families" />
            </div>
            <div class="builder-field">
              <label>Description</label>
              <textarea [(ngModel)]="data.description" (ngModelChange)="emit()" rows="2" placeholder="The most trusted matrimony platform."></textarea>
            </div>
            <div class="builder-field">
              <label>Chips (comma-separated)</label>
              <input type="text" [(ngModel)]="data.chipsStr" (ngModelChange)="onChipsChange()" placeholder="Verified, Private, Trusted" />
              <div class="builder-field__hint">Comma-separated tag list</div>
            </div>
          </div>
          <div class="builder-settings__section">
            <div class="builder-settings__section-title">Call to Action</div>
            <div class="builder-field-row">
              <div class="builder-field">
                <label>Primary CTA Text</label>
                <input type="text" [(ngModel)]="data.ctaLabel" (ngModelChange)="emit()" />
              </div>
              <div class="builder-field">
                <label>Primary CTA Link</label>
                <input type="text" [(ngModel)]="data.ctaLink" (ngModelChange)="emit()" />
              </div>
            </div>
            <div class="builder-field-row">
              <div class="builder-field">
                <label>Secondary CTA Text</label>
                <input type="text" [(ngModel)]="data.ctaLabel2" (ngModelChange)="emit()" />
              </div>
              <div class="builder-field">
                <label>Secondary CTA Link</label>
                <input type="text" [(ngModel)]="data.ctaLink2" (ngModelChange)="emit()" />
              </div>
            </div>
          </div>
        }
        @case ('design') {
          <div class="builder-settings__section">
            <div class="builder-settings__section-title">Appearance</div>
            <div class="builder-field">
              <label>Background Image URL</label>
              <input type="url" [(ngModel)]="data.backgroundImage" (ngModelChange)="emit()" placeholder="https://..." />
            </div>
            <div class="builder-field builder-field--range">
              <label>Overlay Opacity</label>
              <input type="range" min="0" max="100" [(ngModel)]="data.overlayOpacity" (ngModelChange)="emit()" />
              <span class="range-val">{{ data.overlayOpacity || 0 }}%</span>
            </div>
          </div>
        }
        @case ('layout') {
          <div class="builder-settings__section">
            <div class="builder-settings__section-title">Layout</div>
            <div class="builder-field">
              <label>Content Width</label>
              <select [(ngModel)]="data.contentWidth" (ngModelChange)="emit()">
                <option value="narrow">Narrow</option>
                <option value="normal">Normal</option>
                <option value="wide">Wide</option>
              </select>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
      min-height: 0;
    }
    .builder-settings__body {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }
    .builder-settings__section { margin-bottom: 20px; }
    .builder-settings__section-title {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: #9ca3af; margin-bottom: 12px;
      padding-bottom: 6px; border-bottom: 1px solid #f3f4f6;
    }
    .builder-field { margin-bottom: 14px; }
    .builder-field label {
      display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 5px;
    }
    .builder-field input, .builder-field textarea, .builder-field select {
      width: 100%; padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 6px;
      font-size: 13px; color: #1f2937; background: #fafafa; box-sizing: border-box; font-family: inherit;
    }
    .builder-field input:focus, .builder-field textarea:focus, .builder-field select:focus {
      outline: none; border-color: #7c3aed; background: #fff; box-shadow: 0 0 0 2px rgba(124,58,237,0.1);
    }
    .builder-field textarea { resize: vertical; min-height: 60px; }
    .builder-field__hint { font-size: 11px; color: #9ca3af; margin-top: 4px; }
    .builder-field-row { display: flex; gap: 12px; }
    .builder-field-row .builder-field { flex: 1; }
    .builder-field--range { display: flex; align-items: center; gap: 10px; }
    .builder-field--range label { margin-bottom: 0; white-space: nowrap; }
    .builder-field--range input[type="range"] { flex: 1; }
    .range-val { font-size: 12px; font-weight: 600; color: #7c3aed; min-width: 32px; }
  `],
})
export class BannerSettingsComponent implements OnChanges {
  @Input() config: any = {};
  @Input() activeTab: SettingsTab = 'content';
  @Output() configChanged = new EventEmitter<Record<string, any>>();

  data: any = {};

  ngOnChanges(): void {
    this.data = {
      ...this.config,
      chipsStr: Array.isArray(this.config['chips']) ? this.config['chips'].join(', ') : (this.config['chips'] || ''),
    };
  }

  onChipsChange(): void {
    this.data['chips'] = (this.data.chipsStr || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    this.emit();
  }

  emit(): void {
    const { chipsStr, ...rest } = this.data;
    this.configChanged.emit({ ...rest, chips: this.data['chips'] || [] });
  }
}
