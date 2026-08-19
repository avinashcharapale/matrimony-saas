import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { TenantClient, TenantDto } from '@org/generated';
import {
  BrandingPanel,
  LandingContentPanel,
  DomainsPanel,
  ContactsPanel,
  FeatureFlagsPanel,
  LegalDocumentsPanel,
  SecuritySettingsPanel,
  EmailSettingsPanel,
  NotificationSettingsPanel,
  PaymentSettingsPanel,
  GatewayKeysPanel,
} from '@org/tenant-settings';
import { LandingTemplatePanel } from './landing-template-panel.component';
import { TemplatePreviewComponent } from '../../components/template-preview/template-preview.component';
import { APPROVED_TEMPLATES, LandingTemplate } from '@org/landing-templates';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-tenant-settings',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatButtonModule, MatIconModule, MatTabsModule,
    BrandingPanel, LandingContentPanel, DomainsPanel, ContactsPanel, FeatureFlagsPanel, LegalDocumentsPanel,
    SecuritySettingsPanel, EmailSettingsPanel, NotificationSettingsPanel, PaymentSettingsPanel, GatewayKeysPanel,
    LandingTemplatePanel, TemplatePreviewComponent,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <div class="breadcrumb">
            <a routerLink="/tenants">Tenants</a>
            <span class="sep">/</span>
            <span>Tenant #{{ tenantId() }} Settings</span>
          </div>
          <h1>Tenant Settings</h1>
          <p class="subtitle">
            @if (tenant(); as t) {
              {{ t.name || t.tenantCode }}
            } @else {
              Loading tenant...
            }
          </p>
        </div>
      </div>

      <mat-tab-group animationDuration="200ms">
        <mat-tab label="Landing Page Settings">
          <ng-template matTabContent>
            <div class="settings-row">
              <div class="settings-col">
                <app-branding-panel [tenantId]="tenantId()" />
                <div class="panel-spacer"></div>
                <app-landing-content-panel [tenantId]="tenantId()" />
              </div>
              <div class="preview-col">
                <div class="preview-section">
                  <div class="preview-section__head">
                    <span class="preview-section__dot"></span>
                    <span class="preview-section__title">{{ previewTpl().name }} — {{ previewTpl().tag }}</span>
                    <span class="preview-section__live">LIVE PREVIEW</span>
                  </div>
                  <div class="preview-section__body">
                    <app-template-preview [tpl]="previewTpl()" />
                  </div>
                </div>
              </div>
            </div>
          </ng-template>
        </mat-tab>
        <mat-tab label="Landing Template">
          <ng-template matTabContent>
            <app-landing-template-panel [tenantId]="tenantId()" />
          </ng-template>
        </mat-tab>
        <mat-tab label="Domains">
          <ng-template matTabContent>
            <app-domains-panel [tenantId]="tenantId()" />
          </ng-template>
        </mat-tab>
        <mat-tab label="Contacts">
          <ng-template matTabContent>
            <app-contacts-panel [tenantId]="tenantId()" />
          </ng-template>
        </mat-tab>
        <mat-tab label="Security">
          <ng-template matTabContent>
            <app-security-settings-panel [tenantId]="tenantId()" />
          </ng-template>
        </mat-tab>
        <mat-tab label="Email">
          <ng-template matTabContent>
            <app-email-settings-panel [tenantId]="tenantId()" />
          </ng-template>
        </mat-tab>
        <mat-tab label="Notifications">
          <ng-template matTabContent>
            <app-notification-settings-panel [tenantId]="tenantId()" />
          </ng-template>
        </mat-tab>
        <mat-tab label="Payments">
          <ng-template matTabContent>
            <app-payment-settings-panel [tenantId]="tenantId()" />
            <div class="panel-spacer"></div>
            <app-gateway-keys-panel [tenantId]="tenantId()" />
          </ng-template>
        </mat-tab>
        <mat-tab label="Navigation">
          <ng-template matTabContent>
            <app-feature-flags-panel [tenantId]="tenantId()" />
          </ng-template>
        </mat-tab>
        <mat-tab label="Legal Documents">
          <ng-template matTabContent>
            <app-legal-documents-panel [tenantId]="tenantId()" />
          </ng-template>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .page { width: 100%; min-width: 0; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.5rem; color: #2c003e; margin-bottom: 0.25rem; }
    .subtitle { color: #666; font-size: 0.875rem; }
    .breadcrumb { font-size: 0.8125rem; color: #888; margin-bottom: 0.5rem; }
    .breadcrumb a { color: #7b1fa2; text-decoration: none; }
    .breadcrumb a:hover { text-decoration: underline; }
    .breadcrumb .sep { margin: 0 0.375rem; }
    .panel-spacer { height: 1.5rem; }
    ::ng-deep .mat-mdc-tab-body-wrapper { padding-top: 1.5rem; }
    .settings-row { display: flex; gap: 1.5rem; align-items: flex-start; }
    .settings-col { flex: 1; min-width: 0; }
    .preview-col { flex: 1; min-width: 0; position: sticky; top: 0; }

    .preview-section { }
    .preview-section__head {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px; background: #fff; border: 1px solid #e4e4e7;
      border-bottom: none; border-radius: 12px 12px 0 0;
    }
    .preview-section__dot { width: 10px; height: 10px; border-radius: 50%; background: #2e7d32; flex-shrink: 0; }
    .preview-section__title { font-weight: 700; font-size: 14px; color: #2c003e; }
    .preview-section__live {
      margin-left: auto; font-size: 10px; font-weight: 800; letter-spacing: 0.12em;
      color: #2e7d32; background: #e8f5e9; padding: 3px 8px; border-radius: 999px; white-space: nowrap;
    }
    .preview-section__body {
      border: 1px solid #e4e4e7; border-top: none; border-radius: 0 0 12px 12px;
      overflow: auto; max-height: 680px; background: #fff;
      transform: translateZ(0);
    }
  `],
})
export class TenantSettings implements OnInit {
  private readonly tenantClient = inject(TenantClient);
  private readonly route = inject(ActivatedRoute);

  readonly tenantId = signal<number>(0);
  readonly tenant = signal<TenantDto | null>(null);
  readonly previewTpl = signal<LandingTemplate>(APPROVED_TEMPLATES[0]);

  ngOnInit(): void {
    const tid = Number(this.route.snapshot.paramMap.get('tenantId'));
    if (tid) {
      this.tenantId.set(tid);
      this.tenantClient.getById(tid).subscribe({
        next: (t) => this.tenant.set(t),
      });
      this.tenantClient.getTenantBranding(tid).subscribe({
        next: (branding) => {
          let parsed: any = {};
          try { parsed = branding.brandingJson ? JSON.parse(branding.brandingJson) : {}; } catch {}
          const tplId = parsed.themeTemplateId;
          if (tplId) {
            const found = APPROVED_TEMPLATES.find(t => t.id === tplId);
            if (found) this.previewTpl.set(found);
          }
        },
      });
    }
  }
}
