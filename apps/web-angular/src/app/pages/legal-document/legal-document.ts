import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TenantClient, LegalDocumentKind } from '@org/generated';
import { TenantService } from '../../services/tenant.service';

const PAGE_META: Record<LegalDocumentKind, { title: string; description: string }> = {
  privacy: {
    title: 'Privacy Policy',
    description: 'How your personal information is collected, used, and protected.',
  },
  terms: {
    title: 'Terms & Conditions',
    description: 'The rules and obligations for using this matrimony platform.',
  },
  refund: {
    title: 'Refund Policy',
    description: 'Terms covering membership fees and refunds.',
  },
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-legal-document-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './legal-document.html',
  styleUrls: ['./legal-document.css'],
})
export class LegalDocumentPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly tenantClient = inject(TenantClient);
  private readonly tenantService = inject(TenantService);

  readonly tenant = this.tenantService.tenant;
  readonly loading = signal(true);
  readonly documentUrl = signal<string | null>(null);

  get pageData(): { title: string; description: string } {
    const kind = this.kind();
    return kind ? PAGE_META[kind] : PAGE_META.privacy;
  }

  ngOnInit(): void {
    const kind = this.kind();
    const tenantId = Number(this.tenantService.tenantHeaderId);

    if (!tenantId || !kind) {
      this.loading.set(false);
      return;
    }

    this.tenantClient.getPublicTenantLegalDocuments(tenantId).subscribe({
      next: (data) => {
        const url =
          kind === 'privacy'
            ? data.privacyPolicyUrl
            : kind === 'terms'
              ? data.termsConditionsUrl
              : data.refundPolicyUrl;
        this.documentUrl.set(url ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private kind(): LegalDocumentKind | null {
    const raw = this.route.snapshot.data['kind'];
    if (raw === 'privacy' || raw === 'terms' || raw === 'refund') {
      return raw;
    }
    return null;
  }
}
