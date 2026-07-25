import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { TenantService } from '../../services/tenant.service';
import { ProfileClient } from '@org/generated';
import { FeatureItem, ProfileItem, StatItem, TrustCardItem } from './landing.models';
import { LandingSectionsComponent } from './components/landing-sections.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-landing',
  standalone: true,
  imports: [LandingSectionsComponent],
  templateUrl: './landing.html',
})
export class Landing implements OnInit {
  readonly tenant = inject(TenantService).tenant;
  private readonly profileClient = inject(ProfileClient);

  readonly stats = signal<StatItem[]>([]);
  readonly recentProfiles = signal<ProfileItem[]>([]);

  readonly whyChoose = computed<FeatureItem[]>(() => this.tenant.landingContent?.whyChoose ?? []);
  readonly howItWorks = computed<FeatureItem[]>(() => this.tenant.landingContent?.howItWorks ?? []);
  readonly trustCards = computed<TrustCardItem[]>(() => this.tenant.landingContent?.trustCards ?? []);

  get autoScrollProfiles(): ProfileItem[] {
    const profiles = this.recentProfiles();
    return [...profiles, ...profiles];
  }

  ngOnInit(): void {
    this.loadRecentProfiles();
    this.loadStats();
  }

  private loadRecentProfiles(): void {
    this.profileClient.searchPublicProfiles({ pageNumber: 1, pageSize: 10 }).subscribe({
      next: (response) => {
        const profiles: ProfileItem[] = (response.items ?? []).map((p) => ({
          name: p.fullName ?? '',
          age: p.age ?? 0,
          occupation: p.occupationText ?? '',
          location: p.locationText ?? '',
          status: p.isVerified ? 'Verified' : 'New',
          icon: p.genderId === 1 ? '👨' : '👩',
          photoUrl: p.thumbnailUrl,
        }));
        this.recentProfiles.set(profiles);
      },
      error: () => {},
    });
  }

  private loadStats(): void {
    this.profileClient.getProfileStats().subscribe({
      next: (s) => {
        this.stats.set([
          { value: String(s.brideCount ?? 0), label: 'Brides', icon: '💍', accent: 'stat-pink' },
          { value: String(s.groomCount ?? 0), label: 'Grooms', icon: '🤵', accent: 'stat-blue' },
          { value: String(s.unmarriedCount ?? 0), label: 'Unmarried', icon: '💛', accent: 'stat-gold' },
          { value: String(s.divorcedCount ?? 0), label: 'Divorced', icon: '💜', accent: 'stat-purple' },
        ]);
      },
      error: () => {},
    });
  }
}
