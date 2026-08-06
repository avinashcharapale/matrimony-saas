import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
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
  TenantSecuritySettingDto,
  TenantEmailSettingDto,
  TenantNotificationSettingDto,
  SaveTenantSecuritySettingRequest,
  SaveTenantEmailSettingRequest,
  SaveTenantNotificationSettingRequest,
} from '@org/generated';
import { NotificationService } from '@org/core';
import { panelStyles } from '@org/tenant-settings';

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
