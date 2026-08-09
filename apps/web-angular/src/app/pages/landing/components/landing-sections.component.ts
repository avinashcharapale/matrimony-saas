import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LandingHeroComponent } from './landing-hero.component';
import { LandingStatsComponent } from './landing-stats.component';
import { LandingInfoComponent } from './landing-info.component';
import { LandingRecentProfilesComponent } from './landing-recent-profiles.component';
import { LandingTrustComponent } from './landing-trust.component';
import { LandingCtaFooterComponent } from './landing-cta-footer.component';
import { FeatureItem, ProfileItem, StatItem, TrustCardItem } from '../landing.models';
import { TenantContact, TenantLandingContent } from '@org/tenant-config';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-landing-sections',
  standalone: true,
  imports: [
    LandingHeroComponent,
    LandingStatsComponent,
    LandingInfoComponent,
    LandingRecentProfilesComponent,
    LandingTrustComponent,
    LandingCtaFooterComponent,
    TranslateModule,
  ],
  templateUrl: './landing-sections.component.html',
})
export class LandingSectionsComponent {
  @Input({ required: true }) tenant!: {
    displayName: string;
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
    heroImage: string;
    ctaEnroll: string;
    contacts: TenantContact[];
    copyrightText: string;
    ctaLogin: string;
    landingContent?: TenantLandingContent;
  };
  @Input({ required: true }) stats!: StatItem[];
  @Input({ required: true }) whyChoose!: FeatureItem[];
  @Input({ required: true }) howItWorks!: FeatureItem[];
  @Input({ required: true }) autoScrollProfiles!: ProfileItem[];
  @Input({ required: true }) trustCards!: TrustCardItem[];
}
