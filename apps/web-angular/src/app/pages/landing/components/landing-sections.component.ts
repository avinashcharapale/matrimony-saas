import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { LandingHeroComponent } from './landing-hero.component';
import { LandingStatsComponent } from './landing-stats.component';
import { LandingInfoComponent } from './landing-info.component';
import { LandingRecentProfilesComponent } from './landing-recent-profiles.component';
import { LandingTrustComponent } from './landing-trust.component';
import { LandingCtaFooterComponent } from './landing-cta-footer.component';
import { FeatureItem, ProfileItem, StatItem, TrustCardItem } from '../landing.models';

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
  ],
  templateUrl: './landing-sections.component.html',
})
export class LandingSectionsComponent {
  @Input({ required: true }) tenant!: {
    displayName: string;
    supportPhone: string;
    supportEmail: string;
    supportAddress: string;
    copyrightText: string;
  };
  @Input({ required: true }) stats!: StatItem[];
  @Input({ required: true }) whyChoose!: FeatureItem[];
  @Input({ required: true }) howItWorks!: FeatureItem[];
  @Input({ required: true }) autoScrollProfiles!: ProfileItem[];
  @Input({ required: true }) trustCards!: TrustCardItem[];
}
