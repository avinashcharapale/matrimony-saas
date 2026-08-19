import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TenantService } from '../../services/tenant.service';
import { TenantClient } from '@org/generated';
import { TenantContact } from '@org/tenant-config';

interface MenuPageData {
  title: string;
  description: string;
  highlights: string[];
  showContact?: boolean;
  showRulesDocument?: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-menu-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './menu-page.html',
  styleUrls: ['./menu-page.css'],
})
export class MenuPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly tenantClient = inject(TenantClient);
  readonly tenant = inject(TenantService).tenant;
  private readonly tenantService = inject(TenantService);

  readonly rulesUrl = signal<string | null>(null);
  readonly rulesLoading = signal(false);

  get pageData(): MenuPageData {
    return this.route.snapshot.data as MenuPageData;
  }

  get showContact(): boolean {
    return this.pageData.showContact !== false;
  }

  get isImage(): boolean {
    const url = this.rulesUrl();
    return url ? /\.(jpg|jpeg|png|gif|webp)$/i.test(url) : false;
  }

  ngOnInit(): void {
    if (!this.pageData.showRulesDocument) return;

    const tenantId = Number(this.tenantService.tenantHeaderId);
    if (!tenantId) return;

    this.rulesLoading.set(true);
    this.tenantClient.getPublicTenantLegalDocuments(tenantId).subscribe({
      next: (data) => {
        this.rulesUrl.set(data.rulesUrl ?? null);
        this.rulesLoading.set(false);
      },
      error: () => this.rulesLoading.set(false),
    });
  }

  get contactPhones(): TenantContact[] {
    return (this.tenant.contacts ?? [])
      .filter((c) => c.type === 'Phone' || c.type === 'WhatsApp')
      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  }

  get contactEmails(): TenantContact[] {
    return (this.tenant.contacts ?? [])
      .filter((c) => c.type === 'Email')
      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  }

  get contactAddresses(): TenantContact[] {
    return (this.tenant.contacts ?? [])
      .filter((c) => c.type === 'Address')
      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  }
}
