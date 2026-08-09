import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
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
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './menu-page.html',
  styleUrls: ['./menu-page.css'],
})
export class MenuPage {
  private readonly route = inject(ActivatedRoute);
  readonly tenant = inject(TenantService).tenant;

  get pageData(): MenuPageData {
    return this.route.snapshot.data as MenuPageData;
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
