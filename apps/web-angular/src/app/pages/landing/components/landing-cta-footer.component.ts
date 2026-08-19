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
  @Input() socialMedia: { facebook?: string; instagram?: string; youtube?: string; twitter?: string; whatsapp?: string } = {};
  @Input() footerSettings: { showSocialMedia?: boolean; showLegalLinks?: boolean; showContactInfo?: boolean } = {
    showSocialMedia: true,
    showLegalLinks: true,
    showContactInfo: true,
  };

  get socialMediaItems(): { key: string; url: string; label: string }[] {
    const sm = this.socialMedia;
    const items: { key: string; url: string; label: string }[] = [];
    if (sm.facebook) items.push({ key: 'facebook', url: sm.facebook, label: 'Facebook' });
    if (sm.instagram) items.push({ key: 'instagram', url: sm.instagram, label: 'Instagram' });
    if (sm.youtube) items.push({ key: 'youtube', url: sm.youtube, label: 'YouTube' });
    if (sm.twitter) items.push({ key: 'twitter', url: sm.twitter, label: 'Twitter' });
    if (sm.whatsapp) items.push({ key: 'whatsapp', url: sm.whatsapp, label: 'WhatsApp' });
    return items;
  }
}
