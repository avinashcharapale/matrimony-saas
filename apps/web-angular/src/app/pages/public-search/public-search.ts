import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocaleService } from '@org/i18n';
import { ProfileClient, ProfileListItemDto } from '@org/generated';
import { RegisterMasterDataService, RegisterLookupOption, RegisterStateOption, RegisterDistrictOption } from '../../services/register-master-data.service';
import { AuthService } from '../../services/auth.service';
import { resolvePhotoUrl } from '../../utils/default-avatar';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-public-search',
  standalone: true,
  imports: [FormsModule, TranslateModule],
  templateUrl: './public-search.html',
  styleUrl: './public-search.css',
})
export class PublicSearch implements OnInit {
private readonly profileClient = inject(ProfileClient);
private readonly masterData = inject(RegisterMasterDataService);
private readonly router = inject(Router);
private readonly authService = inject(AuthService);
private readonly translate = inject(TranslateService);
private readonly localeService = inject(LocaleService);

  private readonly langTick = signal(0);

  constructor() {
    this.translate.onLangChange.subscribe(() => this.langTick.update((v) => v + 1));
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }

  get heading(): string {
    this.langTick();
    return this.t('publicSearch.heading');
  }

  get subtitle(): string {
    this.langTick();
    return this.t('publicSearch.subtitle');
  }

  get ctaLabel(): string {
    this.langTick();
    return this.t('publicSearch.registerToConnect');
  }

  readonly results = signal<ProfileListItemDto[]>([]);
  readonly totalCount = signal(0);
  readonly pageNumber = signal(1);
  readonly pageSize = 10;
  readonly loading = signal(false);
  readonly error = signal('');

  filters = {
    name: '',
    lookingFor: '',
    ageMin: 18,
    ageMax: 60,
    city: '',
    religionId: '',
    casteId: '',
    educationId: '',
    maritalStatusId: '',
    occupationId: '',
    occupationPlace: '',
    annualIncomeFrom: '',
    nativePlace: '',
    height: 'Any',
    sortBy: 'relevance',
  };

  showAdvanced = false;

