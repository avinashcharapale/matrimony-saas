import { Component, ChangeDetectionStrategy, inject, signal, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { StatusBadgeComponent } from '@org/shared-ui';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import {
  TenantClient,
  TenantBrandingDto,
  TenantDomainDto,
  SaveTenantBrandingRequest,
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
`;

// ─────────────────────────────────────────────────────────────────────────────
// Branding
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-branding-panel',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatIconModule, MatButtonModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatInputModule, MatCardModule, MatDividerModule,
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

          <div class="form-row">
            <mat-form-field appearance="outline" class="third-width">
              <mat-label>Primary Color</mat-label>
              <input matInput formControlName="primaryColor" placeholder="#1976d2" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="third-width">
              <mat-label>Secondary Color</mat-label>
              <input matInput formControlName="secondaryColor" placeholder="#e91e63" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="third-width">
              <mat-label>Accent Color</mat-label>
              <input matInput formControlName="accentColor" placeholder="#ff9800" />
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Font Family</mat-label>
            <input matInput formControlName="fontFamily" placeholder="Roboto, sans-serif" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Custom CSS</mat-label>
            <textarea matInput formControlName="customCss" rows="4" placeholder="Optional custom CSS"></textarea>
          </mat-form-field>

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
  styles: [panelStyles],
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

  readonly form = this.fb.nonNullable.group({
    logoUrl: ['', [Validators.pattern(/^https?:\/\/.+/i)]],
    faviconUrl: ['', [Validators.pattern(/^https?:\/\/.+/i)]],
    primaryColor: [''],
    secondaryColor: [''],
    accentColor: [''],
    fontFamily: [''],
    customCss: [''],
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
          const branding: TenantBrandingDto = data;
          this.form.patchValue({
            logoUrl: branding.logoUrl ?? '',
            faviconUrl: branding.faviconUrl ?? '',
            primaryColor: branding.primaryColor ?? '',
            secondaryColor: branding.secondaryColor ?? '',
            accentColor: branding.accentColor ?? '',
            fontFamily: branding.fontFamily ?? '',
            customCss: branding.customCss ?? '',
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
    const body: SaveTenantBrandingRequest = {
      logoUrl: raw.logoUrl || undefined,
      faviconUrl: raw.faviconUrl || undefined,
      primaryColor: raw.primaryColor || undefined,
      secondaryColor: raw.secondaryColor || undefined,
      accentColor: raw.accentColor || undefined,
      fontFamily: raw.fontFamily || undefined,
      customCss: raw.customCss || undefined,
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
