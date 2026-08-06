import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TenantService } from '../../services/tenant.service';
import { ProfileClient } from '@org/generated';
import { FeatureItem, ProfileItem, StatItem, TrustCardItem } from './landing.models';
import { LandingSectionsComponent } from './components/landing-sections.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-landing',
  standalone: true,
  imports: [LandingSectionsComponent, TranslateModule],
  templateUrl: './landing.html',
})
export class Landing implements OnInit {
  readonly tenant = inject(TenantService).tenant;
  private readonly profileClient = inject(ProfileClient);
  private readonly translate = inject(TranslateService);

  private readonly langTick = signal(0);

  private readonly statsRaw = signal<StatItem[]>([]);
  private readonly recentProfilesRaw = signal<ProfileItem[]>([]);

  readonly stats = computed<StatItem[]>(() => {
    this.langTick();
    return this.statsRaw().map(s => ({ ...s, label: this.t(s.label) }));
  });

  readonly recentProfiles = computed<ProfileItem[]>(() => {
    this.langTick();
    return this.recentProfilesRaw().map(p => ({
      ...p,
      status: p.status === 'verified' ? this.t('landing.verified') : this.t('landing.new'),
    }));
  });

  readonly whyChoose = computed<FeatureItem[]>(() => this.tenant.landingContent?.whyChoose ?? []);
  readonly howItWorks = computed<FeatureItem[]>(() => this.tenant.landingContent?.howItWorks ?? []);
  readonly trustCards = computed<TrustCardItem[]>(() => this.tenant.landingContent?.trustCards ?? []);

  constructor() {
    this.translate.onLangChange.subscribe(() => this.langTick.update(v => v + 1));
  }

  get autoScrollProfiles(): ProfileItem[] {
    const profiles = this.recentProfiles();
    return [...profiles, ...profiles];
  }

  ngOnInit(): void {
    this.loadRecentProfiles();
    this.loadStats();
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }

  private loadRecentProfiles(): void {
    this.profileClient.searchPublicProfiles({ pageNumber: 1, pageSize: 10 }).subscribe({
      next: (response) => {
        const profiles: ProfileItem[] = (response.items ?? []).map((p) => ({
          name: p.fullName ?? '',
          age: p.age ?? 0,
          occupation: p.occupationText ?? '',
          location: p.locationText ?? '',
          status: p.isVerified ? 'verified' : 'new',
          icon: p.genderId === 1 ? '👨' : '👩',
          photoUrl: p.thumbnailUrl,
        }));
        this.recentProfilesRaw.set(profiles);
      },
      error: () => {},
    });
  }

  private loadStats(): void {
    this.profileClient.getProfileStats().subscribe({
      next: (s) => {
        this.statsRaw.set([
          { value: String(s.brideCount ?? 0), label: 'landing.statBrides', icon: '💍', accent: 'stat-pink' },
          { value: String(s.groomCount ?? 0), label: 'landing.statGrooms', icon: '🤵', accent: 'stat-blue' },
          { value: String(s.unmarriedCount ?? 0), label: 'landing.statUnmarried', icon: '💛', accent: 'stat-gold' },
          { value: String(s.divorcedCount ?? 0), label: 'landing.statDivorced', icon: '💜', accent: 'stat-purple' },
        ]);
      },
      error: () => {},
    });
  }
}
