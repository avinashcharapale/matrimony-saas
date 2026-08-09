import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { TenantClient, TenantDto } from '@org/generated';
import { BrandingPanel, DomainsPanel, ContactsPanel, FeatureFlagsPanel } from '@org/tenant-settings';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-tenant-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatTabsModule, BrandingPanel, DomainsPanel, ContactsPanel, FeatureFlagsPanel],
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
        <mat-tab label="Branding">
          <ng-template matTabContent>
            <app-branding-panel [tenantId]="tenantId()" />
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
        <mat-tab label="Navigation">
          <ng-template matTabContent>
            <app-feature-flags-panel [tenantId]="tenantId()" />
          </ng-template>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .page { max-width: 900px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.5rem; color: #2c003e; margin-bottom: 0.25rem; }
    .subtitle { color: #666; font-size: 0.875rem; }
    .breadcrumb { font-size: 0.8125rem; color: #888; margin-bottom: 0.5rem; }
    .breadcrumb a { color: #7b1fa2; text-decoration: none; }
    .breadcrumb a:hover { text-decoration: underline; }
    .breadcrumb .sep { margin: 0 0.375rem; }
    ::ng-deep .mat-mdc-tab-body-wrapper { padding-top: 1.5rem; }
  `],
})
export class TenantSettings implements OnInit {
  private readonly tenantClient = inject(TenantClient);
  private readonly route = inject(ActivatedRoute);

  readonly tenantId = signal<number>(0);
  readonly tenant = signal<TenantDto | null>(null);

  ngOnInit(): void {
    const tid = Number(this.route.snapshot.paramMap.get('tenantId'));
    if (tid) {
      this.tenantId.set(tid);
      this.tenantClient.getById(tid).subscribe({
        next: (t) => this.tenant.set(t),
      });
    }
  }
}