  readonly religionOptions = signal<RegisterLookupOption[]>([]);
  readonly casteOptions = signal<RegisterLookupOption[]>([]);
  readonly educationOptions = signal<RegisterLookupOption[]>([]);
  readonly maritalStatusOptions = signal<RegisterLookupOption[]>([]);
  readonly occupationOptions = signal<RegisterLookupOption[]>([]);
  readonly stateOptions = signal<RegisterStateOption[]>([]);
  readonly districtOptions = signal<RegisterDistrictOption[]>([]);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalCount() / this.pageSize)),
  );

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.pageNumber();
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  readonly advancedFilterCount = computed(() => {
    let count = 0;
    if (this.filters.religionId) count++;
    if (this.filters.casteId) count++;
    if (this.filters.educationId) count++;
    if (this.filters.maritalStatusId) count++;
    if (this.filters.occupationId) count++;
    if (this.filters.occupationPlace) count++;
    if (this.filters.annualIncomeFrom) count++;
    if (this.filters.nativePlace) count++;
    if (this.filters.height !== 'Any') count++;
    return count;
  });

  readonly selectedProfile = signal<ProfileListItemDto | null>(null);

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/profiles']);
      return;
    }

    this.loadMasterData();
    this.performSearch();
  }

  loadMasterData(): void {
    this.masterData.getReligions().subscribe({
      next: (opts) => this.religionOptions.set(opts),
      error: () => {},
    });
    this.masterData.getEducations().subscribe({
      next: (opts) => this.educationOptions.set(opts),
      error: () => {},
    });
    this.masterData.getMaritalStatuses().subscribe({
      next: (opts) => this.maritalStatusOptions.set(opts),
      error: () => {},
    });
    this.masterData.getOccupations().subscribe({
      next: (opts) => this.occupationOptions.set(opts),
      error: () => {},
    });
    this.masterData.getStates().subscribe({
      next: (opts) => this.stateOptions.set(opts),
      error: () => {},
    });
  }

  performSearch(): void {
    this.loading.set(true);
    this.error.set('');

    const searchGenderId = this.filters.lookingFor === 'Bride' ? 2 : this.filters.lookingFor === 'Groom' ? 1 : undefined;

    const params: Record<string, unknown> = {
      genderId: searchGenderId,
      ageFrom: this.filters.ageMin,
      ageTo: this.filters.ageMax,
      city: this.filters.city || undefined,
      religionId: this.filters.religionId ? Number(this.filters.religionId) || undefined : undefined,
      casteId: this.filters.casteId ? Number(this.filters.casteId) || undefined : undefined,
      educationId: this.filters.educationId ? Number(this.filters.educationId) || undefined : undefined,
      maritalStatusId: this.filters.maritalStatusId ? Number(this.filters.maritalStatusId) || undefined : undefined,
      occupationId: this.filters.occupationId ? Number(this.filters.occupationId) || undefined : undefined,
      workingCity: this.filters.occupationPlace || undefined,
      nativePlace: this.filters.nativePlace || undefined,
      annualIncomeFrom: this.filters.annualIncomeFrom ? Number(this.filters.annualIncomeFrom) || undefined : undefined,
      searchTerm: [this.filters.name].filter(Boolean).join(' ') || undefined,
      sortBy: this.filters.sortBy === 'age-asc' ? 'Age' : this.filters.sortBy === 'age-desc' ? 'Age' : undefined,
      sortDescending: this.filters.sortBy === 'age-desc',
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize,
    };

    if (this.filters.height && this.filters.height !== 'Any') {
      const match = this.filters.height.match(/(\d+)'(\d+)/g);
      if (match && match.length >= 2) {
        const [fromFt, fromIn] = match[0].split("'").map(Number);
        const [toFt, toIn] = match[1].split("'").map(Number);
        params['heightFromFt'] = fromFt;
        params['heightFromIn'] = fromIn || 0;
        params['heightToFt'] = toFt;
        params['heightToIn'] = toIn || 0;
      }
    }

    this.profileClient.searchPublic(params as any).subscribe({
      next: (response) => {
        this.results.set(response.items ?? []);
        this.totalCount.set(response.totalCount ?? 0);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(this.t('publicSearch.errors.searchFailed'));
      },
    });
  }

  onSearch(): void {
    this.pageNumber.set(1);
    this.performSearch();
  }

  onReligionChange(): void {
    this.filters.casteId = '';
    const religionId = Number(this.filters.religionId);
    if (!religionId) {
      this.casteOptions.set([]);
      return;
    }
    this.masterData.getCastes(religionId).subscribe({
      next: (opts) => this.casteOptions.set(opts),
      error: () => this.casteOptions.set([]),
    });
  }

  clearFilters(): void {
    this.filters.religionId = '';
    this.filters.casteId = '';
    this.filters.educationId = '';
    this.filters.maritalStatusId = '';
    this.filters.occupationId = '';
    this.filters.occupationPlace = '';
    this.filters.annualIncomeFrom = '';
    this.filters.nativePlace = '';
    this.filters.height = 'Any';
    this.casteOptions.set([]);
  }

  goToPage(page: number): void {
    this.pageNumber.set(page);
    this.performSearch();
  }

  getDisplayName(profile: ProfileListItemDto): string {
    return profile.publicDisplayName ?? profile.fullName ?? '';
  }

  getPhotoUrl(profile: ProfileListItemDto): string {
    return resolvePhotoUrl(profile.thumbnailUrl, profile.fullName, profile.genderId);
  }

  onPhotoError(event: Event, profile: ProfileListItemDto): void {
    const image = event.target as HTMLImageElement;
    image.onerror = null;
    image.classList.add('card-photo-fallback');
    image.src = resolvePhotoUrl(null, profile.fullName, profile.genderId);
  }

  getReligionLabel(profile: ProfileListItemDto): string {
    if (!profile.religionId) return '';
    const match = this.religionOptions().find((r) => r.id === profile.religionId);
    return match?.label ?? '';
  }

  getCasteLabel(profile: ProfileListItemDto): string {
    if (!profile.casteId) return '';
    const match = this.casteOptions().find((c) => c.id === profile.casteId);
    return match?.label ?? '';
  }

  getStateLabel(profile: ProfileListItemDto): string {
    if (!profile.stateId) return '';
    const match = this.stateOptions().find((s) => s.stateId === profile.stateId);
    return match?.name ?? '';
  }

  getDistrictLabel(profile: ProfileListItemDto): string {
    if (!profile.districtId) return '';
    const match = this.districtOptions().find((d) => d.districtId === profile.districtId);
    return match?.name ?? '';
  }

  getMaritalStatusLabel(profile: ProfileListItemDto): string {
    if (!profile.maritalStatusId) return '';
    const match = this.maritalStatusOptions().find((m) => m.id === profile.maritalStatusId);
    return match?.label ?? '';
  }

  getEducationLabel(profile: ProfileListItemDto): string {
    if (!profile.educationId) return '';
    const match = this.educationOptions().find((e) => e.id === profile.educationId);
    return match?.label ?? '';
  }

  onProfileClick(profile: ProfileListItemDto): void {
    this.selectedProfile.set(profile);
    this.districtOptions.set([]);
    if (profile.stateId) {
      this.masterData.getDistricts(profile.stateId).subscribe({
        next: (opts) => this.districtOptions.set(opts),
        error: () => {},
      });
    }
  }

  getCreatedAtText(profile: ProfileListItemDto): string {
    if (!profile.createdAt) return '';
    const d = new Date(profile.createdAt);
    if (isNaN(d.getTime()) || d.getFullYear() < 100) return '';
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }

  getDobText(profile: ProfileListItemDto): string {
    const day = profile.dobDay;
    const month = profile.dobMonth;
    const year = profile.dobYear;
    if (day == null || month == null || year == null) return '';
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  }

  getHeightText(profile: ProfileListItemDto): string {
    if (profile.heightFt == null) return '';
    return `${profile.heightFt}'${String(profile.heightIn ?? 0).padStart(2, '0')}"`;
  }

  getOccupationIncomeText(profile: ProfileListItemDto): string {
    const parts: string[] = [];
    if (profile.occupationDetails) parts.push(profile.occupationDetails);
    if (profile.workingCity) parts.push(profile.workingCity);
    if (profile.workingCountryName) parts.push(profile.workingCountryName);
    if (parts.length > 0) {
      let text = parts.join(', ');
      if (profile.incomeAmount) text += ` / ${this.localeService.formatCompactCurrency(profile.incomeAmount)}`;
      return text;
    }
    return profile.occupationText ?? '';
  }

  closeProfileDetail(): void {
    this.selectedProfile.set(null);
  }

  onCardCtaClick(profile: ProfileListItemDto, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/register']);
  }

  onBottomCta(): void {
    this.router.navigate(['/register']);
  }
}
