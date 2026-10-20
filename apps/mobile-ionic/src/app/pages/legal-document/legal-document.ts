import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
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
  rules: {
    title: 'Rules & Guidelines',
    description: 'Platform rules and guidelines for safe and respectful matchmaking.',
  },
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-legal-document-page',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, TranslateModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <ion-page>
      <ion-content>
        <div class="legal-shell">
          <article class="legal-hero">
            <p class="eyebrow">{{ tenant.displayName }}</p>
            <h1>{{ pageData.title }}</h1>
            <p>{{ pageData.description }}</p>
          </article>

          @if (loading()) {
            <div class="legal-loading">{{ 'legalDocument.loading' | translate }}</div>
          } @else if (documentUrl()) {
            <div class="legal-doc">
              @if (isImage) {
                <img [src]="documentUrl()" alt="{{ pageData.title }}" class="legal-image" />
              } @else {
                <embed [src]="documentUrl()" type="application/pdf" class="legal-pdf" />
              }
              <a [href]="documentUrl()" target="_blank" rel="noopener" class="legal-open">
                {{ 'legalDocument.openInNewTab' | translate }}
              </a>
            </div>
          } @else {
            <div class="legal-empty">
              <p>{{ 'legalDocument.notAvailable' | translate }}</p>
              <a routerLink="/" class="legal-back">{{ 'legalDocument.backHome' | translate }}</a>
            </div>
          }
        </div>
      </ion-content>
    </ion-page>
  `,
  styles: [
    `
      .legal-shell {
        padding: 1rem;
      }

      .legal-hero {
        margin-bottom: 1rem;
      }

      .legal-hero h1 {
        margin: 0 0 0.25rem;
      }

      .legal-hero p {
        color: var(--text-muted);
        margin: 0;
      }

      .eyebrow {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--tenant-primary);
        margin: 0 0 0.35rem;
      }

      .legal-loading,
      .legal-empty p {
        color: var(--text-muted);
      }

      .legal-doc {
        display: grid;
        gap: 0.6rem;
      }

      .legal-image {
        width: 100%;
        border-radius: 0.5rem;
      }

      .legal-pdf {
        width: 100%;
        height: 70vh;
        border-radius: 0.5rem;
      }

      .legal-open,
      .legal-back {
        display: inline-block;
        text-decoration: none;
        color: var(--on-primary);
        background: var(--tenant-primary);
        padding: 0.6rem 0.8rem;
        border-radius: 0.6rem;
        text-align: center;
      }
    `,
  ],
})
export class LegalDocumentPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly tenantClient = inject(TenantClient);
  readonly tenantService = inject(TenantService);

  readonly tenant = this.tenantService.tenant;
  readonly loading = signal(true);
  readonly documentUrl = signal<string | null>(null);

  get pageData(): { title: string; description: string } {
    const kind = this.kind();
    return kind ? PAGE_META[kind] : PAGE_META.privacy;
  }

  get isImage(): boolean {
    const url = this.documentUrl();
    return url ? /\.(jpg|jpeg|png|gif|webp)$/i.test(url) : false;
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
              : kind === 'refund'
                ? data.refundPolicyUrl
                : data.rulesUrl;
        this.documentUrl.set(url ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private kind(): LegalDocumentKind | null {
    const raw = this.route.snapshot.data['kind'];
    if (raw === 'privacy' || raw === 'terms' || raw === 'refund' || raw === 'rules') {
      return raw;
    }
    return null;
  }
}
