import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsTab } from './shared/section-base';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-hero-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="builder-settings__body">
      @switch (activeTab) {
        @case ('content') {
          <div class="builder-settings__section">
            <div class="builder-settings__section-title">Eyebrow</div>
            <div class="builder-field">
              <label>Eyebrow Text</label>
              <input type="text" [(ngModel)]="data.eyebrow" (ngModelChange)="emit()" placeholder="Find Your Perfect Match" />
            </div>
          </div>

          <div class="builder-settings__section">
            <div class="builder-settings__section-title">Headline</div>
            <div class="builder-field">
              <label>Heading (HTML allowed)</label>
              <textarea [(ngModel)]="data.heading" (ngModelChange)="emit()" rows="3" placeholder="Begin Your Journey to a Happier Tomorrow"></textarea>
              <div class="builder-field__hint">Use &lt;br&gt; for line breaks</div>
            </div>
            <div class="builder-field">
              <label>Subtitle</label>
              <textarea [(ngModel)]="data.subtitle" (ngModelChange)="emit()" rows="2" placeholder="Join thousands of families..."></textarea>
            </div>
          </div>

          <div class="builder-settings__section">
            <div class="builder-settings__section-title">Call to Action</div>
            <div class="builder-field-row">
              <div class="builder-field">
                <label>Primary CTA Text</label>
                <input type="text" [(ngModel)]="data.ctaLabel" (ngModelChange)="emit()" placeholder="Register Free" />
              </div>
              <div class="builder-field">
                <label>Primary CTA Link</label>
                <input type="text" [(ngModel)]="data.ctaLink" (ngModelChange)="emit()" placeholder="/register" />
              </div>
            </div>
            <div class="builder-field-row">
              <div class="builder-field">
                <label>Secondary CTA Text</label>
                <input type="text" [(ngModel)]="data.ctaLabel2" (ngModelChange)="emit()" placeholder="Search Matches" />
              </div>
              <div class="builder-field">
                <label>Secondary CTA Link</label>
                <input type="text" [(ngModel)]="data.ctaLink2" (ngModelChange)="emit()" placeholder="/search" />
              </div>
            </div>
          </div>
        }

        @case ('design') {
          <div class="builder-settings__section">
            <div class="builder-settings__section-title">Appearance</div>
            <div class="builder-field">
              <label>Text Alignment</label>
              <select [(ngModel)]="data.textAlign" (ngModelChange)="emit()">
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div class="builder-field">
              <label>Content Width</label>
              <select [(ngModel)]="data.contentWidth" (ngModelChange)="emit()">
                <option value="narrow">Narrow</option>
                <option value="normal">Normal</option>
                <option value="wide">Wide</option>
              </select>
            </div>
          </div>

          <div class="builder-settings__section">
            <div class="builder-settings__section-title">Overlay</div>
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
              <label>Height</label>
              <select [(ngModel)]="data.height" (ngModelChange)="emit()">
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          <div class="builder-settings__section">
            <div class="builder-settings__section-title">Responsive Visibility</div>
            <div class="builder-field builder-field--inline">
              <label>Desktop</label>
              <button class="builder-field--toggle" [class.on]="data['visibleDesktop'] !== false" (click)="data['visibleDesktop'] = data['visibleDesktop'] === false ? true : false; emit()"></button>
            </div>
            <div class="builder-field builder-field--inline">
              <label>Tablet</label>
              <button class="builder-field--toggle" [class.on]="data['visibleTablet'] !== false" (click)="data['visibleTablet'] = data['visibleTablet'] === false ? true : false; emit()"></button>
            </div>
            <div class="builder-field builder-field--inline">
              <label>Mobile</label>
              <button class="builder-field--toggle" [class.on]="data['visibleMobile'] !== false" (click)="data['visibleMobile'] = data['visibleMobile'] === false ? true : false; emit()"></button>
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
    .builder-field--inline {
      display: flex; align-items: center; justify-content: space-between;
    }
    .builder-field--inline label { margin-bottom: 0; }
    .builder-field--toggle {
      width: 40px; height: 22px; border-radius: 11px; border: none;
      background: #d1d5db; cursor: pointer; position: relative; transition: background 0.2s; flex-shrink: 0;
    }
    .builder-field--toggle::after {
      content: ''; position: absolute; top: 3px; left: 3px;
      width: 16px; height: 16px; border-radius: 50%; background: #fff;
      transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    }
    .builder-field--toggle.on { background: #7c3aed; }
    .builder-field--toggle.on::after { transform: translateX(18px); }
    .builder-field--range { display: flex; align-items: center; gap: 10px; }
    .builder-field--range label { margin-bottom: 0; white-space: nowrap; }
    .builder-field--range input[type="range"] { flex: 1; }
    .range-val { font-size: 12px; font-weight: 600; color: #7c3aed; min-width: 32px; }
  `],
})
export class HeroSettingsComponent implements OnChanges {
  @Input() config: any = {};
  @Input() activeTab: SettingsTab = 'content';
  @Output() configChanged = new EventEmitter<Record<string, any>>();

  data: any = {};

  ngOnChanges(): void {
    this.data = { ...this.config };
  }

  emit(): void {
    this.configChanged.emit({ ...this.data });
  }
}
