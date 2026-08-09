import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TenantContact } from '@org/tenant-config';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-landing-cta-footer',
  standalone: true,
  imports: [RouterModule, TranslateModule],
  templateUrl: './landing-cta-footer.component.html',
  styleUrl: '../landing.css',
})
export class LandingCtaFooterComponent {
  @Input({ required: true }) tenant!: {
    displayName: string;
    ctaEnroll: string;
    ctaLogin: string;
    contacts: TenantContact[];
    copyrightText: string;
  };
  @Input() ctaHeading = '';
  @Input() ctaDescription = '';
  @Input() footerDescription = '';
  @Input() footerLinks: { label: string; url: string }[] = [];

  contactClass() {
    return {
      'Phone': 'contact-phone',
      'WhatsApp': 'contact-whatsapp',
      'Email': 'contact-email',
      'Social': 'contact-social',
      'Address': 'contact-address',
    } as const;
  }
}
