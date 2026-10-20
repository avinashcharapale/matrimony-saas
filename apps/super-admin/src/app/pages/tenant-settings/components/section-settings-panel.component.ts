import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { SettingsTab, SECTION_DEFS, SectionConfig } from './section-settings/shared/section-base';
import { HeroSettingsComponent } from './section-settings/hero-settings.component';
import { BannerSettingsComponent } from './section-settings/banner-settings.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-section-settings-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, HeroSettingsComponent, BannerSettingsComponent],
  template: `
    @if (!selectedKey) {
      <div class="builder-settings__empty">
        <mat-icon>touch_app</mat-icon>
        <p>Select a section from the tree<br>or click on the preview to configure it</p>
      </div>
    } @else {
      <div class="builder-settings__head">
        <h4>{{ sectionLabel }} Settings</h4>
        <p>{{ sectionDescription }}</p>
      </div>

      <div class="builder-settings__tabs">
        @for (tab of tabs; track tab.key) {
          <button class="builder-settings__tab"
                  [class.active]="activeTab === tab.key"
                  (click)="activeTab = tab.key">
            {{ tab.label }}
          </button>
        }
      </div>

      @switch (selectedKey) {
        @case ('hero') {
          <app-hero-settings [config]="sectionConfig" [activeTab]="activeTab" (configChanged)="onConfigChanged($event)" />
        }
        @case ('banner') {
          <app-banner-settings [config]="sectionConfig" [activeTab]="activeTab" (configChanged)="onConfigChanged($event)" />
        }
        @default {
          <div class="builder-settings__body">
            <div class="builder-settings__section">
              <div class="builder-settings__section-title">Content</div>
              @for (field of genericFields; track field.key) {
                <div class="builder-field">
                  <label>{{ field.label }}</label>
                  @if (field.type === 'textarea') {
                    <textarea [rows]="3" [(ngModel)]="genericData[field.key]" (ngModelChange)="onGenericChanged()"></textarea>
                  } @else if (field.type === 'select') {
                    <select [(ngModel)]="genericData[field.key]" (ngModelChange)="onGenericChanged()">
                      @for (opt of field.options; track opt) {
                        <option [value]="opt">{{ opt }}</option>
                      }
                    </select>
                  } @else {
                    <input [type]="field.type || 'text'" [(ngModel)]="genericData[field.key]" (ngModelChange)="onGenericChanged()" />
                  }
                  @if (field.hint) {
                    <div class="builder-field__hint">{{ field.hint }}</div>
                  }
                </div>
              }
            </div>

            @if (selectedKey !== 'header' && selectedKey !== 'footer') {
              <div class="builder-settings__section">
                <div class="builder-settings__section-title">Layout</div>
                <div class="builder-field builder-field--inline">
                  <label>Visible on Desktop</label>
                  <button class="builder-field--toggle" [class.on]="genericData['visibleDesktop'] !== false" (click)="toggleGeneric('visibleDesktop')"></button>
                </div>
                <div class="builder-field builder-field--inline">
                  <label>Visible on Tablet</label>
                  <button class="builder-field--toggle" [class.on]="genericData['visibleTablet'] !== false" (click)="toggleGeneric('visibleTablet')"></button>
                </div>
                <div class="builder-field builder-field--inline">
                  <label>Visible on Mobile</label>
                  <button class="builder-field--toggle" [class.on]="genericData['visibleMobile'] !== false" (click)="toggleGeneric('visibleMobile')"></button>
                </div>
              </div>
            }
          </div>
        }
      }
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      width: 380px;
      min-width: 380px;
      height: 100%;
      background: #fff;
      border-left: 1px solid #e4e4e7;
      overflow: hidden;
    }

    .builder-settings__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      color: #9ca3af;
      gap: 12px;
      padding: 32px;
    }
    .builder-settings__empty mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #d1d5db;
    }
    .builder-settings__empty p {
      font-size: 13px;
      line-height: 1.6;
      margin: 0;
    }

    .builder-settings__head {
      padding: 14px 16px 10px;
      border-bottom: 1px solid #f0f0f0;
      flex-shrink: 0;
    }
    .builder-settings__head h4 {
      font-size: 14px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 4px;
    }
    .builder-settings__head p {
      font-size: 12px;
      color: #9ca3af;
      margin: 0;
      line-height: 1.4;
    }

    .builder-settings__tabs {
      display: flex;
      gap: 0;
      border-bottom: 1px solid #e5e7eb;
      flex-shrink: 0;
      padding: 0 16px;
    }

    .builder-settings__tab {
      flex: 1;
      padding: 10px 12px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      font-size: 12px;
      font-weight: 600;
      color: #9ca3af;
      cursor: pointer;
      transition: all 0.15s;
    }
    .builder-settings__tab:hover { color: #6b7280; }
    .builder-settings__tab.active {
      color: #7c3aed;
      border-bottom-color: #7c3aed;
    }

    .builder-settings__body {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      scrollbar-width: thin;
      scrollbar-color: #d1d5db transparent;
    }

    .builder-settings__section { margin-bottom: 20px; }

    .builder-settings__section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #9ca3af;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #f3f4f6;
    }

    .builder-field {
      margin-bottom: 14px;
    }
    .builder-field label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 5px;
    }
    .builder-field input,
    .builder-field textarea,
    .builder-field select {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      font-size: 13px;
      color: #1f2937;
      background: #fafafa;
      transition: border-color 0.15s;
      box-sizing: border-box;
      font-family: inherit;
    }
    .builder-field input:focus,
    .builder-field textarea:focus,
    .builder-field select:focus {
      outline: none;
      border-color: #7c3aed;
      background: #fff;
      box-shadow: 0 0 0 2px rgba(124,58,237,0.1);
    }
    .builder-field textarea { resize: vertical; min-height: 60px; }

    .builder-field__hint {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 4px;
    }

    .builder-field--inline {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .builder-field--inline label { margin-bottom: 0; }

    .builder-field--toggle {
      width: 40px;
      height: 22px;
      border-radius: 11px;
      border: none;
      background: #d1d5db;
      cursor: pointer;
      position: relative;
      transition: background 0.2s;
      flex-shrink: 0;
    }
    .builder-field--toggle::after {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #fff;
      transition: transform 0.2s;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    }
    .builder-field--toggle.on {
      background: #7c3aed;
    }
    .builder-field--toggle.on::after {
      transform: translateX(18px);
    }
  `],
})
export class SectionSettingsPanelComponent implements OnChanges {
  @Input() selectedKey: string | null = null;
  @Input() sectionConfig: Record<string, any> = {};
  @Output() configChanged = new EventEmitter<Record<string, any>>();

