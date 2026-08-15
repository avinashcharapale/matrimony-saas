import { Component, ChangeDetectionStrategy, inject, signal, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import {
  TenantClient,
  TenantSecuritySettingDto,
  TenantEmailSettingDto,
  TenantNotificationSettingDto,
  SaveTenantSecuritySettingRequest,
  SaveTenantEmailSettingRequest,
  SaveTenantNotificationSettingRequest,
  BillingClient,
  PaymentSettingsDto,
  SaveTenantPaymentSettingsRequest,
  GetGatewayConfigurationDto,
  SaveGatewayConfigurationRequest,
} from '@org/generated';
import { NotificationService } from '@org/core';
import { panelStyles } from './tenant-settings-panels';

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

  @Input() tenantId?: number;

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
    this.tenantClient.getTenantSecuritySettings(this.tenantId).subscribe({
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
    this.tenantClient.upsertTenantSecuritySettings(body, this.tenantId).subscribe({
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

  @Input() tenantId?: number;

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
    this.tenantClient.getTenantEmailSettings(this.tenantId).subscribe({
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
    this.tenantClient.upsertTenantEmailSettings(body, this.tenantId).subscribe({
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

  @Input() tenantId?: number;

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
    this.tenantClient.getTenantNotificationSettings(this.tenantId).subscribe({
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
    this.tenantClient.upsertTenantNotificationSettings(body, this.tenantId).subscribe({
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

// ─────────────────────────────────────────────────────────────────────────────
// Payment settings (online / offline mode)
// ─────────────────────────────────────────────────────────────────────────────

const paymentPanelStyles = `
  .radio-group { margin: 8px 0 16px; }
  .radio-label { font-size: 12px; color: #757575; margin-bottom: 8px; }
  .radio-group mat-radio-button { display: block; margin-bottom: 8px; font-size: 14px; }
  .section-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #757575; margin: 12px 0 4px; }
  .qr-preview { display: flex; justify-content: center; padding: 12px; margin: 4px 0 12px; background: #fafafa; border: 1px dashed #ddd; border-radius: 10px; }
  .qr-preview img { width: 120px; height: 120px; object-fit: contain; background: #fff; padding: 6px; border-radius: 8px; }
`;

const gatewayKeysStyles = `
  .keys-table { width: 100%; border-collapse: collapse; margin-bottom: 1.25rem; }
  .keys-table th { text-align: left; padding: 10px 12px; font-size: 12px; color: #757575; text-transform: uppercase; letter-spacing: 0.03em; border-bottom: 1px solid #f0f0f0; white-space: nowrap; }
  .keys-table td { padding: 10px 12px; font-size: 14px; color: #1a1a1a; border-bottom: 1px solid #f5f5f5; vertical-align: middle; }
  .keys-table tbody tr:last-child td { border-bottom: none; }
  .gw-name { font-weight: 600; }
  .gw-code { font-size: 12px; color: #757575; margin-left: 6px; font-weight: 400; }
  .mono { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px; }
  .secret-chip { display: inline-block; padding: 1px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: #e8f5e9; color: #2e7d32; margin-right: 6px; }
  .secret-chip.missing { background: #fce4ec; color: #c62828; }
  .status-chip { display: inline-block; padding: 2px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; background: #f5f5f5; color: #757575; }
  .status-chip.active { background: #e8f5e9; color: #2e7d32; }
  .row-btn { display: inline-flex; align-items: center; gap: 4px; margin-right: 6px; }
  .row-btn.danger { color: #c62828; }
  .empty-state { color: #9e9e9e; text-align: center; padding: 1.5rem; font-size: 14px; }
  .form-divider { margin: 0.5rem 0 1rem; }
  .form-actions.start { display: flex; align-items: center; justify-content: space-between; margin-top: 0; }
  .form-heading { margin: 0; font-size: 15px; font-weight: 600; color: #222; }
  .form-actions button[mat-flat-button] { display: inline-flex; align-items: center; gap: 6px; }
`;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-payment-settings-panel',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatIconModule, MatButtonModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatInputModule, MatCheckboxModule, MatRadioModule, MatCardModule, MatDividerModule,
  ],
  template: `
    <div class="panel-card">
      <div class="panel-header">
        <h3>Payment Settings</h3>
        <p class="panel-subtitle">Configure how payments are collected for this tenant</p>
      </div>

      @if (loading()) {
        <div class="loading-inline">
          <mat-spinner diameter="32"></mat-spinner>
        </div>
      } @else {
        <form [formGroup]="form" class="settings-form">
          <div class="checkbox-row">
            <mat-checkbox formControlName="isActive" color="primary">Enable payments for this tenant</mat-checkbox>
          </div>

          <div class="radio-group">
            <div class="radio-label">Payment mode</div>
            <mat-radio-group formControlName="paymentMode">
              <mat-radio-button value="online">Online only (gateway)</mat-radio-button>
              <mat-radio-button value="offline">Offline only (manual UPI / bank)</mat-radio-button>
              <mat-radio-button value="both">Online &amp; offline (user chooses)</mat-radio-button>
            </mat-radio-group>
          </div>

          <mat-divider></mat-divider>

          <div class="section-title">UPI</div>
          <div class="checkbox-row">
            <mat-checkbox formControlName="autoQrUrl" color="primary">Auto-generate QR from UPI ID</mat-checkbox>
          </div>
          @if (qrPreview()) {
            <div class="qr-preview">
              <img [src]="qrPreview()" alt="UPI QR code preview" />
            </div>
          }
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>UPI ID</mat-label>
            <input matInput formControlName="upiId" placeholder="yourname@upi" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>UPI QR Code URL</mat-label>
            <input matInput formControlName="upiQrUrl" placeholder="https://.../qr.png" [readonly]="autoQrEnabled()" />
            @if (autoQrEnabled()) {
              <mat-hint>Auto-generated from your UPI ID. Uncheck the box to use your own hosted QR image URL.</mat-hint>
            } @else {
              <mat-hint>Paste a URL to a hosted QR image (e.g. generated by your UPI app or a QR generator).</mat-hint>
            }
          </mat-form-field>

          <div class="section-title">Bank Transfer</div>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Account Holder Name</mat-label>
            <input matInput formControlName="bankAccountHolderName" />
          </mat-form-field>
          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Bank Name</mat-label>
              <input matInput formControlName="bankName" placeholder="e.g. HDFC Bank" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Account Number</mat-label>
              <input matInput formControlName="accountNumber" />
            </mat-form-field>
          </div>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>IFSC Code</mat-label>
            <input matInput formControlName="ifscCode" placeholder="e.g. HDFC0001234" />
          </mat-form-field>

          <div class="form-actions">
            <button mat-flat-button color="primary" [disabled]="saving()" (click)="save()">
              <mat-icon>save</mat-icon>
              Save Payment Settings
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [panelStyles, paymentPanelStyles],
})
export class PaymentSettingsPanel implements OnInit {
  private readonly billing = inject(BillingClient);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);

  @Input() tenantId?: number;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly qrPreview = signal<string>('');
  readonly autoQrEnabled = signal(true);

  readonly form = this.fb.nonNullable.group({
    isActive: [true],
    paymentMode: ['online'],
    upiQrUrl: [''],
    upiId: [''],
    bankAccountHolderName: [''],
    bankName: [''],
    accountNumber: [''],
    ifscCode: [''],
    autoQrUrl: [true],
  });

  ngOnInit(): void {
    this.billing.getPaymentSettings(this.tenantId).subscribe({
      next: (s) => {
        if (s) {
          this.form.patchValue({
            isActive: s.isActive ?? true,
            paymentMode: s.paymentMode ?? 'online',
            upiQrUrl: s.upiQrUrl ?? '',
            upiId: s.upiId ?? '',
            bankAccountHolderName: s.bankAccountHolderName ?? '',
            bankName: s.bankName ?? '',
            accountNumber: s.accountNumber ?? '',
            ifscCode: s.ifscCode ?? '',
            autoQrUrl: !s.upiQrUrl,
          });
        }
        this.loading.set(false);
        this.initQrWatchers();
      },
      error: () => {
        this.loading.set(false);
        this.initQrWatchers();
      },
    });
  }

  private initQrWatchers(): void {
    const upiId = this.form.get('upiId');
    const upiQrUrl = this.form.get('upiQrUrl');
    const autoQrUrl = this.form.get('autoQrUrl');

    this.autoQrEnabled.set(autoQrUrl?.value ?? true);

    upiId?.valueChanges.subscribe(() => this.applyAutoQr());
    this.form.get('bankAccountHolderName')?.valueChanges.subscribe(() => this.applyAutoQr());
    autoQrUrl?.valueChanges.subscribe((enabled) => {
      this.autoQrEnabled.set(enabled);
      this.applyAutoQr();
    });
    upiQrUrl?.valueChanges.subscribe((value) => {
      if (!this.autoQrEnabled()) this.qrPreview.set(value ?? '');
    });

    this.applyAutoQr();
  }

  private applyAutoQr(): void {
    const upiId = this.form.get('upiId')?.value ?? '';
    const upiQrUrl = this.form.get('upiQrUrl');
    const holder = this.form.get('bankAccountHolderName')?.value ?? '';

    if (this.autoQrEnabled()) {
      upiQrUrl?.setValue(buildUpiQrUrl(upiId, holder), { emitEvent: false });
      this.qrPreview.set(upiQrUrl?.value ?? '');
    } else {
      this.qrPreview.set(upiQrUrl?.value ?? '');
    }
  }

  save(): void {
    this.saving.set(true);
    const raw = this.form.getRawValue();
    const body: SaveTenantPaymentSettingsRequest = {
      isActive: raw.isActive,
      paymentMode: raw.paymentMode,
      upiQrUrl: raw.upiQrUrl || undefined,
      upiId: raw.upiId || undefined,
      bankAccountHolderName: raw.bankAccountHolderName || undefined,
      bankName: raw.bankName || undefined,
      accountNumber: raw.accountNumber || undefined,
      ifscCode: raw.ifscCode || undefined,
    };
    this.billing.savePaymentSettings(body, this.tenantId).subscribe({
      next: () => {
        this.saving.set(false);
        this.notifications.success('Payment settings saved');
      },
      error: () => {
        this.saving.set(false);
        this.notifications.error('Failed to save payment settings');
      },
    });
  }
}

function buildUpiQrUrl(upiId: string, payeeName?: string): string {
  const id = (upiId ?? '').trim();
  if (!id) return '';
  const name = (payeeName ?? '').trim();
  const data = name
    ? `upi://pay?pa=${encodeURIComponent(id)}&pn=${encodeURIComponent(name)}&cu=INR`
    : `upi://pay?pa=${encodeURIComponent(id)}&cu=INR`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Gateway keys (Razorpay credentials)
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-gateway-keys-panel',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatIconModule, MatButtonModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatInputModule, MatCheckboxModule, MatSelectModule, MatCardModule, MatDividerModule,
  ],
  template: `
    <div class="panel-card">
      <div class="panel-header">
        <h3>Payment Gateway Keys</h3>
        <p class="panel-subtitle">Per-tenant gateway credentials. The active configuration is used at checkout.</p>
      </div>

      @if (loading()) {
        <div class="loading-inline">
          <mat-spinner diameter="32"></mat-spinner>
        </div>
      } @else {
        @if (configs().length > 0) {
          <table class="keys-table">
            <thead>
              <tr>
                <th>Gateway</th>
                <th>Environment</th>
                <th>Key ID</th>
                <th>Secrets</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (c of configs(); track c.gatewayConfigurationId) {
                <tr>
                  <td class="gw-name">{{ c.gatewayName }} <span class="gw-code">{{ c.gatewayCode }}</span></td>
                  <td>{{ c.environment }}</td>
                  <td class="mono">{{ c.apiKeyMasked || '—' }}</td>
                  <td>
                    <span class="secret-chip" [class.missing]="!c.hasApiSecret">Secret {{ c.hasApiSecret ? '✓' : '✗' }}</span>
                    <span class="secret-chip" [class.missing]="!c.hasWebhookSecret">Webhook {{ c.hasWebhookSecret ? '✓' : '✗' }}</span>
                  </td>
                  <td>
                    <span class="status-chip" [class.active]="c.isActive">{{ c.isActive ? 'Active' : 'Inactive' }}</span>
                  </td>
                  <td>
                    <button mat-stroked-button class="row-btn" (click)="startEdit(c)">
                      <mat-icon>edit</mat-icon>
                      Edit
                    </button>
                    <button mat-stroked-button class="row-btn danger" (click)="remove(c)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <div class="empty-state">No gateway configurations yet. Add your Razorpay keys below.</div>
        }

        <mat-divider class="form-divider"></mat-divider>

        <form [formGroup]="form" class="settings-form">
          <div class="form-actions start">
            <h4 class="form-heading">{{ editingId() ? 'Edit gateway configuration' : 'Add gateway configuration' }}</h4>
            @if (editingId()) {
              <button mat-button (click)="resetForm()">Cancel edit</button>
            }
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Gateway ID</mat-label>
              <input matInput type="number" formControlName="paymentGatewayId" placeholder="1 = Razorpay" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Environment</mat-label>
              <mat-select formControlName="environment">
                <mat-option value="production">Production</mat-option>
                <mat-option value="test">Test</mat-option>
                <mat-option value="sandbox">Sandbox</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>API Key ID</mat-label>
            <input matInput formControlName="apiKey" placeholder="rzp_test_..." />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>API Secret</mat-label>
            <input matInput type="password" formControlName="apiSecret" placeholder="{{ editingId() ? 'Leave blank to keep current' : '' }}" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Webhook Secret</mat-label>
            <input matInput type="password" formControlName="webhookSecret" placeholder="{{ editingId() ? 'Leave blank to keep current' : '' }}" />
          </mat-form-field>

          <div class="checkbox-row">
            <mat-checkbox formControlName="isActive" color="primary">Active (used at checkout)</mat-checkbox>
          </div>

          <div class="form-actions">
            <button mat-flat-button color="primary" [disabled]="saving()" (click)="saveConfig()">
              @if (saving()) {
                <mat-spinner diameter="18"></mat-spinner>
              }
              <mat-icon>{{ editingId() ? 'save' : 'add' }}</mat-icon>
              {{ editingId() ? 'Save Changes' : 'Add Configuration' }}
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [panelStyles, gatewayKeysStyles],
})
export class GatewayKeysPanel implements OnInit {
  private readonly billing = inject(BillingClient);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);

  @Input() tenantId?: number;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly configs = signal<GetGatewayConfigurationDto[]>([]);
  readonly editingId = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    paymentGatewayId: [1],
    environment: ['production'],
    apiKey: [''],
    apiSecret: [''],
    webhookSecret: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.billing.getGatewayConfigurations(this.tenantId).subscribe({
      next: (items) => {
        this.configs.set(items ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  startEdit(c: GetGatewayConfigurationDto): void {
    this.editingId.set(c.gatewayConfigurationId ?? null);
    this.form.patchValue({
      paymentGatewayId: c.paymentGatewayId ?? 1,
      environment: c.environment ?? 'production',
      apiKey: '',
      apiSecret: '',
      webhookSecret: '',
      isActive: c.isActive ?? true,
    });
  }

  resetForm(): void {
    this.editingId.set(null);
    this.form.reset({
      paymentGatewayId: 1,
      environment: 'production',
      apiKey: '',
      apiSecret: '',
      webhookSecret: '',
      isActive: true,
    });
  }

  saveConfig(): void {
    const id = this.editingId();
    const raw = this.form.getRawValue();
    const body: SaveGatewayConfigurationRequest = {
      paymentGatewayId: raw.paymentGatewayId,
      environment: raw.environment,
      apiKey: raw.apiKey || undefined,
      apiSecret: raw.apiSecret || undefined,
      webhookSecret: raw.webhookSecret || undefined,
      isActive: raw.isActive,
    };

    this.saving.set(true);
    const operation = id == null
      ? this.billing.createGatewayConfiguration(body, this.tenantId)
      : this.billing.updateGatewayConfiguration(id, body, this.tenantId);
    operation.subscribe({
      next: () => {
        this.saving.set(false);
        this.notifications.success(id == null ? 'Gateway configuration added' : 'Gateway configuration updated');
        this.resetForm();
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.notifications.error('Failed to save gateway configuration');
      },
    });
  }

  remove(c: GetGatewayConfigurationDto): void {
    const id = c.gatewayConfigurationId;
    if (id == null) return;
    if (!confirm(`Delete the ${c.gatewayName ?? 'gateway'} configuration for ${c.environment ?? ''}?`)) return;

    this.billing.deleteGatewayConfiguration(id, this.tenantId).subscribe({
      next: () => {
        this.notifications.success('Gateway configuration deleted');
        if (this.editingId() === id) this.resetForm();
        this.load();
      },
      error: () => this.notifications.error('Failed to delete gateway configuration'),
    });
  }
}
