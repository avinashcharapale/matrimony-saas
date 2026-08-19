import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { StatusBadgeComponent } from '@org/shared-ui';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  TenantClient,
  TenantBrandingDto,
  TenantDomainDto,
  TenantContactDto,
  SaveTenantBrandingRequest,
  SaveTenantContactRequest,
  TenantLegalDocumentsDto,
  LegalDocumentKind,
  FeatureFlagDto,
  FeatureFlagDefinitionDto,
} from '@org/generated';
import { NotificationService } from '@org/core';

export const panelStyles = `
  .panel-card {
    background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    padding: 1.5rem; max-width: 760px;
  }
  .panel-header { margin-bottom: 1.25rem; }
  .panel-header h3 { margin: 0 0 4px; font-size: 17px; font-weight: 600; color: #222; }
  .panel-subtitle { margin: 0; color: #757575; font-size: 13px; }
  .settings-form { display: flex; flex-direction: column; gap: 2px; }
  .full-width { width: 100%; margin-bottom: 8px; }
  .half-width { width: 48%; }
  .third-width { width: 31%; }
  .form-row { display: flex; gap: 3%; margin-bottom: 8px; }
  .checkbox-row { margin: 8px 0; }
  .form-actions { margin-top: 1.25rem; }
  .form-actions .cancel-btn { margin-left: 8px; }
  .loading-inline { display: flex; justify-content: center; padding: 2.5rem; }
  .panel-empty { color: #9e9e9e; text-align: center; padding: 2rem; font-size: 14px; }
  .add-domain-row { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 1.25rem; }
  .add-domain-row .grow { flex: 1; }
  .domain-list { display: flex; flex-direction: column; gap: 10px; }
  .domain-row {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    border: 1px solid #ececec; border-radius: 10px; padding: 0.75rem 1rem; flex-wrap: wrap;
  }
  .domain-info { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
  .domain-name { font-weight: 600; font-size: 14px; color: #222; }
  .domain-badges { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .badge {
    display: inline-block; padding: 1px 8px; border-radius: 9999px;
    font-size: 11px; font-weight: 600;
  }
  .badge--primary { background: #fff3e0; color: #e65100; }
  .badge--hint { background: #eceff1; color: #607d8b; }
  .domain-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .image-field { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 8px; }
  .image-field__preview {
    width: 72px; height: 72px; border: 1px solid #ececec; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; overflow: hidden;
    background: #fafafa; flex-shrink: 0;
  }
  .image-field__placeholder { color: #bdbdbd; display: flex; }
  .image-field__img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .image-field__img--favicon { width: 32px; height: 32px; }
  .image-field__controls { flex: 1; min-width: 0; }
  .image-field__actions { display: flex; align-items: center; }
  .contact-type-select { width: 32%; margin-bottom: 8px; }
  .contact-label-field { width: 32%; margin-bottom: 8px; }
  .contact-sort-field { width: 32%; margin-bottom: 8px; }
  .contact-checkboxes { display: flex; gap: 24px; margin: 4px 0 8px; }
  .contact-value-field { margin-bottom: 8px; }
  .contact-edit-panel { margin-top: 1rem; border-top: 1px solid #ececec; padding-top: 1rem; }
  .contact-sort-badge { font-size: 12px; color: #757575; }
  .legal-list { display: flex; flex-direction: column; gap: 12px; }
  .legal-row {
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    border: 1px solid #ececec; border-radius: 10px; padding: 0.75rem 1rem; flex-wrap: wrap;
  }
  .legal-info { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .legal-icon {
    width: 40px; height: 40px; border-radius: 10px; background: #f5f5f5;
    display: flex; align-items: center; justify-content: center; color: #757575; flex-shrink: 0;
  }
  .legal-title { font-weight: 600; font-size: 14px; color: #222; }
  .legal-meta { font-size: 12px; color: #757575; }
  .legal-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .section-title { margin: 1rem 0 0.5rem; font-size: 0.9rem; font-weight: 600; color: #444; }
  .logo-live-preview { margin-top: 1rem; display: flex; flex-direction: column; gap: 8px; }
  .preview-label { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em; color: #999; font-weight: 600; }
  .preview-img { max-width: 100%; max-height: 100%; }
  .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f2f2f2; }
  .toggle-row:last-child { border-bottom: none; }
  .toggle-label { font-size: 14px; font-weight: 500; color: #333; }
  .toggle-sublabel { font-size: 12px; color: #999; margin-top: 2px; }
  .default-hint { font-size: 11px !important; color: #999 !important; font-style: italic; }
  .section-hint { font-size: 12px; color: #888; margin: 0 0 8px; padding: 6px 10px; background: #f9f9f9; border-left: 3px solid #ddd; border-radius: 0 4px 4px 0; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Branding (collapsible accordion sections)
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-branding-panel',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatIconModule, MatButtonModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatInputModule, MatCardModule, MatDividerModule, MatCheckboxModule,
  ],
  template: `
    <div class="panel-card">
      <div class="panel-header">
        <h3>Branding</h3>
        <p class="panel-subtitle">Customize the look and feel of your tenant's public sites</p>
      </div>

      @if (loading()) {
        <div class="loading-inline">
          <mat-spinner diameter="32"></mat-spinner>
        </div>
      } @else {
        <form [formGroup]="form" class="settings-form">

          <!-- ── Logo & Favicon ── -->
          <div class="accordion-section">
            <button type="button" class="accordion-header" (click)="toggle('logo')">
              <mat-icon>{{ openSections().has('logo') ? 'expand_more' : 'chevron_right' }}</mat-icon>
              <span>Logo & Favicon</span>
            </button>
            @if (openSections().has('logo')) {
              <div class="accordion-body">
                <div class="image-field">
                  <div class="image-field__preview">
                    @if (logoPreview()) {
                      <img [src]="logoPreview()" alt="Logo preview" class="image-field__img" (error)="logoPreview.set(null)" />
                    } @else {
                      <div class="image-field__placeholder"><mat-icon>image</mat-icon></div>
                    }
                  </div>
                  <div class="image-field__controls">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Logo URL</mat-label>
                      <input matInput formControlName="logoUrl" placeholder="https://..." />
                      @if (form.controls.logoUrl.invalid && form.controls.logoUrl.touched) {
                        <mat-error>Enter an absolute http(s) URL</mat-error>
                      }
                    </mat-form-field>
                    <div class="image-field__actions">
                      <button mat-stroked-button type="button" [disabled]="uploading() === 'logo'" (click)="logoInput.click()">
                        <mat-icon>upload</mat-icon>
                        {{ uploading() === 'logo' ? 'Uploading…' : 'Upload logo' }}
                      </button>
                      <input #logoInput type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon" hidden (change)="onFileSelected($event, 'logo')" />
                    </div>
                  </div>
                </div>

                <div class="image-field">
                  <div class="image-field__preview">
                    @if (faviconPreview()) {
                      <img [src]="faviconPreview()" alt="Favicon preview" class="image-field__img image-field__img--favicon" (error)="faviconPreview.set(null)" />
                    } @else {
                      <div class="image-field__placeholder"><mat-icon>image</mat-icon></div>
                    }
                  </div>
                  <div class="image-field__controls">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Favicon URL</mat-label>
                      <input matInput formControlName="faviconUrl" placeholder="https://..." />
                      @if (form.controls.faviconUrl.invalid && form.controls.faviconUrl.touched) {
                        <mat-error>Enter an absolute http(s) URL</mat-error>
                      }
                    </mat-form-field>
                    <div class="image-field__actions">
                      <button mat-stroked-button type="button" [disabled]="uploading() === 'favicon'" (click)="faviconInput.click()">
                        <mat-icon>upload</mat-icon>
                        {{ uploading() === 'favicon' ? 'Uploading…' : 'Upload favicon' }}
                      </button>
                      <input #faviconInput type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon" hidden (change)="onFileSelected($event, 'favicon')" />
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- ── Colors & Typography ── -->
          <div class="accordion-section">
            <button type="button" class="accordion-header" (click)="toggle('colors')">
              <mat-icon>{{ openSections().has('colors') ? 'expand_more' : 'chevron_right' }}</mat-icon>
              <span>Colors & Typography</span>
            </button>
            @if (openSections().has('colors')) {
              <div class="accordion-body">
                <div class="form-row color-row">
                  <div class="color-field">
                    <label>Primary Color</label>
                    <div class="color-input-group">
                      <input type="color" formControlName="primaryColor" class="color-swatch" />
                      <input matInput formControlName="primaryColor" placeholder="#1976d2" class="color-text" />
                      <mat-hint class="default-hint">Template default: set by theme palette</mat-hint>
                    </div>
                  </div>
                  <div class="color-field">
                    <label>Secondary Color</label>
                    <div class="color-input-group">
                      <input type="color" formControlName="secondaryColor" class="color-swatch" />
                      <input matInput formControlName="secondaryColor" placeholder="#e91e63" class="color-text" />
                      <mat-hint class="default-hint">Template default: set by theme palette</mat-hint>
                    </div>
                  </div>
                  <div class="color-field">
                    <label>Accent Color</label>
                    <div class="color-input-group">
                      <input type="color" formControlName="accentColor" class="color-swatch" />
                      <input matInput formControlName="accentColor" placeholder="#ff9800" class="color-text" />
                      <mat-hint class="default-hint">Legacy accent — template uses secondary</mat-hint>
                    </div>
                  </div>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Font Family</mat-label>
                  <input matInput formControlName="fontFamily" placeholder="Roboto, sans-serif" />
                  <mat-hint class="default-hint">Template default: body font (e.g. Manrope)</mat-hint>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Custom CSS</mat-label>
                  <textarea matInput formControlName="customCss" rows="4" placeholder="Optional custom CSS"></textarea>
                  <mat-hint class="default-hint">No default — optional override</mat-hint>
                </mat-form-field>
              </div>
            }
          </div>

          <!-- ── Logo Display ── -->
          <div class="accordion-section">
            <button type="button" class="accordion-header" (click)="toggle('logoDisplay')">
              <mat-icon>{{ openSections().has('logoDisplay') ? 'expand_more' : 'chevron_right' }}</mat-icon>
              <span>Logo Display</span>
            </button>
            @if (openSections().has('logoDisplay')) {
              <div class="accordion-body">
                <div class="form-row">
                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>Width</mat-label>
                    <input matInput formControlName="logoWidth" placeholder="48px" />
                    <mat-hint class="default-hint">48px</mat-hint>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>Height</mat-label>
                    <input matInput formControlName="logoHeight" placeholder="48px" />
                    <mat-hint class="default-hint">48px</mat-hint>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>Object Fit</mat-label>
                    <select matNativeControl formControlName="logoObjectFit">
                      <option value="">Default</option>
                      <option value="contain">Contain</option>
                      <option value="cover">Cover</option>
                      <option value="fill">Fill</option>
                      <option value="none">None</option>
                    </select>
                    <mat-hint class="default-hint">contain</mat-hint>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>Padding</mat-label>
                    <input matInput formControlName="logoPadding" placeholder="8px" />
                    <mat-hint class="default-hint">4px</mat-hint>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>Margin</mat-label>
                    <input matInput formControlName="logoMargin" placeholder="0 8px 0 0" />
                    <mat-hint class="default-hint">0</mat-hint>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>Background</mat-label>
                    <input matInput formControlName="logoBackground" placeholder="#ffffff" />
                    <mat-hint class="default-hint">transparent</mat-hint>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>Border Radius</mat-label>
                    <input matInput formControlName="logoBorderRadius" placeholder="12px" />
                    <mat-hint class="default-hint">8px</mat-hint>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>Border</mat-label>
                    <input matInput formControlName="logoBorder" placeholder="2px solid #eee" />
                    <mat-hint class="default-hint">1px solid #e0e0e0</mat-hint>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>Shadow</mat-label>
                    <input matInput formControlName="logoShadow" placeholder="0 2px 8px rgba(0,0,0,0.1)" />
                    <mat-hint class="default-hint">none</mat-hint>
                  </mat-form-field>
                </div>

                <!-- Margins & Colors sub-section -->
                <h5 class="sub-section-title">Margins & Colors</h5>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="quarter-width">
                    <mat-label>Margin Top</mat-label>
                    <input matInput formControlName="logoMarginTop" placeholder="0" />
                    <mat-hint class="default-hint">0</mat-hint>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="quarter-width">
                    <mat-label>Margin Right</mat-label>
                    <input matInput formControlName="logoMarginRight" placeholder="0" />
                    <mat-hint class="default-hint">0</mat-hint>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="quarter-width">
                    <mat-label>Margin Bottom</mat-label>
                    <input matInput formControlName="logoMarginBottom" placeholder="0" />
                    <mat-hint class="default-hint">0</mat-hint>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="quarter-width">
                    <mat-label>Margin Left</mat-label>
                    <input matInput formControlName="logoMarginLeft" placeholder="0" />
                    <mat-hint class="default-hint">0</mat-hint>
                  </mat-form-field>
                </div>

                <div class="form-row color-row">
                  <div class="color-field">
                    <label>Background Color</label>
                    <div class="color-input-group">
                      <input type="color" formControlName="logoBgColor" class="color-swatch" />
                      <input matInput formControlName="logoBgColor" placeholder="transparent" class="color-text" />
                      <mat-hint class="default-hint">transparent</mat-hint>
                    </div>
                  </div>
                  <div class="color-field">
                    <label>Border Color</label>
                    <div class="color-input-group">
                      <input type="color" formControlName="logoBorderColor" class="color-swatch" />
                      <input matInput formControlName="logoBorderColor" placeholder="#e0e0e0" class="color-text" />
                      <mat-hint class="default-hint">#e0e0e0</mat-hint>
                    </div>
                  </div>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>Border Width</mat-label>
                    <input matInput formControlName="logoBorderWidth" placeholder="1px" />
                    <mat-hint class="default-hint">1px</mat-hint>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>Border Style</mat-label>
                    <select matNativeControl formControlName="logoBorderStyle">
                      <option value="">Default</option>
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                      <option value="none">None</option>
                    </select>
                    <mat-hint class="default-hint">solid</mat-hint>
                  </mat-form-field>
                </div>

                <div class="form-row color-row">
                  <div class="color-field">
                    <label>Shadow Color</label>
                    <div class="color-input-group">
                      <input type="color" formControlName="logoShadowColor" class="color-swatch" />
                      <input matInput formControlName="logoShadowColor" placeholder="rgba(0,0,0,0.1)" class="color-text" />
                      <mat-hint class="default-hint">none</mat-hint>
                    </div>
                  </div>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="quarter-width">
                    <mat-label>Shadow Offset X</mat-label>
                    <input matInput formControlName="logoShadowOffsetX" placeholder="0" />
                    <mat-hint class="default-hint">0</mat-hint>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="quarter-width">
                    <mat-label>Shadow Offset Y</mat-label>
                    <input matInput formControlName="logoShadowOffsetY" placeholder="2" />
                    <mat-hint class="default-hint">2</mat-hint>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="quarter-width">
                    <mat-label>Shadow Blur</mat-label>
                    <input matInput formControlName="logoShadowBlur" placeholder="8" />
                    <mat-hint class="default-hint">8</mat-hint>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="quarter-width">
                    <mat-label>Shadow Spread</mat-label>
                    <input matInput formControlName="logoShadowSpread" placeholder="0" />
                    <mat-hint class="default-hint">0</mat-hint>
                  </mat-form-field>
                </div>

                @if (logoPreview()) {
                  <div class="logo-live-preview">
                    <span class="preview-label">Live Preview</span>
                    <div class="preview-container" [ngStyle]="previewStyles()">
                      <img [src]="logoPreview()" alt="Logo preview" class="preview-img" (error)="logoPreview.set(null)" />
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- ── Social Media ── -->
          <div class="accordion-section">
            <button type="button" class="accordion-header" (click)="toggle('social')">
              <mat-icon>{{ openSections().has('social') ? 'expand_more' : 'chevron_right' }}</mat-icon>
              <span>Social Media</span>
            </button>
            @if (openSections().has('social')) {
              <div class="accordion-body">
                <div class="form-row">
                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>Facebook</mat-label>
                    <input matInput formControlName="facebookUrl" placeholder="https://facebook.com/..." />
                    <mat-hint class="default-hint">No default — optional</mat-hint>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>Instagram</mat-label>
                    <input matInput formControlName="instagramUrl" placeholder="https://instagram.com/..." />
                    <mat-hint class="default-hint">No default — optional</mat-hint>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>YouTube</mat-label>
                    <input matInput formControlName="youTubeUrl" placeholder="https://youtube.com/..." />
                    <mat-hint class="default-hint">No default — optional</mat-hint>
                  </mat-form-field>
                </div>
                <div class="form-row">
                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>Twitter / X</mat-label>
                    <input matInput formControlName="twitterUrl" placeholder="https://x.com/..." />
                    <mat-hint class="default-hint">No default — optional</mat-hint>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>WhatsApp</mat-label>
                    <input matInput formControlName="whatsAppUrl" placeholder="https://wa.me/..." />
                    <mat-hint class="default-hint">No default — optional</mat-hint>
                  </mat-form-field>
                </div>
              </div>
            }
          </div>

          <!-- ── Footer ── -->
          <div class="accordion-section">
            <button type="button" class="accordion-header" (click)="toggle('footer')">
              <mat-icon>{{ openSections().has('footer') ? 'expand_more' : 'chevron_right' }}</mat-icon>
              <span>Footer</span>
            </button>
            @if (openSections().has('footer')) {
              <div class="accordion-body">
                <div class="toggle-row">
                  <div>
                    <div class="toggle-label">Show Social Media Icons</div>
                    <div class="toggle-sublabel">Display social media icons in the footer</div>
                  </div>
                  <mat-checkbox formControlName="showFooterSocialMedia"></mat-checkbox>
                </div>
                <div class="toggle-row">
                  <div>
                    <div class="toggle-label">Show Legal Links</div>
                    <div class="toggle-sublabel">Display Privacy Policy, Terms, Refund links in the footer</div>
                  </div>
                  <mat-checkbox formControlName="showFooterLegalLinks"></mat-checkbox>
                </div>
                <div class="toggle-row">
                  <div>
                    <div class="toggle-label">Show Contact Information</div>
                    <div class="toggle-sublabel">Display phone, email, address in the footer</div>
                  </div>
                  <mat-checkbox formControlName="showFooterContactInfo"></mat-checkbox>
                </div>
              </div>
            }
          </div>

          <!-- ── Header Bar ── -->
          <div class="accordion-section">
            <button type="button" class="accordion-header" (click)="toggle('header')">
              <mat-icon>{{ openSections().has('header') ? 'expand_more' : 'chevron_right' }}</mat-icon>
              <span>Header Bar</span>
            </button>
            @if (openSections().has('header')) {
              <div class="accordion-body">
                <div class="form-row">
                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>Height</mat-label>
                    <input matInput formControlName="headerHeight" placeholder="64px" />
                    <mat-hint class="default-hint">From template</mat-hint>
                  </mat-form-field>
                  <div class="color-field" style="flex:1;min-width:140px">
                    <label>Background</label>
                    <div class="color-input-group">
                      <input type="color" formControlName="headerBg" class="color-swatch" />
                      <input matInput formControlName="headerBg" placeholder="#ffffff" class="color-text" />
                      <mat-hint class="default-hint">Template nav color</mat-hint>
                    </div>
                  </div>
                  <div class="color-field" style="flex:1;min-width:140px">
                    <label>Text Color</label>
                    <div class="color-input-group">
                      <input type="color" formControlName="headerTextColor" class="color-swatch" />
                      <input matInput formControlName="headerTextColor" placeholder="#333" class="color-text" />
                      <mat-hint class="default-hint">Template text color</mat-hint>
                    </div>
                  </div>
                </div>
                <div class="toggle-row">
                  <div>
                    <div class="toggle-label">Sticky Header</div>
                    <div class="toggle-sublabel">Header sticks to top on scroll</div>
                  </div>
                  <mat-checkbox formControlName="headerSticky"></mat-checkbox>
                </div>
                <div class="toggle-row">
                  <div>
                    <div class="toggle-label">Glass Effect</div>
                    <div class="toggle-sublabel">Frosted glass / blur background effect</div>
                  </div>
                  <mat-checkbox formControlName="headerGlass"></mat-checkbox>
                </div>
              </div>
            }
          </div>

          <!-- ── Brand Display ── -->
          <div class="accordion-section">
            <button type="button" class="accordion-header" (click)="toggle('brand')">
              <mat-icon>{{ openSections().has('brand') ? 'expand_more' : 'chevron_right' }}</mat-icon>
              <span>Brand Display</span>
            </button>
            @if (openSections().has('brand')) {
              <div class="accordion-body">
                <div class="toggle-row">
                  <div>
                    <div class="toggle-label">Show Brand in Navigation</div>
                    <div class="toggle-sublabel">Display brand name/logo in the top nav bar</div>
                  </div>
                  <mat-checkbox formControlName="showBrandInNav"></mat-checkbox>
                </div>
                <div class="toggle-row">
                  <div>
                    <div class="toggle-label">Show Brand in Footer</div>
                    <div class="toggle-sublabel">Display brand name/logo in the footer</div>
                  </div>
                  <mat-checkbox formControlName="showBrandInFooter"></mat-checkbox>
                </div>
                <div class="toggle-row">
                  <div>
                    <div class="toggle-label">Show Brand in Hero</div>
                    <div class="toggle-sublabel">Display brand name/logo in the hero section</div>
                  </div>
                  <mat-checkbox formControlName="showBrandInHero"></mat-checkbox>
                </div>

                <h5 class="sub-section-title">Brand Text</h5>
                <div class="form-row">
                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>Font Family</mat-label>
                    <input matInput formControlName="brandFontFamily" placeholder="Poppins, sans-serif" />
                    <mat-hint class="default-hint">Template heading font (e.g. Fraunces)</mat-hint>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>Font Size</mat-label>
                    <input matInput formControlName="brandFontSize" placeholder="18px" />
                    <mat-hint class="default-hint">18px</mat-hint>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>Font Weight</mat-label>
                    <input matInput formControlName="brandFontWeight" placeholder="700" />
                    <mat-hint class="default-hint">700</mat-hint>
                  </mat-form-field>
                </div>
                <div class="form-row color-row">
                  <div class="color-field">
                    <label>Text Color</label>
                    <div class="color-input-group">
                      <input type="color" formControlName="brandTextColor" class="color-swatch" />
                      <input matInput formControlName="brandTextColor" placeholder="#333" class="color-text" />
                      <mat-hint class="default-hint">#333</mat-hint>
                    </div>
                  </div>
                </div>
                <div class="form-row">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Letter Spacing</mat-label>
                    <input matInput formControlName="brandLetterSpacing" placeholder="0.5px" />
                    <mat-hint class="default-hint">0.5px</mat-hint>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Text Transform</mat-label>
                    <select matNativeControl formControlName="brandTextTransform">
                      <option value="">None</option>
                      <option value="uppercase">Uppercase</option>
                      <option value="lowercase">Lowercase</option>
                      <option value="capitalize">Capitalize</option>
                    </select>
                    <mat-hint class="default-hint">None</mat-hint>
                  </mat-form-field>
                </div>

                <h5 class="sub-section-title">Brand Badge</h5>
                <div class="form-row color-row">
                  <div class="color-field">
                    <label>Badge Background</label>
                    <div class="color-input-group">
                      <input type="color" formControlName="badgeBg" class="color-swatch" />
                      <input matInput formControlName="badgeBg" placeholder="#ff9800" class="color-text" />
                      <mat-hint class="default-hint">#ff9800</mat-hint>
                    </div>
                  </div>
                  <div class="color-field">
                    <label>Badge Text Color</label>
                    <div class="color-input-group">
                      <input type="color" formControlName="badgeTextColor" class="color-swatch" />
                      <input matInput formControlName="badgeTextColor" placeholder="#fff" class="color-text" />
                      <mat-hint class="default-hint">#fff</mat-hint>
                    </div>
                  </div>
                </div>
                <div class="form-row">
                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>Badge Size</mat-label>
                    <input matInput formControlName="badgeSize" placeholder="24px" />
                    <mat-hint class="default-hint">24px</mat-hint>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>Badge Radius</mat-label>
                    <input matInput formControlName="badgeRadius" placeholder="50%" />
                    <mat-hint class="default-hint">50%</mat-hint>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="third-width">
                    <mat-label>Badge Font Size</mat-label>
                    <input matInput formControlName="badgeFontSize" placeholder="12px" />
                    <mat-hint class="default-hint">12px</mat-hint>
                  </mat-form-field>
                </div>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Badge Font Weight</mat-label>
                  <input matInput formControlName="badgeFontWeight" placeholder="600" />
                  <mat-hint class="default-hint">600</mat-hint>
                </mat-form-field>
              </div>
            }
          </div>

          <div class="form-actions">
            <button mat-flat-button color="primary" [disabled]="saving() || form.invalid" (click)="save()">
              <mat-icon>save</mat-icon>
              Save Branding
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [panelStyles + `
    .accordion-section { border-bottom: 1px solid #e8e0f0; }
    .accordion-header {
      display: flex; align-items: center; gap: 8px; width: 100%; padding: 14px 0;
      background: none; border: none; cursor: pointer; font-size: 0.9rem; font-weight: 600;
      color: #4a148c; transition: color 0.15s;
    }
    .accordion-header:hover { color: #7b1fa2; }
    .accordion-header mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .accordion-body { padding: 0 0 16px 28px; }
    .sub-section-title { font-size: 0.8rem; color: #888; margin: 16px 0 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .color-row { display: flex; gap: 16px; flex-wrap: wrap; }
    .color-field { flex: 1; min-width: 140px; }
    .color-field label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; font-weight: 500; }
    .color-input-group { display: flex; align-items: center; gap: 8px; border: 1px solid #ccc; border-radius: 4px; padding: 4px 8px; background: #fff; }
    .color-swatch { width: 32px; height: 32px; border: none; border-radius: 4px; cursor: pointer; padding: 0; background: none; }
    .color-swatch::-webkit-color-swatch-wrapper { padding: 0; }
    .color-swatch::-webkit-color-swatch { border: 1px solid #ddd; border-radius: 3px; }
    .color-text { flex: 1; border: none !important; outline: none; font-size: 13px; font-family: monospace; background: transparent; min-width: 0; }
    .color-text:focus { box-shadow: none !important; }
    .quarter-width { flex: 1; min-width: 120px; }
  `],
})
export class BrandingPanel implements OnInit {
  private readonly tenantClient = inject(TenantClient);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);

  @Input() tenantId?: number;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly uploading = signal<'logo' | 'favicon' | null>(null);
  readonly logoPreview = signal<string | null>(null);
  readonly faviconPreview = signal<string | null>(null);
  readonly openSections = signal(new Set<string>([]));

  toggle(section: string): void {
    const s = new Set(this.openSections());
    if (s.has(section)) { s.delete(section); } else { s.add(section); }
    this.openSections.set(s);
  }

  readonly form = this.fb.nonNullable.group({
    logoUrl: ['', [Validators.pattern(/^https?:\/\/.+/i)]],
    faviconUrl: ['', [Validators.pattern(/^https?:\/\/.+/i)]],
    primaryColor: [''],
    secondaryColor: [''],
    accentColor: [''],
    fontFamily: [''],
    customCss: [''],
    logoWidth: [''],
    logoHeight: [''],
    logoObjectFit: [''],
    logoPadding: [''],
    logoMargin: [''],
    logoBackground: [''],
    logoBorderRadius: [''],
    logoBorder: [''],
    logoShadow: [''],
    facebookUrl: [''],
    instagramUrl: [''],
    youTubeUrl: [''],
    twitterUrl: [''],
    whatsAppUrl: [''],
    showFooterSocialMedia: [true],
    showFooterLegalLinks: [true],
    showFooterContactInfo: [true],
    // Logo Display Expansion
    logoMarginTop: [''],
    logoMarginRight: [''],
    logoMarginBottom: [''],
    logoMarginLeft: [''],
    logoBgColor: [''],
    logoBorderColor: [''],
    logoBorderWidth: [''],
    logoBorderStyle: [''],
    logoShadowColor: [''],
    logoShadowOffsetX: [''],
    logoShadowOffsetY: [''],
    logoShadowBlur: [''],
    logoShadowSpread: [''],
    // Brand Display
    showBrandInNav: [true],
    showBrandInFooter: [true],
    showBrandInHero: [true],
    // Brand Text
    brandFontFamily: [''],
    brandFontSize: [''],
    brandFontWeight: [''],
    brandTextColor: [''],
    brandLetterSpacing: [''],
    brandTextTransform: [''],
    // Brand Badge
    badgeBg: [''],
    badgeTextColor: [''],
    badgeSize: [''],
    badgeRadius: [''],
    badgeFontSize: [''],
    badgeFontWeight: [''],
    // Header Bar
    headerHeight: [''],
    headerBg: [''],
    headerTextColor: [''],
    headerSticky: [true],
    headerGlass: [false],
  });

  readonly previewStyles = computed(() => {
    const v = this.form.value;
    return {
      'width': v.logoWidth || '48px',
      'height': v.logoHeight || '48px',
      'object-fit': v.logoObjectFit || 'contain',
      'padding': v.logoPadding || '4px',
      'margin': v.logoMargin || '0',
      'background': v.logoBackground || 'transparent',
      'border-radius': v.logoBorderRadius || '8px',
      'border': v.logoBorder || '1px solid #e0e0e0',
      'box-shadow': v.logoShadow || 'none',
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'overflow': 'hidden',
    };
  });

  ngOnInit(): void {
    this.form.controls.logoUrl.valueChanges.subscribe((v) =>
      this.logoPreview.set(v && /^https?:\/\/.+/i.test(v) ? v : null),
    );
    this.form.controls.faviconUrl.valueChanges.subscribe((v) =>
      this.faviconPreview.set(v && /^https?:\/\/.+/i.test(v) ? v : null),
    );

    this.tenantClient.getTenantBranding(this.tenantId).subscribe({
      next: (data) => {
        if (data) {
          let branding: any = {};
          try { branding = data.brandingJson ? JSON.parse(data.brandingJson) : {}; } catch {}
          const ls = branding.logoDisplay || branding.logoSettings || {};
          this.form.patchValue({
            logoUrl: branding.logoUrl ?? '',
            faviconUrl: branding.faviconUrl ?? '',
            primaryColor: branding.primaryColor ?? '',
            secondaryColor: branding.secondaryColor ?? '',
            accentColor: branding.accentColor ?? '',
            fontFamily: branding.fontFamily ?? '',
            customCss: branding.customCss ?? '',
            logoWidth: ls.width ?? '',
            logoHeight: ls.height ?? '',
            logoObjectFit: ls.objectFit ?? '',
            logoPadding: ls.padding ?? '',
            logoMargin: ls.margin ?? '',
            logoBackground: ls.background ?? '',
            logoBorderRadius: ls.borderRadius ?? '',
            logoBorder: ls.border ?? '',
            logoShadow: ls.shadow ?? '',
            facebookUrl: branding.facebookUrl ?? '',
            instagramUrl: branding.instagramUrl ?? '',
            youTubeUrl: branding.youTubeUrl ?? '',
            twitterUrl: branding.twitterUrl ?? '',
            whatsAppUrl: branding.whatsAppUrl ?? '',
            showFooterSocialMedia: branding.showFooterSocialMedia ?? true,
            showFooterLegalLinks: branding.showFooterLegalLinks ?? true,
            showFooterContactInfo: branding.showFooterContactInfo ?? true,
            // Logo Display Expansion
            logoMarginTop: ls.marginTop ?? '',
            logoMarginRight: ls.marginRight ?? '',
            logoMarginBottom: ls.marginBottom ?? '',
            logoMarginLeft: ls.marginLeft ?? '',
            logoBgColor: ls.bgColor ?? '',
            logoBorderColor: ls.borderColor ?? '',
            logoBorderWidth: ls.borderWidth ?? '',
            logoBorderStyle: ls.borderStyle ?? '',
            logoShadowColor: ls.shadowColor ?? '',
            logoShadowOffsetX: ls.shadowOffsetX ?? '',
            logoShadowOffsetY: ls.shadowOffsetY ?? '',
            logoShadowBlur: ls.shadowBlur ?? '',
            logoShadowSpread: ls.shadowSpread ?? '',
            // Brand Display
            showBrandInNav: branding.showBrandInNav ?? true,
            showBrandInFooter: branding.showBrandInFooter ?? true,
            showBrandInHero: branding.showBrandInHero ?? true,
            // Brand Text
            brandFontFamily: branding.brandFontFamily ?? '',
            brandFontSize: branding.brandFontSize ?? '',
            brandFontWeight: branding.brandFontWeight ?? '',
            brandTextColor: branding.brandTextColor ?? '',
            brandLetterSpacing: branding.brandLetterSpacing ?? '',
            brandTextTransform: branding.brandTextTransform ?? '',
            // Brand Badge
            badgeBg: branding.badgeBg ?? '',
            badgeTextColor: branding.badgeTextColor ?? '',
            badgeSize: branding.badgeSize ?? '',
            badgeRadius: branding.badgeRadius ?? '',
            badgeFontSize: branding.badgeFontSize ?? '',
            badgeFontWeight: branding.badgeFontWeight ?? '',
            // Header Bar
            headerHeight: branding.headerHeight ?? '',
            headerBg: branding.headerBg ?? '',
            headerTextColor: branding.headerTextColor ?? '',
            headerSticky: branding.headerSticky ?? true,
            headerGlass: branding.headerGlass ?? false,
          });
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onFileSelected(event: Event, kind: 'logo' | 'favicon'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading.set(kind);
    const request = kind === 'logo'
      ? this.tenantClient.uploadBrandingLogo(file, this.tenantId)
      : this.tenantClient.uploadBrandingFavicon(file, this.tenantId);

    request.subscribe({
      next: (result) => {
        this.uploading.set(null);
        if (kind === 'logo') {
          this.form.patchValue({ logoUrl: result.url });
        } else {
          this.form.patchValue({ faviconUrl: result.url });
        }
        this.notifications.success('Image uploaded — click Save to apply.');
        input.value = '';
      },
      error: () => {
        this.uploading.set(null);
        this.notifications.error('Image upload failed');
        input.value = '';
      },
    });
  }

  save(): void {
    this.saving.set(true);
    const raw = this.form.getRawValue();

    const brandingObj: Record<string, any> = {
      logoUrl: raw.logoUrl || undefined,
      faviconUrl: raw.faviconUrl || undefined,
      primaryColor: raw.primaryColor || undefined,
      secondaryColor: raw.secondaryColor || undefined,
      accentColor: raw.accentColor || undefined,
      fontFamily: raw.fontFamily || undefined,
      customCss: raw.customCss || undefined,
      logoDisplay: {
        width: raw.logoWidth || undefined,
        height: raw.logoHeight || undefined,
        objectFit: raw.logoObjectFit || undefined,
        padding: raw.logoPadding || undefined,
        margin: raw.logoMargin || undefined,
        background: raw.logoBackground || undefined,
        borderRadius: raw.logoBorderRadius || undefined,
        border: raw.logoBorder || undefined,
        shadow: raw.logoShadow || undefined,
        marginTop: raw.logoMarginTop || undefined,
        marginRight: raw.logoMarginRight || undefined,
        marginBottom: raw.logoMarginBottom || undefined,
        marginLeft: raw.logoMarginLeft || undefined,
        bgColor: raw.logoBgColor || undefined,
        borderColor: raw.logoBorderColor || undefined,
        borderWidth: raw.logoBorderWidth || undefined,
        borderStyle: raw.logoBorderStyle || undefined,
        shadowColor: raw.logoShadowColor || undefined,
        shadowOffsetX: raw.logoShadowOffsetX || undefined,
        shadowOffsetY: raw.logoShadowOffsetY || undefined,
        shadowBlur: raw.logoShadowBlur || undefined,
        shadowSpread: raw.logoShadowSpread || undefined,
      },
      showBrandInNav: raw.showBrandInNav ?? true,
      showBrandInFooter: raw.showBrandInFooter ?? true,
      showBrandInHero: raw.showBrandInHero ?? true,
      brandFontFamily: raw.brandFontFamily || undefined,
      brandFontSize: raw.brandFontSize || undefined,
      brandFontWeight: raw.brandFontWeight || undefined,
      brandTextColor: raw.brandTextColor || undefined,
      brandLetterSpacing: raw.brandLetterSpacing || undefined,
      brandTextTransform: raw.brandTextTransform || undefined,
      badgeBg: raw.badgeBg || undefined,
      badgeTextColor: raw.badgeTextColor || undefined,
      badgeSize: raw.badgeSize || undefined,
      badgeRadius: raw.badgeRadius || undefined,
      badgeFontSize: raw.badgeFontSize || undefined,
      badgeFontWeight: raw.badgeFontWeight || undefined,
      headerHeight: raw.headerHeight || undefined,
      headerBg: raw.headerBg || undefined,
      headerTextColor: raw.headerTextColor || undefined,
      headerSticky: raw.headerSticky ?? true,
      headerGlass: raw.headerGlass ?? false,
      facebookUrl: raw.facebookUrl || undefined,
      instagramUrl: raw.instagramUrl || undefined,
      youTubeUrl: raw.youTubeUrl || undefined,
      twitterUrl: raw.twitterUrl || undefined,
      whatsAppUrl: raw.whatsAppUrl || undefined,
      showFooterSocialMedia: raw.showFooterSocialMedia ?? true,
      showFooterLegalLinks: raw.showFooterLegalLinks ?? true,
      showFooterContactInfo: raw.showFooterContactInfo ?? true,
    };

    const body: SaveTenantBrandingRequest = {
      brandingJson: JSON.stringify(brandingObj),
    };
    this.tenantClient.upsertTenantBranding(body, this.tenantId).subscribe({
      next: () => {
        this.saving.set(false);
        this.notifications.success('Branding saved');
      },
      error: () => {
        this.saving.set(false);
        this.notifications.error('Failed to save branding');
      },
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Legal Documents
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-legal-documents-panel',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatIconModule, MatButtonModule, MatProgressSpinnerModule,
    MatCardModule, MatDividerModule,
  ],
  template: `
    <div class="panel-card">
      <div class="panel-header">
        <h3>Legal Documents</h3>
        <p class="panel-subtitle">Upload the privacy policy, terms and refund policy shown to your members</p>
      </div>

      @if (loading()) {
        <div class="loading-inline">
          <mat-spinner diameter="32"></mat-spinner>
        </div>
      } @else {
        <div class="legal-list">
          @for (item of kinds; track item.kind) {
            <div class="legal-row">
              <div class="legal-info">
                <div class="legal-icon"><mat-icon>description</mat-icon></div>
                <div>
                  <div class="legal-title">{{ item.label }}</div>
                  <div class="legal-meta">{{ item.description }}</div>
                  @if (urlFor(item.kind)) {
                    <a class="legal-meta" [href]="urlFor(item.kind)!" target="_blank" rel="noopener">
                      View current document
                    </a>
                  } @else {
                    <div class="legal-meta">No document uploaded yet</div>
                  }
                </div>
              </div>
              <div class="legal-actions">
                <button mat-stroked-button type="button" [disabled]="uploading() === item.kind" (click)="fileInput.click()">
                  <mat-icon>upload</mat-icon>
                  {{ uploading() === item.kind ? 'Uploading…' : item.kind === 'rules' ? 'Upload PDF or Image' : 'Upload PDF' }}
                </button>
                <input #fileInput type="file" [accept]="item.kind === 'rules' ? 'application/pdf,image/*' : 'application/pdf'" hidden (change)="onFileSelected($event, item.kind)" />
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [panelStyles],
})
export class LegalDocumentsPanel implements OnInit {
  private readonly tenantClient = inject(TenantClient);
  private readonly notifications = inject(NotificationService);

  @Input() tenantId?: number;

  readonly loading = signal(true);
  readonly uploading = signal<LegalDocumentKind | null>(null);
  readonly documents = signal<TenantLegalDocumentsDto | null>(null);

  readonly kinds: { kind: LegalDocumentKind; label: string; description: string }[] = [
    { kind: 'privacy', label: 'Privacy Policy', description: 'How member data is collected and used.' },
    { kind: 'terms', label: 'Terms & Conditions', description: 'Rules and obligations for using the platform.' },
    { kind: 'refund', label: 'Refund Policy', description: 'Membership and payment refund terms.' },
    { kind: 'rules', label: 'Rules', description: 'Platform rules and guidelines (PDF or image).' },
  ];

  ngOnInit(): void {
    this.tenantClient.getTenantLegalDocuments(this.tenantId).subscribe({
      next: (data) => {
        this.documents.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  urlFor(kind: LegalDocumentKind): string | null {
    const d = this.documents();
    if (!d) return null;
    if (kind === 'privacy') return d.privacyPolicyUrl ?? null;
    if (kind === 'terms') return d.termsConditionsUrl ?? null;
    if (kind === 'refund') return d.refundPolicyUrl ?? null;
    return d.rulesUrl ?? null;
  }

  onFileSelected(event: Event, kind: LegalDocumentKind): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading.set(kind);
    this.tenantClient.uploadLegalDocument(kind, file, this.tenantId).subscribe({
      next: (data) => {
        this.uploading.set(null);
        this.documents.set(data);
        this.notifications.success('Document uploaded.');
        input.value = '';
      },
      error: () => {
        this.uploading.set(null);
        this.notifications.error('Document upload failed');
        input.value = '';
      },
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Domains
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-domains-panel',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, StatusBadgeComponent,
    MatIconModule, MatButtonModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatInputModule, MatCardModule, MatDividerModule,
  ],
  template: `
    <div class="panel-card">
      <div class="panel-header">
        <h3>Domains</h3>
        <p class="panel-subtitle">Domains mapped to your tenant</p>
      </div>

      <form [formGroup]="form" class="add-domain-row">
        <mat-form-field appearance="outline" class="grow">
          <mat-label>New domain</mat-label>
          <input matInput formControlName="domain" placeholder="matrimony.yourdomain.com" />
        </mat-form-field>
        <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="addDomain()">
          <mat-icon>add</mat-icon>
          Add
        </button>
      </form>

      @if (loading()) {
        <div class="loading-inline">
          <mat-spinner diameter="32"></mat-spinner>
        </div>
      } @else if (domains().length === 0) {
        <div class="panel-empty">No domains configured</div>
      } @else {
        <div class="domain-list">
          @for (domain of domains(); track domain.domainId) {
            <div class="domain-row">
              <div class="domain-info">
                <span class="domain-name">{{ domain.domain }}</span>
                <div class="domain-badges">
                  @if (domain.isPrimary) {
                    <span class="badge badge--primary">Primary</span>
                  }
                  <ui-status-badge [status]="domain.isVerified ? 'Active' : 'Inactive'"></ui-status-badge>
                  @if (!domain.isVerified) {
                    <span class="badge badge--hint">Unverified</span>
                  }
                </div>
              </div>
              <div class="domain-actions">
                @if (!domain.isVerified && domain.domainId != null) {
                  <button mat-stroked-button color="primary" (click)="verify(domain.domainId)">
                    <mat-icon>verified</mat-icon>
                    Verify
                  </button>
                }
                @if (!domain.isPrimary && domain.domainId != null) {
                  <button mat-stroked-button (click)="setPrimary(domain.domainId)">
                    <mat-icon>star</mat-icon>
                    Make primary
                  </button>
                }
                @if (domain.domainId != null) {
                  <button mat-icon-button color="warn" title="Delete" (click)="remove(domain.domainId)">
                    <mat-icon>delete</mat-icon>
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [panelStyles],
})
export class DomainsPanel implements OnInit {
  private readonly tenantClient = inject(TenantClient);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);

  @Input() tenantId?: number;

  readonly loading = signal(true);
  readonly domains = signal<TenantDomainDto[]>([]);

  readonly form = this.fb.nonNullable.group({
    domain: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.loadDomains();
  }

  loadDomains(): void {
    this.loading.set(true);
    this.tenantClient.getTenantDomains(this.tenantId).subscribe({
      next: (data) => { this.domains.set(data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  addDomain(): void {
    const domain = this.form.get('domain')?.value?.trim();
    if (!domain) return;
    this.tenantClient.createTenantDomain({ domain }, this.tenantId).subscribe({
      next: () => {
        this.notifications.success('Domain added');
        this.form.reset({ domain: '' });
        this.loadDomains();
      },
      error: () => this.notifications.error('Failed to add domain'),
    });
  }

  verify(id: number): void {
    this.tenantClient.verifyTenantDomain(id, this.tenantId).subscribe({
      next: () => { this.notifications.success('Domain verified'); this.loadDomains(); },
      error: () => this.notifications.error('Failed to verify domain'),
    });
  }

  setPrimary(id: number): void {
    this.tenantClient.setPrimaryTenantDomain(id, this.tenantId).subscribe({
      next: () => { this.notifications.success('Primary domain updated'); this.loadDomains(); },
      error: () => this.notifications.error('Failed to update primary domain'),
    });
  }

  remove(id: number): void {
    this.tenantClient.deleteTenantDomain(id, this.tenantId).subscribe({
      next: () => { this.notifications.success('Domain deleted'); this.loadDomains(); },
      error: () => this.notifications.error('Failed to delete domain'),
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Contacts
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-contacts-panel',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, StatusBadgeComponent,
    MatIconModule, MatButtonModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatInputModule, MatCardModule, MatDividerModule,
    MatSelectModule, MatCheckboxModule,
  ],
  template: `
    <div class="panel-card">
      <div class="panel-header">
        <h3>Contacts</h3>
        <p class="panel-subtitle">Contact details displayed on your tenant's public sites</p>
      </div>

      @if (loading() && contacts().length === 0) {
        <div class="loading-inline">
          <mat-spinner diameter="32"></mat-spinner>
        </div>
      } @else {
        <form [formGroup]="form" class="settings-form" (ngSubmit)="save()">
          <div class="form-row">
            <mat-form-field appearance="outline" class="contact-type-select">
              <mat-label>Type</mat-label>
              <mat-select formControlName="contactType" aria-label="Contact type">
                @for (type of contactTypes; track type) {
                  <mat-option [value]="type">{{ type }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="contact-label-field">
              <mat-label>Label</mat-label>
              <input matInput formControlName="label" placeholder="e.g. Support" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="contact-sort-field">
              <mat-label>Sort</mat-label>
              <input matInput type="number" formControlName="sortOrder" placeholder="0" />
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width contact-value-field">
            <mat-label>Value</mat-label>
            <input matInput formControlName="value" placeholder="support@example.com" />
            @if (form.controls.value.invalid && form.controls.value.touched) {
              <mat-error>Value is required</mat-error>
            }
          </mat-form-field>

          <div class="contact-checkboxes">
            <mat-checkbox formControlName="isActive">Active</mat-checkbox>
            <mat-checkbox formControlName="isPrimary">Primary</mat-checkbox>
          </div>

          <div class="form-actions">
            <button mat-flat-button color="primary" type="button" [disabled]="saving() || form.invalid" (click)="save()">
              <mat-icon>save</mat-icon>
              {{ editing() ? 'Update Contact' : 'Add Contact' }}
            </button>
            @if (editing()) {
              <button mat-stroked-button type="button" class="cancel-btn" (click)="resetForm()">Cancel</button>
            }
          </div>
        </form>

        <div class="contact-edit-panel panel-divider"></div>

        @if (contacts().length === 0 && !loading()) {
          <div class="panel-empty">No contacts configured</div>
        } @else {
          <div class="domain-list">
            @for (contact of contacts(); track contact.tenantContactId) {
              <div class="domain-row">
                <div class="domain-info">
                  <span class="domain-name">{{ contact.label || contact.contactType }}</span>
                  <div class="domain-badges">
                    <span class="badge badge--hint">{{ contact.contactType }}</span>
                    @if (contact.isPrimary) {
                      <span class="badge badge--primary">Primary</span>
                    }
                    <ui-status-badge [status]="contact.isActive ? 'Active' : 'Inactive'"></ui-status-badge>
                    <span class="contact-sort-badge">#{{ contact.sortOrder }}</span>
                  </div>
                </div>
                <div class="domain-actions">
                  @if (!contact.isPrimary && contact.tenantContactId != null) {
                    <button mat-stroked-button type="button" (click)="setPrimary(contact.tenantContactId)">
                      <mat-icon>star</mat-icon>
                      Set primary
                    </button>
                  }
                  @if (contact.tenantContactId != null) {
                    <button mat-stroked-button type="button" (click)="toggleActive(contact)">
                      <mat-icon>{{ contact.isActive ? 'visibility_off' : 'visibility' }}</mat-icon>
                      {{ contact.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                    <button mat-stroked-button type="button" (click)="startEdit(contact)">
                      <mat-icon>edit</mat-icon>
                      Edit
                    </button>
                    <button mat-icon-button color="warn" type="button" title="Delete" (click)="remove(contact.tenantContactId)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [panelStyles],
})
export class ContactsPanel implements OnInit {
  private readonly tenantClient = inject(TenantClient);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);

  @Input() tenantId?: number;

  readonly contactTypes = ['Email', 'Phone', 'WhatsApp', 'Social', 'Address'];

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly editing = signal<number | null>(null);
  readonly contacts = signal<TenantContactDto[]>([]);

  readonly form = this.fb.nonNullable.group({
    contactType: ['Email'],
    label: [''],
    value: ['', [Validators.required]],
    sortOrder: [0],
    isActive: [true],
    isPrimary: [false],
  });

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.tenantClient.getTenantContacts(this.tenantId).subscribe({
      next: (data) => { this.contacts.set(data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  startEdit(contact: TenantContactDto): void {
    this.editing.set(contact.tenantContactId);
    this.form.patchValue({
      contactType: contact.contactType,
      label: contact.label ?? '',
      value: contact.value,
      sortOrder: contact.sortOrder,
      isActive: contact.isActive,
      isPrimary: contact.isPrimary,
    });
  }

  resetForm(): void {
    this.editing.set(null);
    this.form.reset({ contactType: 'Email', label: '', value: '', sortOrder: 0, isActive: true, isPrimary: false });
  }

  save(): void {
    const raw = this.form.getRawValue();
    const body: SaveTenantContactRequest = {
      contactType: raw.contactType,
      label: raw.label?.trim() || undefined,
      value: (raw.value ?? '').trim(),
      isActive: raw.isActive,
      isPrimary: raw.isPrimary,
      sortOrder: Number(raw.sortOrder) || 0,
    };

    this.saving.set(true);
    const editingId = this.editing();
    const request = editingId != null
      ? this.tenantClient.updateTenantContact(editingId, body, this.tenantId)
      : this.tenantClient.createTenantContact(body, this.tenantId);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.notifications.success(editingId == null ? 'Contact added' : 'Contact updated');
        this.resetForm();
        this.loadContacts();
      },
      error: () => {
        this.saving.set(false);
        this.notifications.error('Failed to save contact');
      },
    });
  }

  setPrimary(id: number): void {
    this.tenantClient.setPrimaryTenantContact(id, this.tenantId).subscribe({
      next: () => { this.notifications.success('Primary contact updated'); this.loadContacts(); },
      error: () => this.notifications.error('Failed to update primary contact'),
    });
  }

  toggleActive(contact: TenantContactDto): void {
    this.tenantClient.setActiveTenantContact(contact.tenantContactId, !contact.isActive, this.tenantId).subscribe({
      next: () => { this.notifications.success('Contact status updated'); this.loadContacts(); },
      error: () => this.notifications.error('Failed to update contact status'),
    });
  }

  remove(id: number): void {
    this.tenantClient.deleteTenantContact(id, this.tenantId).subscribe({
      next: () => { this.notifications.success('Contact deleted'); this.loadContacts(); },
      error: () => this.notifications.error('Failed to delete contact'),
    });
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-feature-flags-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatDividerModule,
  ],
  template: `
    <div class="panel-card">
      <div class="panel-header">
        <h3>Navigation</h3>
        <p class="panel-subtitle">Choose which menu items members see in the app</p>
      </div>

      @if (loading()) {
        <div class="loading-inline">
          <mat-spinner diameter="32"></mat-spinner>
        </div>
      } @else {
        @if (groups().length === 0) {
          <div class="panel-empty">No feature flags configured</div>
        } @else {
          <div class="feature-flag-groups">
            @for (group of groups(); track group.name) {
              <div class="feature-flag-group">
                <p class="feature-flag-group-title">{{ group.name }}</p>
                <div class="feature-flag-list">
                  @for (flag of group.flags; track flag.featureCode) {
                    <div class="feature-flag-row">
                      <div class="flag-info">
                        <span class="flag-name">{{ flag.displayName }}</span>
                        @if (flag.description) {
                          <span class="flag-description">{{ flag.description }}</span>
                        }
                      </div>
                      <button mat-icon-button
                              type="button"
                              [class.flag-toggle-on]="flag.isEnabled"
                              [class.flag-toggle-off]="!flag.isEnabled"
                              [attr.aria-label]="'Toggle ' + flag.displayName"
                              title="{{ flag.isEnabled ? 'Enabled' : 'Disabled' }}"
                              (click)="toggle(flag)">
                        <mat-icon>{{ flag.isEnabled ? 'toggle_on' : 'toggle_off' }}</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [panelStyles + `
    .feature-flag-groups { display: flex; flex-direction: column; gap: 1.25rem; margin-top: 0.5rem; }
    .feature-flag-group-title {
      margin: 0 0 0.4rem; font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: #9e9e9e;
    }
    .feature-flag-list { display: flex; flex-direction: column; border: 1px solid #ececec; border-radius: 10px; overflow: hidden; }
    .feature-flag-row {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      padding: 0.65rem 0.9rem;
    }
    .feature-flag-row + .feature-flag-row { border-top: 1px solid #f2f2f2; }
    .flag-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .flag-name { font-weight: 600; font-size: 14px; color: #222; }
    .flag-description { color: #9e9e9e; font-size: 12px; }
    .flag-toggle-on { color: #2e7d32; }
    .flag-toggle-off { color: #bdbdbd; }
  `],
})
export class FeatureFlagsPanel implements OnInit {
  private readonly tenantClient = inject(TenantClient);
  private readonly notifications = inject(NotificationService);

  @Input() tenantId?: number;

  readonly loading = signal(true);
  readonly flags = signal<FeatureFlagDto[]>([]);
  readonly definitions = signal<FeatureFlagDefinitionDto[]>([]);

  readonly groups = computed(() => {
    const enabled = new Map(this.flags().map((f) => [f.featureCode, f.isEnabled]));
    const groups = new Map<string, { displayName: string; description?: string; featureCode: string; isEnabled: boolean }[]>();
    for (const def of this.definitions()) {
      const list = groups.get(def.category) ?? [];
      list.push({
        displayName: def.displayName,
        description: def.description ?? undefined,
        featureCode: def.featureCode,
        isEnabled: enabled.get(def.featureCode) ?? def.defaultEnabled,
      });
      groups.set(def.category, list);
    }
    return [...groups.entries()].map(([name, flags]) => ({ name, flags }));
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.tenantClient.getTenantFeatureFlagDefinitions(this.tenantId).subscribe({
      next: (definitions) => {
        this.definitions.set(definitions ?? []);
        this.tenantClient.getTenantFeatureFlags(this.tenantId).subscribe({
          next: (flags) => { this.flags.set(flags ?? []); this.loading.set(false); },
          error: () => this.loading.set(false),
        });
      },
      error: () => this.loading.set(false),
    });
  }

  toggle(flag: { featureCode: string; isEnabled: boolean }): void {
    const next = !flag.isEnabled;
    const updated = this.flags().map((f) =>
      f.featureCode === flag.featureCode ? { ...f, isEnabled: next } : f,
    );
    if (!updated.some((f) => f.featureCode === flag.featureCode)) {
      updated.push({ featureCode: flag.featureCode, isEnabled: next });
    }
    this.flags.set(updated);

    this.tenantClient.updateTenantFeatureFlags({ flags: updated }, this.tenantId).subscribe({
      next: (saved) => { this.flags.set(saved ?? updated); this.notifications.success('Navigation updated'); },
      error: () => { this.load(); this.notifications.error('Failed to update navigation'); },
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Landing Content Panel
// ─────────────────────────────────────────────────────────────────────────────

const SECTION_IDS = [
  'hero', 'banner', 'stats', 'features', 'howItWorks', 'profiles',
  'beforeafter', 'stories', 'whyChoose', 'trustedBy', 'communities',
  'events', 'testimonials', 'counters', 'appDownload', 'cta',
  'formHero', 'footer', 'navigation',
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-landing-content-panel',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatIconModule, MatButtonModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatInputModule, MatCardModule, MatDividerModule, MatCheckboxModule,
    MatSelectModule,
  ],
  template: `
    <div class="panel-card" style="max-width:860px">
      <div class="panel-header">
        <h3>Landing Page Content</h3>
        <p class="panel-subtitle">Customize every section's text, images, data arrays, visibility and order on the landing page</p>
      </div>

      @if (loading()) {
        <div class="loading-inline">
          <mat-spinner diameter="32"></mat-spinner>
        </div>
      } @else {
        <form [formGroup]="form" class="settings-form">

          <!-- ═══ 1. HERO ═══ -->
          <div class="section-toggle" (click)="toggleSection('hero')">
            <mat-icon>{{ expandedSections().has('hero') ? 'expand_less' : 'expand_more' }}</mat-icon>
            <strong>Hero Section</strong>
          </div>
          @if (expandedSections().has('hero')) {
            <div class="section-body">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Eyebrow Text</mat-label>
                <input matInput formControlName="eyebrow" />
                <mat-hint class="default-hint">From template (e.g. "Maharashtrian Matrimony")</mat-hint>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Hero Title</mat-label>
                <input matInput formControlName="heroTitle" />
                <mat-hint class="default-hint">From template (e.g. "Where Tradition Meets Lifelong Togetherness")</mat-hint>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Hero Subtitle</mat-label>
                <input matInput formControlName="heroSubtitle" />
                <mat-hint class="default-hint">From template</mat-hint>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Hero Description</mat-label>
                <textarea matInput formControlName="heroDescription" rows="3"></textarea>
                <mat-hint class="default-hint">From template</mat-hint>
              </mat-form-field>
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Hero Image URL</mat-label>
                  <input matInput formControlName="heroImageUrl" />
                  <mat-hint class="default-hint">Template uses Unsplash stock photos</mat-hint>
                </mat-form-field>
                <button mat-stroked-button type="button" [disabled]="uploading() !== null" (click)="heroInput.click()" style="margin-top:4px;align-self:flex-start">
                  <mat-icon>upload</mat-icon> {{ uploading() === 'hero' ? 'Uploading…' : 'Upload' }}
                </button>
                <input #heroInput type="file" accept="image/*" hidden (change)="onFileSelected($event, 'hero', 'heroImageUrl')" />
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Hero Image 2 URL</mat-label>
                  <input matInput formControlName="heroImageUrl2" />
                  <mat-hint class="default-hint">Template uses Unsplash stock photos</mat-hint>
                </mat-form-field>
                <button mat-stroked-button type="button" [disabled]="uploading() !== null" (click)="hero2Input.click()" style="margin-top:4px;align-self:flex-start">
                  <mat-icon>upload</mat-icon> {{ uploading() === 'hero2' ? 'Uploading…' : 'Upload' }}
                </button>
                <input #hero2Input type="file" accept="image/*" hidden (change)="onFileSelected($event, 'hero', 'heroImageUrl2')" />
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Banner Override Image URL</mat-label>
                  <input matInput formControlName="bannerOverrideImageUrl" />
                  <mat-hint class="default-hint">Template uses Unsplash stock photos</mat-hint>
                </mat-form-field>
                <button mat-stroked-button type="button" [disabled]="uploading() !== null" (click)="bannerInput.click()" style="margin-top:4px;align-self:flex-start">
                  <mat-icon>upload</mat-icon> {{ uploading() === 'banner' ? 'Uploading…' : 'Upload' }}
                </button>
                <input #bannerInput type="file" accept="image/*" hidden (change)="onFileSelected($event, 'banner', 'bannerOverrideImageUrl')" />
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Page Background Image URL</mat-label>
                  <input matInput formControlName="pageBackgroundImageUrl" />
                  <mat-hint class="default-hint">Template uses Unsplash stock photos</mat-hint>
                </mat-form-field>
                <button mat-stroked-button type="button" [disabled]="uploading() !== null" (click)="bgInput.click()" style="margin-top:4px;align-self:flex-start">
                  <mat-icon>upload</mat-icon> {{ uploading() === 'bg' ? 'Uploading…' : 'Upload' }}
                </button>
                <input #bgInput type="file" accept="image/*" hidden (change)="onFileSelected($event, 'hero', 'pageBackgroundImageUrl')" />
              </div>
            </div>
          }

          <!-- ═══ 2. BANNER (Registration CTA) ═══ -->
          <div class="section-toggle" (click)="toggleSection('banner')">
            <mat-icon>{{ expandedSections().has('banner') ? 'expand_less' : 'expand_more' }}</mat-icon>
            <strong>Banner / Registration CTA</strong>
          </div>
          @if (expandedSections().has('banner')) {
            <div class="section-body">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Eyebrow Text</mat-label>
                <input matInput formControlName="bannerEyebrow" />
                <mat-hint class="default-hint">Create a Free Matrimony Profile</mat-hint>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Banner Heading</mat-label>
                <input matInput formControlName="bannerHeading" />
                <mat-hint class="default-hint">50,000+ Successful Marriages &amp; Counting</mat-hint>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Banner Description</mat-label>
                <textarea matInput formControlName="bannerDescription" rows="3"></textarea>
                <mat-hint class="default-hint">Our community celebrates one new wedding every 15 minutes…</mat-hint>
              </mat-form-field>
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>CTA1 Label</mat-label>
                  <input matInput formControlName="bannerCta1" />
                  <mat-hint class="default-hint">Create Free Profile</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>CTA2 Label</mat-label>
                  <input matInput formControlName="bannerCta2" />
                  <mat-hint class="default-hint">Learn More</mat-hint>
                </mat-form-field>
              </div>
            </div>
          }

          <!-- ═══ 3. STATS ═══ -->
          <div class="section-toggle" (click)="toggleSection('stats')">
            <mat-icon>{{ expandedSections().has('stats') ? 'expand_less' : 'expand_more' }}</mat-icon>
            <strong>Stats Section</strong>
            <span class="section-badge">{{ statsArray.length }} items</span>
          </div>
          @if (expandedSections().has('stats')) {
            <div class="section-body">
              <div formArrayName="stats">
                @for (item of statsArray.controls; track $index; let i = $index) {
                  <div [formGroupName]="i" class="array-row">
                    <mat-form-field appearance="outline" class="third-width">
                      <mat-label>Value</mat-label>
                      <input matInput formControlName="value" />
                      <mat-hint class="default-hint">50,000+</mat-hint>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Label</mat-label>
                      <input matInput formControlName="label" />
                      <mat-hint class="default-hint">Verified Brides</mat-hint>
                    </mat-form-field>
                    <button mat-icon-button color="warn" type="button" (click)="removeArrayItem('stats', i)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                }
              </div>
              <button mat-stroked-button type="button" (click)="addArrayItem('stats', { value: '', label: '' })">
                <mat-icon>add</mat-icon> Add Stat
              </button>
            </div>
          }

          <!-- ═══ 4. FEATURES ═══ -->
          <div class="section-toggle" (click)="toggleSection('features')">
            <mat-icon>{{ expandedSections().has('features') ? 'expand_less' : 'expand_more' }}</mat-icon>
            <strong>Features Section</strong>
            <span class="section-badge">{{ featuresArray.length }} items</span>
          </div>
          @if (expandedSections().has('features')) {
            <div class="section-body">
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Eyebrow Text</mat-label>
                  <input matInput formControlName="featuresEyebrow" />
                  <mat-hint class="default-hint">Why Marathi Families Trust Us</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Section Title</mat-label>
                  <input matInput formControlName="featuresTitle" />
                  <mat-hint class="default-hint">Matrimony the Way It Should Be</mat-hint>
                </mat-form-field>
              </div>
              <div formArrayName="features">
                @for (item of featuresArray.controls; track $index; let i = $index) {
                  <div [formGroupName]="i" class="array-row">
                    <mat-form-field appearance="outline" class="third-width">
                      <mat-label>Icon</mat-label>
                      <input matInput formControlName="icon" />
                      <mat-hint class="default-hint">scroll-text</mat-hint>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Title</mat-label>
                      <input matInput formControlName="title" />
                      <mat-hint class="default-hint">Horoscope Matching</mat-hint>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Text</mat-label>
                      <textarea matInput formControlName="text" rows="2"></textarea>
                      <mat-hint class="default-hint">Kundali matching done by experienced pandits…</mat-hint>
                    </mat-form-field>
                    <button mat-icon-button color="warn" type="button" (click)="removeArrayItem('features', i)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                }
              </div>
              <button mat-stroked-button type="button" (click)="addArrayItem('features', { icon: '', title: '', text: '' })">
                <mat-icon>add</mat-icon> Add Feature
              </button>
            </div>
          }

          <!-- ═══ 5. HOW IT WORKS ═══ -->
          <div class="section-toggle" (click)="toggleSection('howItWorks')">
            <mat-icon>{{ expandedSections().has('howItWorks') ? 'expand_less' : 'expand_more' }}</mat-icon>
            <strong>How It Works</strong>
            <span class="section-badge">{{ stepsArray.length }} steps</span>
          </div>
          @if (expandedSections().has('howItWorks')) {
            <div class="section-body">
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Eyebrow Text</mat-label>
                  <input matInput formControlName="howEyebrow" />
                  <mat-hint class="default-hint">How It Works</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Section Title</mat-label>
                  <input matInput formControlName="howTitle" />
                  <mat-hint class="default-hint">Three Simple Steps to Your Match</mat-hint>
                </mat-form-field>
              </div>
              <div formArrayName="steps">
                @for (item of stepsArray.controls; track $index; let i = $index) {
                  <div [formGroupName]="i" class="array-row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Title</mat-label>
                      <input matInput formControlName="title" />
                      <mat-hint class="default-hint">Register the Family</mat-hint>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Description</mat-label>
                      <textarea matInput formControlName="text" rows="2"></textarea>
                      <mat-hint class="default-hint">Create a family profile with photos…</mat-hint>
                    </mat-form-field>
                    <button mat-icon-button color="warn" type="button" (click)="removeArrayItem('steps', i)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                }
              </div>
              <button mat-stroked-button type="button" (click)="addArrayItem('steps', { title: '', text: '' })">
                <mat-icon>add</mat-icon> Add Step
              </button>
            </div>
          }

          <!-- ═══ 6. PROFILES ═══ -->
          <div class="section-toggle" (click)="toggleSection('profiles')">
            <mat-icon>{{ expandedSections().has('profiles') ? 'expand_less' : 'expand_more' }}</mat-icon>
            <strong>Profiles Section</strong>
          </div>
          @if (expandedSections().has('profiles')) {
            <div class="section-body">
              <div class="form-row">
                <mat-form-field appearance="outline" class="third-width">
                  <mat-label>Eyebrow Text</mat-label>
                  <input matInput formControlName="profilesEyebrow" />
                  <mat-hint class="default-hint">Freshly Joined Members</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" class="third-width">
                  <mat-label>Section Title</mat-label>
                  <input matInput formControlName="profilesTitle" />
                  <mat-hint class="default-hint">Recently Added Profiles</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" class="third-width">
                  <mat-label>View All Label</mat-label>
                  <input matInput formControlName="profilesViewAll" />
                  <mat-hint class="default-hint">View all profiles</mat-hint>
                </mat-form-field>
              </div>
            </div>
          }

          <!-- ═══ 7. BEFORE/AFTER ═══ -->
          <div class="section-toggle" (click)="toggleSection('beforeafter')">
            <mat-icon>{{ expandedSections().has('beforeafter') ? 'expand_less' : 'expand_more' }}</mat-icon>
            <strong>Before / After Section</strong>
          </div>
          @if (expandedSections().has('beforeafter')) {
            <div class="section-body">
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Eyebrow Text</mat-label>
                  <input matInput formControlName="beforeAfterEyebrow" />
                  <mat-hint class="default-hint">Before &amp; After</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Section Title</mat-label>
                  <input matInput formControlName="beforeAfterTitle" />
                  <mat-hint class="default-hint">Transform Your Story</mat-hint>
                </mat-form-field>
              </div>
            </div>
          }

          <!-- ═══ 8. SUCCESS STORIES ═══ -->
          <div class="section-toggle" (click)="toggleSection('stories')">
            <mat-icon>{{ expandedSections().has('stories') ? 'expand_less' : 'expand_more' }}</mat-icon>
            <strong>Success Stories</strong>
            <span class="section-badge">{{ storiesArray.length }} stories</span>
          </div>
          @if (expandedSections().has('stories')) {
            <div class="section-body">
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Eyebrow Text</mat-label>
                  <input matInput formControlName="storiesEyebrow" />
                  <mat-hint class="default-hint">Success Stories</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Section Title</mat-label>
                  <input matInput formControlName="storiesTitle" />
                  <mat-hint class="default-hint">A Thousand Happy Beginnings</mat-hint>
                </mat-form-field>
              </div>
              <div formArrayName="stories">
                @for (item of storiesArray.controls; track $index; let i = $index) {
                  <div [formGroupName]="i" class="array-row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Name</mat-label>
                      <input matInput formControlName="name" />
                      <mat-hint class="default-hint">Sunita &amp; Rajesh Deshpande</mat-hint>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="third-width">
                      <mat-label>Meta</mat-label>
                      <input matInput formControlName="meta" />
                      <mat-hint class="default-hint">Married Nov 2025 · Pune</mat-hint>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Quote</mat-label>
                      <textarea matInput formControlName="quote" rows="2"></textarea>
                      <mat-hint class="default-hint">Our families connected within two weeks…</mat-hint>
                    </mat-form-field>
                    <button mat-icon-button color="warn" type="button" (click)="removeArrayItem('stories', i)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                }
              </div>
              <button mat-stroked-button type="button" (click)="addArrayItem('stories', { name: '', meta: '', quote: '', image: 0 })">
                <mat-icon>add</mat-icon> Add Story
              </button>
            </div>
          }

          <!-- ═══ 9. WHY CHOOSE ═══ -->
          <div class="section-toggle" (click)="toggleSection('whyChoose')">
            <mat-icon>{{ expandedSections().has('whyChoose') ? 'expand_less' : 'expand_more' }}</mat-icon>
            <strong>Why Choose Us</strong>
            <span class="section-badge">{{ whyItemsArray.length }} items</span>
          </div>
          @if (expandedSections().has('whyChoose')) {
            <div class="section-body">
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Eyebrow Text</mat-label>
                  <input matInput formControlName="whyEyebrow" />
                  <mat-hint class="default-hint">Why Choose Us</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Section Title</mat-label>
                  <input matInput formControlName="whyTitle" />
                  <mat-hint class="default-hint">Trusted by Families, Powered by Technology</mat-hint>
                </mat-form-field>
              </div>
              <div formArrayName="whyItems">
                @for (item of whyItemsArray.controls; track $index; let i = $index) {
                  <div [formGroupName]="i" class="array-row">
                    <mat-form-field appearance="outline" class="third-width">
                      <mat-label>Icon</mat-label>
                      <input matInput formControlName="icon" />
                      <mat-hint class="default-hint">sparkles</mat-hint>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Title</mat-label>
                      <input matInput formControlName="title" />
                      <mat-hint class="default-hint">AI-Powered Matching</mat-hint>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Text</mat-label>
                      <textarea matInput formControlName="text" rows="2"></textarea>
                      <mat-hint class="default-hint">Smart algorithms learn your family's preferences…</mat-hint>
                    </mat-form-field>
                    <button mat-icon-button color="warn" type="button" (click)="removeArrayItem('whyItems', i)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                }
              </div>
              <button mat-stroked-button type="button" (click)="addArrayItem('whyItems', { icon: '', title: '', text: '' })">
                <mat-icon>add</mat-icon> Add Item
              </button>
            </div>
          }

          <!-- ═══ 10. TRUSTED BY ═══ -->
          <div class="section-toggle" (click)="toggleSection('trustedBy')">
            <mat-icon>{{ expandedSections().has('trustedBy') ? 'expand_less' : 'expand_more' }}</mat-icon>
            <strong>Trusted By</strong>
            <span class="section-badge">{{ trustItemsArray.length }} items</span>
          </div>
          @if (expandedSections().has('trustedBy')) {
            <div class="section-body">
              <div formArrayName="trustItems">
                @for (item of trustItemsArray.controls; track $index; let i = $index) {
                  <div [formGroupName]="i" class="array-row">
                    <mat-form-field appearance="outline" class="third-width">
                      <mat-label>Icon</mat-label>
                      <input matInput formControlName="icon" />
                      <mat-hint class="default-hint">badge-check</mat-hint>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Title</mat-label>
                      <input matInput formControlName="title" />
                      <mat-hint class="default-hint">100% Verified Profiles</mat-hint>
                    </mat-form-field>
                    <button mat-icon-button color="warn" type="button" (click)="removeArrayItem('trustItems', i)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                }
              </div>
              <button mat-stroked-button type="button" (click)="addArrayItem('trustItems', { icon: '', title: '' })">
                <mat-icon>add</mat-icon> Add Trust Item
              </button>
            </div>
          }

          <!-- ═══ 11. COMMUNITIES ═══ -->
          <div class="section-toggle" (click)="toggleSection('communities')">
            <mat-icon>{{ expandedSections().has('communities') ? 'expand_less' : 'expand_more' }}</mat-icon>
            <strong>Communities</strong>
            <span class="section-badge">{{ communitiesArray.length }} names</span>
          </div>
          @if (expandedSections().has('communities')) {
            <div class="section-body">
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Eyebrow Text</mat-label>
                  <input matInput formControlName="casteEyebrow" />
                  <mat-hint class="default-hint">Communities We Serve</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Section Title</mat-label>
                  <input matInput formControlName="casteTitle" />
                  <mat-hint class="default-hint">200+ Marathi Castes &amp; Communities</mat-hint>
                </mat-form-field>
              </div>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Section Note</mat-label>
                <textarea matInput formControlName="casteNote" rows="2"></textarea>
                <mat-hint class="default-hint">From Brahmin to Kshatriya and every community in between…</mat-hint>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Community Names (one per line)</mat-label>
                <textarea matInput formControlName="communitiesText" rows="8"></textarea>
                <mat-hint class="default-hint">Deshastha Brahmin, 96 Kuli Maratha, CKP, Agri…</mat-hint>
              </mat-form-field>
            </div>
          }

          <!-- ═══ 12. EVENTS ═══ -->
          <div class="section-toggle" (click)="toggleSection('events')">
            <mat-icon>{{ expandedSections().has('events') ? 'expand_less' : 'expand_more' }}</mat-icon>
            <strong>Upcoming Events</strong>
            <span class="section-badge">{{ eventsArray.length }} events</span>
          </div>
          @if (expandedSections().has('events')) {
            <div class="section-body">
              <div class="form-row">
                <mat-form-field appearance="outline" class="third-width">
                  <mat-label>Eyebrow Text</mat-label>
                  <input matInput formControlName="melavaEyebrow" />
                  <mat-hint class="default-hint">Melava &amp; Events</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" class="third-width">
                  <mat-label>Section Title</mat-label>
                  <input matInput formControlName="melavaTitle" />
                  <mat-hint class="default-hint">Meet Families In Person</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" class="third-width">
                  <mat-label>Event Tag Label</mat-label>
                  <input matInput formControlName="melavaViewLabel" />
                  <mat-hint class="default-hint">View details</mat-hint>
                </mat-form-field>
              </div>
              <div formArrayName="events">
                @for (item of eventsArray.controls; track $index; let i = $index) {
                  <div [formGroupName]="i" class="array-row">
                    <mat-form-field appearance="outline" class="third-width">
                      <mat-label>Day</mat-label>
                      <input matInput formControlName="day" />
                      <mat-hint class="default-hint">8</mat-hint>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="third-width">
                      <mat-label>Month</mat-label>
                      <input matInput formControlName="month" />
                      <mat-hint class="default-hint">Aug</mat-hint>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Title</mat-label>
                      <input matInput formControlName="title" />
                      <mat-hint class="default-hint">Shubh Aarambh (Marathi)</mat-hint>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Place</mat-label>
                      <input matInput formControlName="place" />
                      <mat-hint class="default-hint">Pune · Vadhu-var meetup for all castes</mat-hint>
                    </mat-form-field>
                    <button mat-icon-button color="warn" type="button" (click)="removeArrayItem('events', i)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                }
              </div>
              <button mat-stroked-button type="button" (click)="addArrayItem('events', { day: '', month: '', title: '', place: '' })">
                <mat-icon>add</mat-icon> Add Event
              </button>
            </div>
          }

          <!-- ═══ 13. TESTIMONIALS ═══ -->
          <div class="section-toggle" (click)="toggleSection('testimonials')">
            <mat-icon>{{ expandedSections().has('testimonials') ? 'expand_less' : 'expand_more' }}</mat-icon>
            <strong>Testimonials</strong>
          </div>
          @if (expandedSections().has('testimonials')) {
            <div class="section-body">
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Eyebrow Text</mat-label>
                  <input matInput formControlName="testimonialsEyebrow" />
                  <mat-hint class="default-hint">What Families Say</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Section Title</mat-label>
                  <input matInput formControlName="testimonialsTitle" />
                  <mat-hint class="default-hint">Testimonials from Happy Families</mat-hint>
                </mat-form-field>
              </div>
            </div>
          }

          <!-- ═══ 14. COUNTERS ═══ -->
          <div class="section-toggle" (click)="toggleSection('counters')">
            <mat-icon>{{ expandedSections().has('counters') ? 'expand_less' : 'expand_more' }}</mat-icon>
            <strong>Counters</strong>
          </div>
          @if (expandedSections().has('counters')) {
            <div class="section-body">
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Eyebrow Text</mat-label>
                  <input matInput formControlName="countersEyebrow" />
                  <mat-hint class="default-hint">By the Numbers</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Section Title</mat-label>
                  <input matInput formControlName="countersTitle" />
                  <mat-hint class="default-hint">Our Journey in Numbers</mat-hint>
                </mat-form-field>
              </div>
            </div>
          }

          <!-- ═══ 15. APP DOWNLOAD ═══ -->
          <div class="section-toggle" (click)="toggleSection('appDownload')">
            <mat-icon>{{ expandedSections().has('appDownload') ? 'expand_less' : 'expand_more' }}</mat-icon>
            <strong>App Download Section</strong>
          </div>
          @if (expandedSections().has('appDownload')) {
            <div class="section-body">
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Eyebrow Text</mat-label>
                  <input matInput formControlName="appEyebrow" />
                  <mat-hint class="default-hint">Download the App</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Section Title</mat-label>
                  <input matInput formControlName="appTitle" />
                  <mat-hint class="default-hint">Find Your Match in 30 Seconds</mat-hint>
                </mat-form-field>
              </div>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="appDescription" rows="3"></textarea>
                <mat-hint class="default-hint">Fast, simple and delightful. The most loved Marathi matrimony app…</mat-hint>
              </mat-form-field>
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Rating Text</mat-label>
                  <input matInput formControlName="appRating" />
                  <mat-hint class="default-hint">4.3 · 10M+ Downloads</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Review Note</mat-label>
                  <input matInput formControlName="appReviewNote" />
                  <mat-hint class="default-hint">Based on customer reviews</mat-hint>
                </mat-form-field>
              </div>
            </div>
          }

          <!-- ═══ 16. CTA ═══ -->
          <div class="section-toggle" (click)="toggleSection('cta')">
            <mat-icon>{{ expandedSections().has('cta') ? 'expand_less' : 'expand_more' }}</mat-icon>
            <strong>Call to Action &amp; App Links</strong>
          </div>
          @if (expandedSections().has('cta')) {
            <div class="section-body">
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Login Button Text</mat-label>
                  <input matInput formControlName="ctaLogin" />
                  <mat-hint class="default-hint">Login</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Enroll Button Text</mat-label>
                  <input matInput formControlName="ctaEnroll" />
                  <mat-hint class="default-hint">Register Free</mat-hint>
                </mat-form-field>
              </div>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>CTA Heading</mat-label>
                <input matInput formControlName="ctaHeading" />
                <mat-hint class="default-hint">Your Family's Search Ends Here</mat-hint>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>CTA Description</mat-label>
                <textarea matInput formControlName="ctaDescription" rows="2"></textarea>
                <mat-hint class="default-hint">Join thousands of families who found their perfect match…</mat-hint>
              </mat-form-field>
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Sticky Bar Text</mat-label>
                  <input matInput formControlName="stickyBarText" />
                  <mat-hint class="default-hint">Find your perfect match today</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Sticky Bar CTA</mat-label>
                  <input matInput formControlName="stickyBarCta" />
                  <mat-hint class="default-hint">Register Free</mat-hint>
                </mat-form-field>
              </div>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Talk to Advisor Label</mat-label>
                <input matInput formControlName="ctaAdvisorLabel" />
                <mat-hint class="default-hint">Talk to an Advisor</mat-hint>
              </mat-form-field>
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>App Store URL</mat-label>
                  <input matInput formControlName="appStoreUrl" />
                  <mat-hint class="default-hint">No default — optional Apple App Store link</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Play Store URL</mat-label>
                  <input matInput formControlName="playStoreUrl" />
                  <mat-hint class="default-hint">No default — optional Google Play link</mat-hint>
                </mat-form-field>
              </div>
            </div>
          }

          <!-- ═══ 17. FORM HERO ═══ -->
          <div class="section-toggle" (click)="toggleSection('formHero')">
            <mat-icon>{{ expandedSections().has('formHero') ? 'expand_less' : 'expand_more' }}</mat-icon>
            <strong>Form Hero Section</strong>
          </div>
          @if (expandedSections().has('formHero')) {
            <div class="section-body">
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Form Title</mat-label>
                  <input matInput formControlName="formTitle" />
                  <mat-hint class="default-hint">Create Free Matrimony Profile</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Form Subtitle</mat-label>
                  <input matInput formControlName="formSubtitle" />
                  <mat-hint class="default-hint">Join lakhs of happy Marathi families. Free forever.</mat-hint>
                </mat-form-field>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline" class="third-width">
                  <mat-label>Bride Label</mat-label>
                  <input matInput formControlName="formBrideLabel" />
                  <mat-hint class="default-hint">Bride</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" class="third-width">
                  <mat-label>Groom Label</mat-label>
                  <input matInput formControlName="formGroomLabel" />
                  <mat-hint class="default-hint">Groom</mat-hint>
                </mat-form-field>
                <mat-form-field appearance="outline" class="third-width">
                  <mat-label>Looking For Label</mat-label>
                  <input matInput formControlName="formLookingForLabel" />
                  <mat-hint class="default-hint">Looking for</mat-hint>
                </mat-form-field>
              </div>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Caste Label</mat-label>
                <input matInput formControlName="formCasteLabel" />
                <mat-hint class="default-hint">Caste / Community</mat-hint>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Communities (one per line)</mat-label>
                <textarea matInput formControlName="formCommunitiesText" rows="4"></textarea>
                <mat-hint class="default-hint">Any Marathi community, Maratha / 96 Kuli, Deshastha Brahmin, CKP</mat-hint>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Mini Stats (JSON array)</mat-label>
                <textarea matInput formControlName="formMiniStatsText" rows="3"></textarea>
                <mat-hint class="default-hint">JSON array, e.g. value "5L+" label "Happy Stories", value "350L+" label "Members", value "100%" label "Mobile-verified"</mat-hint>
              </mat-form-field>
            </div>
          }

          <!-- ═══ 18. FOOTER ═══ -->
          <div class="section-toggle" (click)="toggleSection('footer')">
            <mat-icon>{{ expandedSections().has('footer') ? 'expand_less' : 'expand_more' }}</mat-icon>
            <strong>Footer</strong>
          </div>
          @if (expandedSections().has('footer')) {
            <div class="section-body">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Footer Description</mat-label>
                <textarea matInput formControlName="footerDescription" rows="3"></textarea>
                <mat-hint class="default-hint">The trusted matrimony platform weaving families together…</mat-hint>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Copyright Text</mat-label>
                <input matInput formControlName="copyrightText" />
                <mat-hint class="default-hint">Auto-generated: copyright symbol 2026 plus tenant name</mat-hint>
              </mat-form-field>
            </div>
          }

          <!-- ═══ 19. NAVIGATION ═══ -->
          <div class="section-toggle" (click)="toggleSection('navigation')">
            <mat-icon>{{ expandedSections().has('navigation') ? 'expand_less' : 'expand_more' }}</mat-icon>
            <strong>Navigation Links</strong>
            <span class="section-badge">{{ navLinksArray.length }} links</span>
          </div>
          @if (expandedSections().has('navigation')) {
            <div class="section-body">
              <div formArrayName="navLinks">
                @for (item of navLinksArray.controls; track $index; let i = $index) {
                  <div [formGroupName]="i" class="array-row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Label</mat-label>
                      <input matInput formControlName="label" />
                      <mat-hint class="default-hint">About Us</mat-hint>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>URL / Hash</mat-label>
                      <input matInput formControlName="href" />
                      <mat-hint class="default-hint">#about</mat-hint>
                    </mat-form-field>
                    <button mat-icon-button color="warn" type="button" (click)="removeArrayItem('navLinks', i)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                }
              </div>
              <button mat-stroked-button type="button" (click)="addArrayItem('navLinks', { label: '', href: '' })">
                <mat-icon>add</mat-icon> Add Link
              </button>
            </div>
          }

          <!-- ═══ 20. SECTION ORDER & VISIBILITY ═══ -->
          <div class="section-toggle" (click)="toggleSection('sectionOrder')">
            <mat-icon>{{ expandedSections().has('sectionOrder') ? 'expand_less' : 'expand_more' }}</mat-icon>
            <strong>Section Order &amp; Visibility</strong>
          </div>
          @if (expandedSections().has('sectionOrder')) {
            <div class="section-body">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Section Order (comma-separated IDs)</mat-label>
                <input matInput formControlName="sectionOrderText" />
                <mat-hint class="default-hint">banner,stats,features,howItWorks,profiles,beforeafter,stories,whyChoose,trustedBy,communities,events,testimonials,counters,appDownload,cta,formHero</mat-hint>
              </mat-form-field>
              <div formGroupName="sectionVisibility">
                <div class="section-title">Section Visibility</div>
                @for (sid of sectionIds; track sid) {
                  <div class="toggle-row">
                    <div class="toggle-label">{{ sid }}</div>
                    <mat-checkbox [formControlName]="sid"></mat-checkbox>
                  </div>
                }
              </div>
            </div>
          }

          <mat-divider></mat-divider>

          <div class="form-actions">
            <button mat-flat-button color="primary" [disabled]="saving() || form.invalid" (click)="save()">
              <mat-icon>save</mat-icon>
              Save Landing Content
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [panelStyles + `
    .section-toggle {
      display: flex; align-items: center; gap: 8px; padding: 12px 0; cursor: pointer;
      border-bottom: 1px solid #f0f0f0; user-select: none;
    }
    .section-toggle:hover { background: #fafafa; }
    .section-toggle strong { flex: 1; font-size: 14px; }
    .section-badge {
      font-size: 11px; background: #e8eaf6; color: #3949ab; padding: 2px 8px;
      border-radius: 9999px; font-weight: 600;
    }
    .section-body { padding: 12px 0 16px; }
    .array-row {
      display: flex; flex-wrap: wrap; align-items: flex-start; gap: 4px;
      margin-bottom: 8px; padding: 8px; border: 1px solid #f0f0f0; border-radius: 8px;
    }
    .array-row mat-form-field { margin-bottom: 0; }
  `],
})
export class LandingContentPanel implements OnInit {
  private readonly tenantClient = inject(TenantClient);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);

  @Input() tenantId?: number;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly uploading = signal<string | null>(null);
  readonly expandedSections = signal(new Set<string>(['hero']));
  readonly sectionIds = SECTION_IDS;

  readonly form = this.fb.nonNullable.group({
    eyebrow: [''],
    heroTitle: [''],
    heroSubtitle: [''],
    heroDescription: [''],
    heroImageUrl: [''],
    heroImageUrl2: [''],
    bannerOverrideImageUrl: [''],
    pageBackgroundImageUrl: [''],
    ctaLogin: [''],
    ctaEnroll: [''],
    ctaHeading: [''],
    ctaDescription: [''],
    stickyBarText: [''],
    stickyBarCta: [''],
    appStoreUrl: [''],
    playStoreUrl: [''],
    // Section headings — Banner
    bannerEyebrow: [''],
    bannerHeading: [''],
    bannerDescription: [''],
    bannerCta1: [''],
    bannerCta2: [''],
    // Section headings — Features
    featuresEyebrow: [''],
    featuresTitle: [''],
    // Section headings — How It Works
    howEyebrow: [''],
    howTitle: [''],
    // Section headings — Profiles
    profilesEyebrow: [''],
    profilesTitle: [''],
    profilesViewAll: [''],
    // Section headings — Success Stories
    storiesEyebrow: [''],
    storiesTitle: [''],
    // Section headings — CTA
    ctaAdvisorLabel: [''],
    // Section headings — Why Choose
    whyEyebrow: [''],
    whyTitle: [''],
    // Section headings — Communities
    casteEyebrow: [''],
    casteTitle: [''],
    casteNote: [''],
    // Section headings — Events
    melavaEyebrow: [''],
    melavaTitle: [''],
    melavaViewLabel: [''],
    // Section headings — App Download
    appEyebrow: [''],
    appTitle: [''],
    appDescription: [''],
    appRating: [''],
    appReviewNote: [''],
    // Section headings — Testimonials
    testimonialsEyebrow: [''],
    testimonialsTitle: [''],
    // Section headings — Counters
    countersEyebrow: [''],
    countersTitle: [''],
    // Section headings — Before/After
    beforeAfterEyebrow: [''],
    beforeAfterTitle: [''],
    // Form hero
    formTitle: [''],
    formSubtitle: [''],
    formBrideLabel: [''],
    formGroomLabel: [''],
    formLookingForLabel: [''],
    formCasteLabel: [''],
    formCommunitiesText: [''],
    formMiniStatsText: [''],
    stats: this.fb.array<FormGroup>([]),
    features: this.fb.array<FormGroup>([]),
    steps: this.fb.array<FormGroup>([]),
    stories: this.fb.array<FormGroup>([]),
    whyItems: this.fb.array<FormGroup>([]),
    trustItems: this.fb.array<FormGroup>([]),
    communitiesText: [''],
    events: this.fb.array<FormGroup>([]),
    footerDescription: [''],
    copyrightText: [''],
    navLinks: this.fb.array<FormGroup>([]),
    sectionOrderText: [''],
    sectionVisibility: this.fb.group({
      hero: [true],
      stats: [true],
      features: [true],
      howItWorks: [true],
      stories: [true],
      whyChoose: [true],
      trustedBy: [true],
      communities: [true],
      events: [true],
      cta: [true],
      banner: [true],
      profiles: [true],
      appDownload: [true],
      testimonials: [true],
      counters: [true],
      beforeafter: [true],
      formHero: [true],
      footer: [true],
      navigation: [true],
    }),
  });

  get statsArray() { return this.form.get('stats') as FormArray; }
  get featuresArray() { return this.form.get('features') as FormArray; }
  get stepsArray() { return this.form.get('steps') as FormArray; }
  get storiesArray() { return this.form.get('stories') as FormArray; }
  get whyItemsArray() { return this.form.get('whyItems') as FormArray; }
  get trustItemsArray() { return this.form.get('trustItems') as FormArray; }
  get eventsArray() { return this.form.get('events') as FormArray; }
  get navLinksArray() { return this.form.get('navLinks') as FormArray; }
  get communitiesArray(): string[] {
    const raw = this.form.get('communitiesText')?.value || '';
    return raw.split('\n').map((s: string) => s.trim()).filter(Boolean);
  }

  toggleSection(id: string): void {
    this.expandedSections.update(set => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  addArrayItem(field: string, defaults: Record<string, any>): void {
    const arr = this.form.get(field) as FormArray;
    arr.push(this.fb.group(defaults));
  }

  removeArrayItem(field: string, index: number): void {
    const arr = this.form.get(field) as FormArray;
    arr.removeAt(index);
  }

  ngOnInit(): void {
    this.tenantClient.getTenantBranding(this.tenantId).subscribe({
      next: (data) => {
        if (data?.landingContentJson) {
          try {
            const lc = JSON.parse(data.landingContentJson);
            this.patchArray('stats', lc.stats, ['value', 'label']);
            this.patchArray('features', lc.features, ['icon', 'title', 'text']);
            this.patchArray('steps', lc.steps, ['title', 'text']);
            this.patchArray('stories', lc.stories, ['name', 'meta', 'quote', 'image']);
            this.patchArray('whyItems', lc.whyItems, ['icon', 'title', 'text']);
            this.patchArray('trustItems', lc.trustItems, ['icon', 'title']);
            this.patchArray('events', lc.events, ['day', 'month', 'title', 'place']);
            this.patchArray('navLinks', lc.navLinks, ['label', 'href']);

            const vis = lc.sectionVisibility || {};
            this.form.patchValue({
              eyebrow: lc.eyebrow ?? '',
              heroTitle: lc.heroTitle ?? '',
              heroSubtitle: lc.heroSubtitle ?? '',
              heroDescription: lc.heroDescription ?? '',
              heroImageUrl: lc.heroImageUrl ?? '',
              heroImageUrl2: lc.heroImageUrl2 ?? '',
              bannerOverrideImageUrl: lc.bannerOverrideImageUrl ?? '',
              pageBackgroundImageUrl: lc.pageBackgroundImageUrl ?? '',
              ctaLogin: lc.ctaLogin ?? '',
              ctaEnroll: lc.ctaEnroll ?? '',
              ctaHeading: lc.ctaHeading ?? '',
              ctaDescription: lc.ctaDescription ?? '',
              stickyBarText: lc.stickyBarText ?? '',
              stickyBarCta: lc.stickyBarCta ?? '',
              appStoreUrl: lc.appStoreUrl ?? '',
              playStoreUrl: lc.playStoreUrl ?? '',
              // Section headings — Banner
              bannerEyebrow: lc.bannerEyebrow ?? '',
              bannerHeading: lc.bannerHeading ?? '',
              bannerDescription: lc.bannerDescription ?? '',
              bannerCta1: lc.bannerCta1 ?? '',
              bannerCta2: lc.bannerCta2 ?? '',
              // Section headings — Features
              featuresEyebrow: lc.featuresEyebrow ?? '',
              featuresTitle: lc.featuresTitle ?? '',
              // Section headings — How It Works
              howEyebrow: lc.howEyebrow ?? '',
              howTitle: lc.howTitle ?? '',
              // Section headings — Profiles
              profilesEyebrow: lc.profilesEyebrow ?? '',
              profilesTitle: lc.profilesTitle ?? '',
              profilesViewAll: lc.profilesViewAll ?? '',
              // Section headings — Success Stories
              storiesEyebrow: lc.storiesEyebrow ?? '',
              storiesTitle: lc.storiesTitle ?? '',
              // Section headings — CTA
              ctaAdvisorLabel: lc.ctaAdvisorLabel ?? '',
              // Section headings — Why Choose
              whyEyebrow: lc.whyEyebrow ?? '',
              whyTitle: lc.whyTitle ?? '',
              // Section headings — Communities
              casteEyebrow: lc.casteEyebrow ?? '',
              casteTitle: lc.casteTitle ?? '',
              casteNote: lc.casteNote ?? '',
              // Section headings — Events
              melavaEyebrow: lc.melavaEyebrow ?? '',
              melavaTitle: lc.melavaTitle ?? '',
              melavaViewLabel: lc.melavaViewLabel ?? '',
              // Section headings — App Download
              appEyebrow: lc.appEyebrow ?? '',
              appTitle: lc.appTitle ?? '',
              appDescription: lc.appDescription ?? '',
              appRating: lc.appRating ?? '',
              appReviewNote: lc.appReviewNote ?? '',
              // Section headings — Testimonials
              testimonialsEyebrow: lc.testimonialsEyebrow ?? '',
              testimonialsTitle: lc.testimonialsTitle ?? '',
              // Section headings — Counters
              countersEyebrow: lc.countersEyebrow ?? '',
              countersTitle: lc.countersTitle ?? '',
              // Section headings — Before/After
              beforeAfterEyebrow: lc.beforeAfterEyebrow ?? '',
              beforeAfterTitle: lc.beforeAfterTitle ?? '',
              // Form hero
              formTitle: lc.formTitle ?? '',
              formSubtitle: lc.formSubtitle ?? '',
              formBrideLabel: lc.formBrideLabel ?? '',
              formGroomLabel: lc.formGroomLabel ?? '',
              formLookingForLabel: lc.formLookingForLabel ?? '',
              formCasteLabel: lc.formCasteLabel ?? '',
              formCommunitiesText: (lc.formCommunities ?? []).join('\n'),
              formMiniStatsText: lc.formMiniStats ? JSON.stringify(lc.formMiniStats) : '',
              communitiesText: (lc.communities ?? []).join('\n'),
              footerDescription: lc.footerDescription ?? '',
              copyrightText: lc.copyrightText ?? '',
              sectionOrderText: (lc.sectionOrder ?? SECTION_IDS).join(','),
              sectionVisibility: {
                hero: vis.hero ?? true,
                stats: vis.stats ?? true,
                features: vis.features ?? true,
                howItWorks: vis.howItWorks ?? true,
                stories: vis.stories ?? true,
                whyChoose: vis.whyChoose ?? true,
                trustedBy: vis.trustedBy ?? true,
                communities: vis.communities ?? true,
                events: vis.events ?? true,
                cta: vis.cta ?? true,
                banner: vis.banner ?? true,
                profiles: vis.profiles ?? true,
                appDownload: vis.appDownload ?? true,
                testimonials: vis.testimonials ?? true,
                counters: vis.counters ?? true,
                beforeafter: vis.beforeafter ?? true,
                formHero: vis.formHero ?? true,
                footer: vis.footer ?? true,
                navigation: vis.navigation ?? true,
              },
            });
          } catch {}
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private patchArray(field: string, items: any[] | undefined, keys: string[]): void {
    if (!items?.length) return;
    const arr = this.form.get(field) as FormArray;
    arr.clear();
    for (const item of items) {
      const group: Record<string, any> = {};
      for (const k of keys) group[k] = item[k] ?? (k === 'image' ? 0 : '');
      arr.push(this.fb.group(group));
    }
  }

  onFileSelected(event: Event, kind: 'logo' | 'hero' | 'banner' | 'favicon', formField: string): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading.set(kind);
    let request;
    switch (kind) {
      case 'hero': request = this.tenantClient.uploadBrandingHero(file, this.tenantId); break;
      case 'banner': request = this.tenantClient.uploadBrandingBanner(file, this.tenantId); break;
      default: request = this.tenantClient.uploadBrandingHero(file, this.tenantId); break;
    }

    request.subscribe({
      next: (result) => {
        this.uploading.set(null);
        this.form.patchValue({ [formField]: result.url });
        this.notifications.success('Image uploaded — click Save to apply.');
        input.value = '';
      },
      error: () => {
        this.uploading.set(null);
        this.notifications.error('Image upload failed');
        input.value = '';
      },
    });
  }

  save(): void {
    this.saving.set(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any = this.form.getRawValue();

    const toArr = (arr: any[], keys: string[]) => arr.map((item: any) => {
      const obj: Record<string, any> = {};
      for (const k of keys) obj[k] = item[k] || undefined;
      return obj;
    });

    const lc: Record<string, any> = {};
    for (const key of ['eyebrow', 'heroTitle', 'heroSubtitle', 'heroDescription',
      'heroImageUrl', 'heroImageUrl2', 'bannerOverrideImageUrl', 'pageBackgroundImageUrl',
      'ctaLogin', 'ctaEnroll', 'ctaHeading', 'ctaDescription', 'stickyBarText', 'stickyBarCta',
      'appStoreUrl', 'playStoreUrl', 'footerDescription', 'copyrightText',
      // Section headings — Banner
      'bannerEyebrow', 'bannerHeading', 'bannerDescription', 'bannerCta1', 'bannerCta2',
      // Section headings — Features
      'featuresEyebrow', 'featuresTitle',
      // Section headings — How It Works
      'howEyebrow', 'howTitle',
      // Section headings — Profiles
      'profilesEyebrow', 'profilesTitle', 'profilesViewAll',
      // Section headings — Success Stories
      'storiesEyebrow', 'storiesTitle',
      // Section headings — CTA
      'ctaAdvisorLabel',
      // Section headings — Why Choose
      'whyEyebrow', 'whyTitle',
      // Section headings — Communities
      'casteEyebrow', 'casteTitle', 'casteNote',
      // Section headings — Events
      'melavaEyebrow', 'melavaTitle', 'melavaViewLabel',
      // Section headings — App Download
      'appEyebrow', 'appTitle', 'appDescription', 'appRating', 'appReviewNote',
      // Section headings — Testimonials
      'testimonialsEyebrow', 'testimonialsTitle',
      // Section headings — Counters
      'countersEyebrow', 'countersTitle',
      // Section headings — Before/After
      'beforeAfterEyebrow', 'beforeAfterTitle',
      // Form hero
      'formTitle', 'formSubtitle', 'formBrideLabel', 'formGroomLabel',
      'formLookingForLabel', 'formCasteLabel']) {
      if (raw[key]) lc[key] = raw[key];
    }

    const stats = toArr(raw.stats, ['value', 'label']);
    if (stats.length) lc['stats'] = stats;
    const features = toArr(raw.features, ['icon', 'title', 'text']);
    if (features.length) lc['features'] = features;
    const steps = toArr(raw.steps, ['title', 'text']);
    if (steps.length) lc['steps'] = steps;
    const stories = toArr(raw.stories, ['name', 'meta', 'quote', 'image']);
    if (stories.length) lc['stories'] = stories;
    const whyItems = toArr(raw.whyItems, ['icon', 'title', 'text']);
    if (whyItems.length) lc['whyItems'] = whyItems;
    const trustItems = toArr(raw.trustItems, ['icon', 'title']);
    if (trustItems.length) lc['trustItems'] = trustItems;
    const events = toArr(raw.events, ['day', 'month', 'title', 'place']);
    if (events.length) lc['events'] = events;
    const navLinks = toArr(raw.navLinks, ['label', 'href']);
    if (navLinks.length) lc['navLinks'] = navLinks;

    const communities = (raw.communitiesText || '').split('\n').map((s: string) => s.trim()).filter(Boolean);
    if (communities.length) lc['communities'] = communities;

    const formCommunities = (raw.formCommunitiesText || '').split('\n').map((s: string) => s.trim()).filter(Boolean);
    if (formCommunities.length) lc['formCommunities'] = formCommunities;

    if (raw.formMiniStatsText) {
      try { lc['formMiniStats'] = JSON.parse(raw.formMiniStatsText); } catch {}
    }

    const order = (raw.sectionOrderText || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    if (order.length) lc['sectionOrder'] = order;

    const vis = raw.sectionVisibility;
    const allVisible = Object.values(vis).every(Boolean);
    if (!allVisible) {
      lc['sectionVisibility'] = {};
      for (const [k, v] of Object.entries(vis)) {
        if (!v) lc['sectionVisibility'][k] = false;
      }
    }

    const body: SaveTenantBrandingRequest = {
      landingContentJson: JSON.stringify(lc),
    };
    this.tenantClient.upsertTenantBranding(body, this.tenantId).subscribe({
      next: () => {
        this.saving.set(false);
        this.notifications.success('Landing content saved');
      },
      error: () => {
        this.saving.set(false);
        this.notifications.error('Failed to save landing content');
      },
    });
  }
}
