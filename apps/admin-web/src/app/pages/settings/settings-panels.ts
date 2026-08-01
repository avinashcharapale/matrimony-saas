import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { StatusBadgeComponent } from '@org/shared-ui';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import {
  TenantClient,
  TenantBrandingDto,
  TenantSecuritySettingDto,
  TenantEmailSettingDto,
  TenantNotificationSettingDto,
  TenantDomainDto,
  SaveTenantBrandingRequest,
  SaveTenantSecuritySettingRequest,
  SaveTenantEmailSettingRequest,
  SaveTenantNotificationSettingRequest,
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
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Logo URL</mat-label>
            <input matInput formControlName="logoUrl" placeholder="https://..." />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Favicon URL</mat-label>
            <input matInput formControlName="faviconUrl" placeholder="https://..." />
          </mat-form-field>

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
            <button mat-flat-button color="primary" [disabled]="saving()" (click)="save()">
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

  readonly loading = signal(true);
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    logoUrl: [''],
    faviconUrl: [''],
    primaryColor: [''],
    secondaryColor: [''],
    accentColor: [''],
    fontFamily: [''],
    customCss: [''],
  });

  ngOnInit(): void {
    this.tenantClient.getTenantBranding().subscribe({
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
    this.tenantClient.upsertTenantBranding(body).subscribe({
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
    this.tenantClient.getTenantDomains().subscribe({
      next: (data) => { this.domains.set(data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  addDomain(): void {
    const domain = this.form.get('domain')?.value?.trim();
    if (!domain) return;
    this.tenantClient.createTenantDomain({ domain }).subscribe({
      next: () => {
        this.notifications.success('Domain added');
        this.form.reset({ domain: '' });
        this.loadDomains();
      },
      error: () => this.notifications.error('Failed to add domain'),
    });
  }

  verify(id: number): void {
    this.tenantClient.verifyTenantDomain(id).subscribe({
      next: () => { this.notifications.success('Domain verified'); this.loadDomains(); },
      error: () => this.notifications.error('Failed to verify domain'),
    });
  }

  setPrimary(id: number): void {
    this.tenantClient.setPrimaryTenantDomain(id).subscribe({
      next: () => { this.notifications.success('Primary domain updated'); this.loadDomains(); },
      error: () => this.notifications.error('Failed to update primary domain'),
    });
  }

  remove(id: number): void {
    this.tenantClient.deleteTenantDomain(id).subscribe({
      next: () => { this.notifications.success('Domain deleted'); this.loadDomains(); },
      error: () => this.notifications.error('Failed to delete domain'),
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Security settings
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-security-settings-panel',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatIconModule, MatButtonModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatInputModule, MatCheckboxModule, MatCardModule, MatDividerModule,
  ],
  template: `
    <div class="panel-card">
      <div class="panel-header">
        <h3>Security Settings</h3>
        <p class="panel-subtitle">Authentication and password policy for your tenant</p>
      </div>

      @if (loading()) {
        <div class="loading-inline">
          <mat-spinner diameter="32"></mat-spinner>
        </div>
      } @else {
        <form [formGroup]="form" class="settings-form">
          <div class="checkbox-row">
            <mat-checkbox formControlName="requireMfa" color="primary">Require Multi-Factor Authentication</mat-checkbox>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Password Min Length</mat-label>
              <input matInput type="number" formControlName="passwordMinLength" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Password Expiry (days)</mat-label>
              <input matInput type="number" formControlName="passwordExpiryDays" />
            </mat-form-field>
          </div>

          <div class="checkbox-row">
            <mat-checkbox formControlName="passwordRequireSpecialChars" color="primary">Require special characters</mat-checkbox>
          </div>
          <div class="checkbox-row">
            <mat-checkbox formControlName="passwordRequireNumbers" color="primary">Require numbers</mat-checkbox>
          </div>
          <div class="checkbox-row">
            <mat-checkbox formControlName="passwordRequireUpperLower" color="primary">Require upper &amp; lower case</mat-checkbox>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Session Timeout (minutes)</mat-label>
              <input matInput type="number" formControlName="sessionTimeoutMinutes" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Max Failed Login Attempts</mat-label>
              <input matInput type="number" formControlName="maxFailedLoginAttempts" />
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Lockout Duration (minutes)</mat-label>
            <input matInput type="number" formControlName="lockoutDurationMinutes" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Allowed IP Ranges</mat-label>
            <input matInput formControlName="allowedIpRanges" placeholder="e.g. 192.168.1.0/24, 10.0.0.0/8" />
          </mat-form-field>

          <div class="form-actions">
            <button mat-flat-button color="primary" [disabled]="saving()" (click)="save()">
              <mat-icon>save</mat-icon>
              Save Security Settings
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [panelStyles],
})
export class SecuritySettingsPanel implements OnInit {
  private readonly tenantClient = inject(TenantClient);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);

  readonly loading = signal(true);
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    requireMfa: [false],
    passwordMinLength: [8],
    passwordRequireSpecialChars: [true],
    passwordRequireNumbers: [true],
    passwordRequireUpperLower: [true],
    passwordExpiryDays: [90],
    sessionTimeoutMinutes: [30],
    maxFailedLoginAttempts: [5],
    lockoutDurationMinutes: [15],
    allowedIpRanges: [''],
  });

  ngOnInit(): void {
    this.tenantClient.getTenantSecuritySettings().subscribe({
      next: (data) => {
        if (data) {
          const s: TenantSecuritySettingDto = data;
          this.form.patchValue({
            requireMfa: s.requireMfa ?? false,
            passwordMinLength: s.passwordMinLength ?? 8,
            passwordRequireSpecialChars: s.passwordRequireSpecialChars ?? true,
            passwordRequireNumbers: s.passwordRequireNumbers ?? true,
            passwordRequireUpperLower: s.passwordRequireUpperLower ?? true,
            passwordExpiryDays: s.passwordExpiryDays ?? 90,
            sessionTimeoutMinutes: s.sessionTimeoutMinutes ?? 30,
            maxFailedLoginAttempts: s.maxFailedLoginAttempts ?? 5,
            lockoutDurationMinutes: s.lockoutDurationMinutes ?? 15,
            allowedIpRanges: s.allowedIpRanges ?? '',
          });
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  save(): void {
    this.saving.set(true);
    const raw = this.form.getRawValue();
    const body: SaveTenantSecuritySettingRequest = {
      requireMfa: raw.requireMfa,
      passwordMinLength: raw.passwordMinLength,
      passwordRequireSpecialChars: raw.passwordRequireSpecialChars,
      passwordRequireNumbers: raw.passwordRequireNumbers,
      passwordRequireUpperLower: raw.passwordRequireUpperLower,
      passwordExpiryDays: raw.passwordExpiryDays,
      sessionTimeoutMinutes: raw.sessionTimeoutMinutes,
      maxFailedLoginAttempts: raw.maxFailedLoginAttempts,
      lockoutDurationMinutes: raw.lockoutDurationMinutes,
      allowedIpRanges: raw.allowedIpRanges || undefined,
    };
    this.tenantClient.upsertTenantSecuritySettings(body).subscribe({
      next: () => {
        this.saving.set(false);
        this.notifications.success('Security settings saved');
      },
      error: () => {
        this.saving.set(false);
        this.notifications.error('Failed to save security settings');
      },
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Email settings
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-email-settings-panel',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatIconModule, MatButtonModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatInputModule, MatCheckboxModule, MatCardModule, MatDividerModule,
  ],
  template: `
    <div class="panel-card">
      <div class="panel-header">
        <h3>Email Settings</h3>
        <p class="panel-subtitle">SMTP configuration for outgoing tenant emails</p>
      </div>

      @if (loading()) {
        <div class="loading-inline">
          <mat-spinner diameter="32"></mat-spinner>
        </div>
      } @else {
        <form [formGroup]="form" class="settings-form">
          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>SMTP Host</mat-label>
              <input matInput formControlName="smtpHost" placeholder="smtp.gmail.com" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>SMTP Port</mat-label>
              <input matInput type="number" formControlName="smtpPort" />
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>SMTP Username</mat-label>
            <input matInput formControlName="smtpUsername" placeholder="user@yourdomain.com" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>SMTP Password</mat-label>
            <input matInput type="password" formControlName="smtpPassword" placeholder="Leave blank to keep current" />
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>From Address</mat-label>
              <input matInput formControlName="fromAddress" placeholder="no-reply@yourdomain.com" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>From Name</mat-label>
              <input matInput formControlName="fromName" placeholder="Matrimony" />
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Reply-To Address</mat-label>
            <input matInput formControlName="replyToAddress" placeholder="support@yourdomain.com" />
          </mat-form-field>

          <div class="checkbox-row">
            <mat-checkbox formControlName="useSsl" color="primary">Use SSL</mat-checkbox>
          </div>

          <div class="form-actions">
            <button mat-flat-button color="primary" [disabled]="saving()" (click)="save()">
              <mat-icon>save</mat-icon>
              Save Email Settings
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [panelStyles],
})
export class EmailSettingsPanel implements OnInit {
  private readonly tenantClient = inject(TenantClient);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);

  readonly loading = signal(true);
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    smtpHost: [''],
    smtpPort: [587],
    smtpUsername: [''],
    smtpPassword: [''],
    fromAddress: [''],
    fromName: [''],
    replyToAddress: [''],
    useSsl: [true],
  });

  ngOnInit(): void {
    this.tenantClient.getTenantEmailSettings().subscribe({
      next: (data) => {
        if (data) {
          const s: TenantEmailSettingDto = data;
          this.form.patchValue({
            smtpHost: s.smtpHost ?? '',
            smtpPort: s.smtpPort ?? 587,
            smtpUsername: s.smtpUsername ?? '',
            fromAddress: s.fromAddress ?? '',
            fromName: s.fromName ?? '',
            replyToAddress: s.replyToAddress ?? '',
            useSsl: s.useSsl ?? true,
          });
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  save(): void {
    this.saving.set(true);
    const raw = this.form.getRawValue();
    const body: SaveTenantEmailSettingRequest = {
      smtpHost: raw.smtpHost || undefined,
      smtpPort: raw.smtpPort,
      smtpUsername: raw.smtpUsername || undefined,
      smtpPassword: raw.smtpPassword || undefined,
      fromAddress: raw.fromAddress || undefined,
      fromName: raw.fromName || undefined,
      replyToAddress: raw.replyToAddress || undefined,
      useSsl: raw.useSsl,
    };
    this.tenantClient.upsertTenantEmailSettings(body).subscribe({
      next: () => {
        this.saving.set(false);
        this.notifications.success('Email settings saved');
      },
      error: () => {
        this.saving.set(false);
        this.notifications.error('Failed to save email settings');
      },
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification settings
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-notification-settings-panel',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatIconModule, MatButtonModule, MatProgressSpinnerModule,
    MatCheckboxModule, MatCardModule, MatDividerModule,
  ],
  template: `
    <div class="panel-card">
      <div class="panel-header">
        <h3>Notification Settings</h3>
        <p class="panel-subtitle">Which notifications to send to users</p>
      </div>

      @if (loading()) {
        <div class="loading-inline">
          <mat-spinner diameter="32"></mat-spinner>
        </div>
      } @else {
        <form [formGroup]="form" class="settings-form">
          <div class="checkbox-row">
            <mat-checkbox formControlName="welcomeEmail" color="primary">Welcome Email</mat-checkbox>
          </div>
          <div class="checkbox-row">
            <mat-checkbox formControlName="profileApprovalEmail" color="primary">Profile Approval Email</mat-checkbox>
          </div>
          <div class="checkbox-row">
            <mat-checkbox formControlName="matchAlertEmail" color="primary">Match Alert Email</mat-checkbox>
          </div>
          <div class="checkbox-row">
            <mat-checkbox formControlName="messageAlertEmail" color="primary">Message Alert Email</mat-checkbox>
          </div>
          <div class="checkbox-row">
            <mat-checkbox formControlName="weeklyDigestEmail" color="primary">Weekly Digest Email</mat-checkbox>
          </div>
          <div class="checkbox-row">
            <mat-checkbox formControlName="smsNotifications" color="primary">SMS Notifications</mat-checkbox>
          </div>
          <div class="checkbox-row">
            <mat-checkbox formControlName="pushNotifications" color="primary">Push Notifications</mat-checkbox>
          </div>

          <div class="form-actions">
            <button mat-flat-button color="primary" [disabled]="saving()" (click)="save()">
              <mat-icon>save</mat-icon>
              Save Notification Settings
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [panelStyles],
})
export class NotificationSettingsPanel implements OnInit {
  private readonly tenantClient = inject(TenantClient);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);

  readonly loading = signal(true);
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    welcomeEmail: [true],
    profileApprovalEmail: [true],
    matchAlertEmail: [true],
    messageAlertEmail: [true],
    weeklyDigestEmail: [false],
    smsNotifications: [false],
    pushNotifications: [true],
  });

  ngOnInit(): void {
    this.tenantClient.getTenantNotificationSettings().subscribe({
      next: (data) => {
        if (data) {
          const s: TenantNotificationSettingDto = data;
          this.form.patchValue({
            welcomeEmail: s.welcomeEmail ?? true,
            profileApprovalEmail: s.profileApprovalEmail ?? true,
            matchAlertEmail: s.matchAlertEmail ?? true,
            messageAlertEmail: s.messageAlertEmail ?? true,
            weeklyDigestEmail: s.weeklyDigestEmail ?? false,
            smsNotifications: s.smsNotifications ?? false,
            pushNotifications: s.pushNotifications ?? true,
          });
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  save(): void {
    this.saving.set(true);
    const raw = this.form.getRawValue();
    const body: SaveTenantNotificationSettingRequest = {
      welcomeEmail: raw.welcomeEmail,
      profileApprovalEmail: raw.profileApprovalEmail,
      matchAlertEmail: raw.matchAlertEmail,
      messageAlertEmail: raw.messageAlertEmail,
      weeklyDigestEmail: raw.weeklyDigestEmail,
      smsNotifications: raw.smsNotifications,
      pushNotifications: raw.pushNotifications,
    };
    this.tenantClient.upsertTenantNotificationSettings(body).subscribe({
      next: () => {
        this.saving.set(false);
        this.notifications.success('Notification settings saved');
      },
      error: () => {
        this.saving.set(false);
        this.notifications.error('Failed to save notification settings');
      },
    });
  }
}
