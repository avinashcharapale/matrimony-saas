import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

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
    supportPhone: string;
    supportEmail: string;
    supportAddress: string;
    copyrightText: string;
  };
  @Input() ctaHeading = '';
  @Input() ctaDescription = '';
  @Input() footerDescription = '';
  @Input() footerLinks: { label: string; url: string }[] = [];
}