  activeTab: SettingsTab = 'content';

  readonly tabs: { key: SettingsTab; label: string }[] = [
    { key: 'content', label: 'Content' },
    { key: 'design', label: 'Design' },
    { key: 'layout', label: 'Layout' },
  ];

  genericData: Record<string, any> = {};

  readonly genericFieldDefs: Record<string, { key: string; label: string; type?: string; hint?: string; options?: string[] }[]> = {
    banner: [
      { key: 'heading', label: 'Heading' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
    stats: [
      { key: 'eyebrow', label: 'Eyebrow Text' },
      { key: 'title', label: 'Section Title' },
    ],
    features: [
      { key: 'eyebrow', label: 'Eyebrow Text' },
      { key: 'title', label: 'Section Title' },
    ],
    how: [
      { key: 'eyebrow', label: 'Eyebrow Text' },
      { key: 'title', label: 'Section Title' },
    ],
    profiles: [
      { key: 'eyebrow', label: 'Eyebrow Text' },
      { key: 'title', label: 'Section Title' },
      { key: 'viewAllLabel', label: 'View All Label' },
    ],
    success: [
      { key: 'eyebrow', label: 'Eyebrow Text' },
      { key: 'title', label: 'Section Title' },
    ],
    testimonials: [
      { key: 'eyebrow', label: 'Eyebrow Text' },
      { key: 'title', label: 'Section Title' },
    ],
    counters: [
      { key: 'eyebrow', label: 'Eyebrow Text' },
      { key: 'title', label: 'Section Title' },
    ],
    why: [
      { key: 'eyebrow', label: 'Eyebrow Text' },
      { key: 'title', label: 'Section Title' },
    ],
    castes: [
      { key: 'eyebrow', label: 'Eyebrow Text' },
      { key: 'title', label: 'Section Title' },
      { key: 'communities', label: 'Communities (comma-separated)', hint: 'Comma-separated list' },
    ],
    melava: [
      { key: 'eyebrow', label: 'Eyebrow Text' },
      { key: 'title', label: 'Section Title' },
    ],
    app: [
      { key: 'eyebrow', label: 'Eyebrow Text' },
      { key: 'title', label: 'Section Title' },
      { key: 'subtitle', label: 'Subtitle' },
      { key: 'playStoreUrl', label: 'Play Store URL', type: 'url' },
      { key: 'appStoreUrl', label: 'App Store URL', type: 'url' },
    ],
    beforeafter: [
      { key: 'eyebrow', label: 'Eyebrow Text' },
      { key: 'title', label: 'Section Title' },
    ],
    cta: [
      { key: 'heading', label: 'Heading' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'ctaLabel', label: 'CTA Text' },
      { key: 'ctaLink', label: 'CTA Link' },
    ],
    header: [
      { key: 'logoText', label: 'Logo Text' },
      { key: 'ctaLogin', label: 'Login Button Text' },
      { key: 'ctaRegister', label: 'Register Button Text' },
    ],
    footer: [
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'copyrightText', label: 'Copyright Text' },
    ],
  };

  get genericFields(): { key: string; label: string; type?: string; hint?: string; options?: string[] }[] {
    return this.genericFieldDefs[this.selectedKey || ''] || [
      { key: 'eyebrow', label: 'Eyebrow Text' },
      { key: 'title', label: 'Section Title' },
    ];
  }

  get sectionLabel(): string {
    if (!this.selectedKey) return '';
    const def = SECTION_DEFS.find(d => d.key === this.selectedKey);
    return def?.label || this.selectedKey;
  }

  get sectionDescription(): string {
    const desc: Record<string, string> = {
      hero: 'Configure the main hero section with headline, CTAs, and media.',
      banner: 'Configure the trust banner section below the hero.',
      stats: 'Configure the trust indicator stats section.',
      features: 'Configure the features section with icons and descriptions.',
      how: 'Configure the "How It Works" step-by-step section.',
      profiles: 'Configure the featured profiles showcase.',
      success: 'Configure the success stories section.',
      testimonials: 'Configure the testimonials carousel.',
      counters: 'Configure the animated counters section.',
      why: 'Configure the "Why Choose Us" section.',
      castes: 'Configure the communities/castes section.',
      melava: 'Configure the events/meetups section.',
      app: 'Configure the app download section.',
      beforeafter: 'Configure the before/after comparison section.',
      cta: 'Configure the final call-to-action section.',
      header: 'Configure the navigation header (links, buttons, logo).',
      footer: 'Configure the page footer (links, social, legal).',
    };
    return desc[this.selectedKey || ''] || '';
  }

  ngOnChanges(): void {
    if (this.selectedKey) {
      this.activeTab = 'content';
      this.genericData = { ...this.sectionConfig };
    }
  }

  onConfigChanged(data: Record<string, any>): void {
    this.configChanged.emit(data);
  }

  onGenericChanged(): void {
    const out: Record<string, any> = {};
    for (const field of this.genericFields) {
      const val = this.genericData[field.key];
      if (val !== undefined && val !== null && val !== '') {
        out[field.key] = val;
      }
    }
    for (const k of ['visibleDesktop', 'visibleTablet', 'visibleMobile']) {
      if (this.genericData[k] !== undefined) {
        out[k] = this.genericData[k];
      }
    }
    this.configChanged.emit(out);
  }

  toggleGeneric(key: string): void {
    this.genericData[key] = this.genericData[key] === false ? true : false;
    this.emitAll();
  }

  private emitAll(): void {
    const out: Record<string, any> = {};
    const knownKeys = this.genericFields.map(f => f.key);
    const allKeys = new Set([...knownKeys, 'visibleDesktop', 'visibleTablet', 'visibleMobile']);
    for (const k of allKeys) {
      if (this.genericData[k] !== undefined) {
        out[k] = this.genericData[k];
      }
    }
    this.configChanged.emit(out);
  }
}
