import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

export interface ThemeConfig {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  headingFont?: string;
  bodyFont?: string;
  headingWeight?: string;
  bodyWeight?: string;
  buttonStyle?: string;
  buttonRadius?: string;
  buttonSize?: string;
  cardRadius?: string;
  cardShadow?: string;
  cardBorder?: string;
  pageMaxWidth?: string;
  sectionSpacing?: string;
}

const FONTS = [
  'Poppins', 'Nunito', 'Montserrat', 'Raleway', 'Playfair Display',
  'Lora', 'Open Sans', 'Roboto', 'Lato', 'Inter',
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-theme-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="builder-settings__head">
      <h4>Theme Settings</h4>
      <p>Global styles that affect all sections</p>
    </div>

    <div class="builder-settings__tabs">
      <button class="builder-settings__tab" [class.active]="tab === 'colors'" (click)="tab = 'colors'">Colors</button>
      <button class="builder-settings__tab" [class.active]="tab === 'typography'" (click)="tab = 'typography'">Typography</button>
      <button class="builder-settings__tab" [class.active]="tab === 'buttons'" (click)="tab = 'buttons'">Buttons</button>
      <button class="builder-settings__tab" [class.active]="tab === 'cards'" (click)="tab = 'cards'">Cards</button>
      <button class="builder-settings__tab" [class.active]="tab === 'global'" (click)="tab = 'global'">Global</button>
    </div>

    <div class="builder-settings__body">
      @switch (tab) {
        @case ('colors') {
          <div class="builder-settings__section">
            <div class="builder-settings__section-title">Brand Colors</div>
            <div class="builder-field">
              <label>Primary Color</label>
              <div class="builder-field--color">
                <input type="color" [(ngModel)]="data.primary" (ngModelChange)="emit()" />
                <input type="text" [(ngModel)]="data.primary" (ngModelChange)="emit()" placeholder="#7b1fa2" />
              </div>
            </div>
            <div class="builder-field">
              <label>Secondary Color</label>
              <div class="builder-field--color">
                <input type="color" [(ngModel)]="data.secondary" (ngModelChange)="emit()" />
                <input type="text" [(ngModel)]="data.secondary" (ngModelChange)="emit()" placeholder="#e91e63" />
              </div>
            </div>
            <div class="builder-field">
              <label>Accent Color</label>
              <div class="builder-field--color">
                <input type="color" [(ngModel)]="data.accent" (ngModelChange)="emit()" />
                <input type="text" [(ngModel)]="data.accent" (ngModelChange)="emit()" placeholder="#ff9800" />
              </div>
            </div>
            <div class="builder-field">
              <label>Background Color</label>
              <div class="builder-field--color">
                <input type="color" [(ngModel)]="data.background" (ngModelChange)="emit()" />
                <input type="text" [(ngModel)]="data.background" (ngModelChange)="emit()" placeholder="#ffffff" />
              </div>
            </div>
          </div>
        }

        @case ('typography') {
          <div class="builder-settings__section">
            <div class="builder-settings__section-title">Fonts</div>
            <div class="builder-field">
              <label>Heading Font</label>
              <select [(ngModel)]="data.headingFont" (ngModelChange)="emit()">
                <option value="">Default (from template)</option>
                @for (f of fonts; track f) {
                  <option [value]="f">{{ f }}</option>
                }
              </select>
            </div>
            <div class="builder-field">
              <label>Body Font</label>
              <select [(ngModel)]="data.bodyFont" (ngModelChange)="emit()">
                <option value="">Default (from template)</option>
                @for (f of fonts; track f) {
                  <option [value]="f">{{ f }}</option>
                }
              </select>
            </div>
          </div>
          <div class="builder-settings__section">
            <div class="builder-settings__section-title">Weights</div>
            <div class="builder-field-row">
              <div class="builder-field">
                <label>Heading Weight</label>
                <select [(ngModel)]="data.headingWeight" (ngModelChange)="emit()">
                  <option value="">Default</option>
                  <option value="400">400 Regular</option>
                  <option value="500">500 Medium</option>
                  <option value="600">600 Semi Bold</option>
                  <option value="700">700 Bold</option>
                  <option value="800">800 Extra Bold</option>
                </select>
              </div>
              <div class="builder-field">
                <label>Body Weight</label>
                <select [(ngModel)]="data.bodyWeight" (ngModelChange)="emit()">
                  <option value="">Default</option>
                  <option value="300">300 Light</option>
                  <option value="400">400 Regular</option>
                  <option value="500">500 Medium</option>
                </select>
              </div>
            </div>
          </div>
        }

        @case ('buttons') {
          <div class="builder-settings__section">
            <div class="builder-settings__section-title">Button Style</div>
            <div class="builder-field">
              <label>Style</label>
              <select [(ngModel)]="data.buttonStyle" (ngModelChange)="emit()">
                <option value="">Default (from template)</option>
                <option value="rounded">Rounded</option>
                <option value="pill">Pill</option>
                <option value="square">Square</option>
                <option value="ghost">Ghost</option>
              </select>
            </div>
            <div class="builder-field">
              <label>Border Radius</label>
              <select [(ngModel)]="data.buttonRadius" (ngModelChange)="emit()">
                <option value="">Default</option>
                <option value="4px">4px</option>
                <option value="6px">6px</option>
                <option value="8px">8px</option>
                <option value="12px">12px</option>
                <option value="16px">16px</option>
                <option value="999px">Full Round</option>
              </select>
            </div>
            <div class="builder-field">
              <label>Size</label>
              <select [(ngModel)]="data.buttonSize" (ngModelChange)="emit()">
                <option value="">Default</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        }

        @case ('cards') {
          <div class="builder-settings__section">
            <div class="builder-settings__section-title">Card Style</div>
            <div class="builder-field">
              <label>Border Radius</label>
              <select [(ngModel)]="data.cardRadius" (ngModelChange)="emit()">
                <option value="">Default</option>
                <option value="4px">4px</option>
                <option value="8px">8px</option>
                <option value="12px">12px</option>
                <option value="16px">16px</option>
                <option value="24px">24px</option>
              </select>
            </div>
            <div class="builder-field">
              <label>Shadow</label>
              <select [(ngModel)]="data.cardShadow" (ngModelChange)="emit()">
                <option value="">Default</option>
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </div>
            <div class="builder-field">
              <label>Border</label>
              <select [(ngModel)]="data.cardBorder" (ngModelChange)="emit()">
                <option value="">Default</option>
                <option value="none">None</option>
                <option value="1px solid #e5e7eb">Light</option>
                <option value="1px solid #d1d5db">Medium</option>
              </select>
            </div>
          </div>
        }

        @case ('global') {
          <div class="builder-settings__section">
            <div class="builder-settings__section-title">Layout</div>
            <div class="builder-field">
              <label>Page Max Width</label>
              <select [(ngModel)]="data.pageMaxWidth" (ngModelChange)="emit()">
                <option value="">Default (1200px)</option>
                <option value="960px">960px — Narrow</option>
                <option value="1080px">1080px — Compact</option>
                <option value="1200px">1200px — Standard</option>
                <option value="1400px">1400px — Wide</option>
                <option value="100%">Full Width</option>
              </select>
            </div>
            <div class="builder-field">
              <label>Section Spacing</label>
              <select [(ngModel)]="data.sectionSpacing" (ngModelChange)="emit()">
                <option value="">Default (80px)</option>
                <option value="48px">48px — Tight</option>
                <option value="64px">64px — Compact</option>
                <option value="80px">80px — Standard</option>
                <option value="96px">96px — Spacious</option>
                <option value="128px">128px — Extra</option>
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
      width: 380px;
      min-width: 380px;
      height: 100%;
      background: #fff;
      border-left: 1px solid #e4e4e7;
      overflow: hidden;
    }
    .builder-settings__head {
      padding: 14px 16px 10px;
      border-bottom: 1px solid #f0f0f0;
      flex-shrink: 0;
    }
    .builder-settings__head h4 { font-size: 14px; font-weight: 700; color: #1a1a2e; margin: 0 0 4px; }
    .builder-settings__head p { font-size: 12px; color: #9ca3af; margin: 0; line-height: 1.4; }
    .builder-settings__tabs {
      display: flex; gap: 0; border-bottom: 1px solid #e5e7eb;
      flex-shrink: 0; padding: 0 16px;
    }
    .builder-settings__tab {
      flex: 1; padding: 10px 12px; background: none; border: none;
      border-bottom: 2px solid transparent; font-size: 12px; font-weight: 600;
      color: #9ca3af; cursor: pointer; transition: all 0.15s;
    }
    .builder-settings__tab:hover { color: #6b7280; }
    .builder-settings__tab.active { color: #7c3aed; border-bottom-color: #7c3aed; }
    .builder-settings__body {
      flex: 1; overflow-y: auto; padding: 16px;
      scrollbar-width: thin; scrollbar-color: #d1d5db transparent;
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
    .builder-field-row { display: flex; gap: 12px; }
    .builder-field-row .builder-field { flex: 1; }
    .builder-field--color {
      display: flex; align-items: center; gap: 10px;
    }
    .builder-field--color input[type="color"] {
      width: 36px; height: 36px; padding: 2px; border: 1px solid #e5e7eb;
      border-radius: 6px; cursor: pointer; background: #fafafa;
    }
    .builder-field--color input[type="text"] { flex: 1; }
  `],
})
export class ThemeSettingsComponent implements OnChanges {
  @Input() config: ThemeConfig = {};
  @Output() configChanged = new EventEmitter<ThemeConfig>();

  tab = 'colors';
  data: ThemeConfig = {};
  readonly fonts = FONTS;

  ngOnChanges(): void {
    this.data = { ...this.config };
  }

  emit(): void {
    this.configChanged.emit({ ...this.data });
  }
}
