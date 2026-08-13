import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '@org/shared-ui';
import { MatTabsModule } from '@angular/material/tabs';
import {
  SecuritySettingsPanel,
  EmailSettingsPanel,
  NotificationSettingsPanel,
} from './settings-panels';
import { FeatureFlagsPanel, LegalDocumentsPanel } from '@org/tenant-settings';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, PageHeaderComponent, MatTabsModule,
    SecuritySettingsPanel, EmailSettingsPanel, NotificationSettingsPanel, FeatureFlagsPanel, LegalDocumentsPanel,
  ],
  template: `
    <div class="settings-page">
      <ui-page-header title="Settings" subtitle="Manage your tenant operational settings" />

      <mat-tab-group animationDuration="200ms">
        <mat-tab label="Security">
          <ng-template matTabContent>
            <app-security-settings-panel></app-security-settings-panel>
          </ng-template>
        </mat-tab>
        <mat-tab label="Email">
          <ng-template matTabContent>
            <app-email-settings-panel></app-email-settings-panel>
          </ng-template>
        </mat-tab>
        <mat-tab label="Notifications">
          <ng-template matTabContent>
            <app-notification-settings-panel></app-notification-settings-panel>
          </ng-template>
        </mat-tab>
        <mat-tab label="Navigation">
          <ng-template matTabContent>
            <app-feature-flags-panel></app-feature-flags-panel>
          </ng-template>
        </mat-tab>
        <mat-tab label="Legal Documents">
          <ng-template matTabContent>
            <app-legal-documents-panel></app-legal-documents-panel>
          </ng-template>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .settings-page { position: relative; }
    ::ng-deep .mat-mdc-tab-body-wrapper { padding-top: 1.5rem; }
  `],
})
export class Settings {}
