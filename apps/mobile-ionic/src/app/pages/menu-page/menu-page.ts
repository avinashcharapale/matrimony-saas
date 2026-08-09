import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TenantService } from '../../services/tenant.service';
import { TenantContact } from '@org/tenant-config';

interface MenuPageData {
  title: string;
  description: string;
  highlights: string[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-menu-page',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <ion-page>
      <ion-content>
        <div class="shell">
          <h2>{{ pageData.title }}</h2>
          <p>{{ pageData.description }}</p>

          <ion-item lines="none" class="theme-picker">
            <ion-label>Theme</ion-label>
            <ion-select [ngModel]="tenantService.activeThemeId" (ngModelChange)="onThemeChange($event)">
              @for (theme of tenantService.themes; track theme.id) {
              <ion-select-option [value]="theme.id">
                {{ theme.name }}
              </ion-select-option>
              }
            </ion-select>
          </ion-item>

          <ul>
            @for (item of pageData.highlights; track item) {
            <li>{{ item }}</li>
            }
          </ul>

          @if (contactPhones.length > 0 || contactEmails.length > 0 || contactAddresses.length > 0) {
          <div class="contact-block">
            <h3>Contact Details</h3>
            @if (contactPhones.length > 0) {
            <div class="contact-group">
              <p class="contact-group-title">Phone</p>
              @for (contact of contactPhones; track contact.value) {
              <a [href]="'tel:' + contact.value" class="contact-row">
                <span class="contact-type">{{ contact.label || 'Phone' }}</span>
                <span class="contact-value">{{ contact.value }}@if (contact.isPrimary) { <span class="primary-tag">Primary</span> }</span>
              </a>
              }
            </div>
            }
            @if (contactEmails.length > 0) {
            <div class="contact-group">
              <p class="contact-group-title">Email</p>
              @for (contact of contactEmails; track contact.value) {
              <a [href]="'mailto:' + contact.value" class="contact-row">
                <span class="contact-type">{{ contact.label || 'Email' }}</span>
                <span class="contact-value">{{ contact.value }}@if (contact.isPrimary) { <span class="primary-tag">Primary</span> }</span>
              </a>
              }
            </div>
            }
            @if (contactAddresses.length > 0) {
            <div class="contact-group">
              <p class="contact-group-title">Address</p>
              @for (contact of contactAddresses; track contact.value) {
              <div class="contact-row">
                <span class="contact-type">{{ contact.label || 'Address' }}</span>
                <span class="contact-value">{{ contact.value }}@if (contact.isPrimary) { <span class="primary-tag">Primary</span> }</span>
              </div>
              }
            </div>
            }
          </div>
          }

          <a routerLink="/home" class="btn">Back to Home</a>
        </div>
      </ion-content>
    </ion-page>
  `,
  styles: [
    `
      .shell {
        padding: 1rem;
      }

      h2 {
        margin: 0;
      }

      p {
        color: var(--text-muted);
      }

      .theme-picker {
        --background: var(--surface-overlay);
        border-radius: 0.75rem;
        margin: 0.75rem 0 1rem;
      }

      ul {
        padding-left: 1rem;
        color: var(--text-strong);
      }

      .contact-block {
        margin-top: 1rem;
        display: grid;
        gap: 0.6rem;
      }

      .contact-block h3 {
        margin: 0;
      }

      .contact-group {
        display: grid;
        gap: 0.5rem;
      }

      .contact-group-title {
        margin: 0.25rem 0 0;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-muted);
      }

      .primary-tag {
        display: inline-block;
        margin-left: 0.4rem;
        padding: 1px 7px;
        border-radius: 9999px;
        font-size: 0.62rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        background: var(--accent-soft, color-mix(in srgb, var(--tenant-primary) 15%, #ffffff));
        color: var(--tenant-primary);
      }

      .contact-row {
        display: grid;
        grid-template-columns: 5rem 1fr;
        gap: 0.5rem;
        padding: 0.6rem 0.75rem;
        background: var(--surface-overlay);
        border-radius: 0.6rem;
        text-decoration: none;
        color: inherit;
      }

      .contact-type {
        font-weight: 700;
        font-size: 0.8rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .contact-value {
        color: var(--tenant-primary);
        font-weight: 600;
        word-break: break-word;
      }

      .btn {
        display: inline-block;
        margin-top: 0.75rem;
        text-decoration: none;
        color: var(--on-primary);
        background: var(--tenant-primary);
        padding: 0.6rem 0.8rem;
        border-radius: 0.6rem;
      }
    `,
  ],
})
export class MenuPage {
  private readonly route = inject(ActivatedRoute);
  readonly tenantService = inject(TenantService);

  onThemeChange(themeId: string): void {
    this.tenantService.setTheme(themeId);
  }

  get pageData(): MenuPageData {
    return (
      (this.route.snapshot.data as MenuPageData) ?? {
        title: 'Information',
        description: 'Helpful details for members.',
        highlights: [],
      }
    );
  }

  get contactPhones(): TenantContact[] {
    return (this.tenantService.tenant.contacts ?? [])
      .filter((c) => c.type === 'Phone' || c.type === 'WhatsApp')
      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  }

  get contactEmails(): TenantContact[] {
    return (this.tenantService.tenant.contacts ?? [])
      .filter((c) => c.type === 'Email')
      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  }

  get contactAddresses(): TenantContact[] {
    return (this.tenantService.tenant.contacts ?? [])
      .filter((c) => c.type === 'Address')
      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  }
}
