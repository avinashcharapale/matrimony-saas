import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, computed, inject, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MemberRecord, MemberService } from '../../services/member.service';
import { getDefaultAvatar, resolvePhotoUrl } from '../../utils/default-avatar';
import { RegisterMasterDataService, RegisterLookupOption } from '@org/data-access-registration';
import { AuthStore } from '@org/data-access-auth';
import { SubscriptionClient } from '@org/generated';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profile-list',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './profile-list.html',
  styleUrl: './profile-list.css',
})
export class ProfileList implements OnInit {
  private readonly memberService = inject(MemberService);
  private readonly router = inject(Router);
  private readonly registerMasterData = inject(RegisterMasterDataService);
  private readonly authStore = inject(AuthStore);
  private readonly subscriptionClient = inject(SubscriptionClient);

  readonly isAuthenticated = signal(false);
  readonly isPaidUser = signal(false);

  readonly religionOptions = signal<RegisterLookupOption[]>([]);
  readonly casteOptions = signal<RegisterLookupOption[]>([]);
  readonly educationOptions = signal<RegisterLookupOption[]>([]);
  readonly maritalStatusOptions = signal<RegisterLookupOption[]>([]);
  readonly occupationOptions = signal<RegisterLookupOption[]>([]);

  readonly heights = [
    'Any',
    "4'10\" - 5'0\"",
    "5'0\" - 5'2\"",
    "5'2\" - 5'4\"",
    "5'4\" - 5'6\"",
    "5'6\" - 5'8\"",
    "5'8\" - 5'10\"",
    "5'10\" - 6'0\"",
    "6'0\" - 6'2\"",
    "6'2\"+",
  ];

  readonly ageMinOptions = [18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50];
  readonly ageMaxOptions = [20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 55, 60];

  readonly incomeOptions = [
    { value: 0, label: 'Any' },
    { value: 200000, label: '2 Lakh+' },
    { value: 400000, label: '4 Lakh+' },
    { value: 600000, label: '6 Lakh+' },
    { value: 800000, label: '8 Lakh+' },
    { value: 1000000, label: '10 Lakh+' },
    { value: 1500000, label: '15 Lakh+' },
    { value: 2000000, label: '20 Lakh+' },
    { value: 3000000, label: '30 Lakh+' },
    { value: 5000000, label: '50 Lakh+' },
    { value: 10000000, label: '1 Crore+' },
  ];

  filters = {
    name: '',
    location: '',
    occupation: '',
    lookingFor: 'Groom',
    ageMin: 18,
    ageMax: 60,
    height: 'Any',
    religion: '',
    caste: '',
    education: '',
    occupationId: '',
    workingCity: '',
    nativePlace: '',
    annualIncomeFrom: '',
    annualIncomeTo: '',
    maritalStatus: '',
  };

  readonly showAdvanced = signal(false);
  readonly sortBy = signal('relevance');
  readonly currentPage = signal(1);
  readonly pageSize = 5;

  readonly results = signal<MemberRecord[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal('');

  readonly activeFilterCount = computed(() => {
    const f = this.filters;
    let count = 0;
    if (f.religion) count++;
    if (f.caste) count++;
    if (f.education) count++;
    if (f.maritalStatus) count++;
    if (f.occupationId) count++;
    if (f.workingCity) count++;
    if (f.nativePlace) count++;
    if (f.annualIncomeFrom) count++;
    if (f.height && f.height !== 'Any') count++;
    return count;
  });

  readonly sortedResults = computed(() => {
    const items = [...this.results()];
    if (this.sortBy() === 'age-asc') {
      return items.sort((a, b) => (a.age ?? 99) - (b.age ?? 99));
    }
    if (this.sortBy() === 'age-desc') {
      return items.sort((a, b) => (b.age ?? 0) - (a.age ?? 0));
    }
    return items;
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.sortedResults().length / this.pageSize)),
  );

  readonly pageResults = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.sortedResults().slice(start, start + this.pageSize);
  });

  readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, idx) => idx + 1),
  );

  ngOnInit(): void {
    this.isAuthenticated.set(this.authStore.isAuthenticated());
    this.loadFilterOptions();

    if (this.isAuthenticated()) {
      const userId = this.authStore.session()?.userId ?? 0;
      if (userId) {
        this.loadSubscriptionStatus(userId);
      }
      this.loadMyProfile();
    } else {
      this.performSearch();
    }
  }

  private loadSubscriptionStatus(userId: number): void {
    this.subscriptionClient.getUserSubscriptionStatus(userId).subscribe({
      next: (status) =>
        this.isPaidUser.set(Boolean(status?.isActive) && !(status?.isTrial ?? false)),
      error: () => { /* noop */ },
    });
  }

  private loadFilterOptions(): void {
    this.registerMasterData.getReligions().subscribe({
      next: (opts) => this.religionOptions.set(opts),
      error: () => { /* noop */ },
    });
    this.registerMasterData.getEducations().subscribe({
      next: (opts) => this.educationOptions.set(opts),
      error: () => { /* noop */ },
    });
    this.registerMasterData.getMaritalStatuses().subscribe({
      next: (opts) => this.maritalStatusOptions.set(opts),
      error: () => { /* noop */ },
    });
    this.registerMasterData.getOccupations().subscribe({
      next: (opts) => this.occupationOptions.set(opts),
      error: () => { /* noop */ },
    });
  }

  private loadMyProfile(): void {
    this.memberService.getMyProfile().subscribe({
      next: (profile) => {
        const genderId = profile.personalDetails?.genderId ?? null;
        if (genderId) {
          this.filters.lookingFor = genderId === 1 ? 'Bride' : 'Groom';
        }
        this.performSearch();
      },
      error: () => { /* noop */ },
    });
  }

  getProfilePhotoUrl(profile: MemberRecord): string {
    if (profile.thumbnailUrl) {
      return resolvePhotoUrl(profile.thumbnailUrl, profile.name, profile.genderId ?? null);
    }
    const genderId =
      profile.genderId ??
      (profile.registrationDetails?.personal?.gender
        ? Number(profile.registrationDetails.personal.gender) || null
        : null);
    return getDefaultAvatar(profile.name, genderId);
  }

  onPhotoError(event: Event, name: string): void {
    const image = event.target as HTMLImageElement;
    image.onerror = null;
    image.src = getDefaultAvatar(name);
  }

  getReligionLabel(profile: MemberRecord): string {
    if (!profile.religionId) return '';
    return this.religionOptions().find((r) => r.id === profile.religionId)?.label ?? '';
  }

  getCasteLabel(profile: MemberRecord): string {
    if (!profile.casteId) return '';
    return this.casteOptions().find((c) => c.id === profile.casteId)?.label ?? '';
  }

  onReligionChange(): void {
    this.filters.caste = '';
    const religionId = Number(this.filters.religion);
    if (!religionId) {
      this.casteOptions.set([]);
      return;
    }
    this.registerMasterData.getCastes(religionId).subscribe({
      next: (opts) => this.casteOptions.set(opts),
      error: () => this.casteOptions.set([]),
    });
  }

  toggleAdvanced(): void {
    this.showAdvanced.update((v) => !v);
  }

  clearFilters(): void {
    this.filters.religion = '';
    this.filters.caste = '';
    this.filters.education = '';
    this.filters.maritalStatus = '';
    this.filters.occupationId = '';
    this.filters.workingCity = '';
    this.filters.nativePlace = '';
    this.filters.annualIncomeFrom = '';
    this.filters.annualIncomeTo = '';
    this.filters.height = 'Any';
    this.casteOptions.set([]);
  }

  openProfile(profile: MemberRecord): void {
    this.router.navigate(['/profiles', profile.id]);
  }

  goToPage(page: number): void {
    this.currentPage.set(Math.min(this.totalPages(), Math.max(1, page)));
  }

  search(): void {
    this.error.set('');
    this.filters.name = this.filters.name.trim();
    this.filters.location = this.filters.location.trim();
    this.filters.occupation = this.filters.occupation.trim();
    this.currentPage.set(1);
    this.performSearch();
  }

  onSortChange(value: string): void {
    this.sortBy.set(value);
    this.currentPage.set(1);
  }

  private parseHeightRange(range: string): { fromFt: number; fromIn: number; toFt: number; toIn: number } {
    const parts = range.split('-').map((s) => s.trim());
    const fromMatch = parts[0]?.match(/(\d+)[\u2032'"](\d+)/);
    const toMatch = parts.length > 1 ? parts[parts.length - 1]?.match(/(\d+)[\u2032'"](\d+)/) : fromMatch;
    return {
      fromFt: parseInt(fromMatch?.[1] ?? '4', 10),
      fromIn: parseInt(fromMatch?.[2] ?? '0', 10),
      toFt: parseInt(toMatch?.[1] ?? '7', 10),
      toIn: parseInt(toMatch?.[2] ?? '0', 10),
    };
  }

  private performSearch(): void {
    this.isLoading.set(true);
    this.error.set('');

    const searchGenderId = this.filters.lookingFor === 'Bride' ? 2 : 1;

    let heightFromFt: number | undefined;
    let heightFromIn: number | undefined;
    let heightToFt: number | undefined;
    let heightToIn: number | undefined;
    if (this.filters.height && this.filters.height !== 'Any') {
      const parsed = this.parseHeightRange(this.filters.height);
      heightFromFt = parsed.fromFt;
      heightFromIn = parsed.fromIn;
      heightToFt = parsed.toFt;
      heightToIn = parsed.toIn;
    }

    this.memberService
      .searchProfiles({
        name: this.filters.name,
        location: this.filters.location,
        occupation: this.filters.occupation,
        genderId: searchGenderId,
        ageMin: this.filters.ageMin,
        ageMax: this.filters.ageMax,
        religion: this.filters.religion || undefined,
        caste: this.filters.caste || undefined,
        educationId: this.filters.education ? Number(this.filters.education) || undefined : undefined,
        occupationId: this.filters.occupationId ? Number(this.filters.occupationId) || undefined : undefined,
        workingCity: this.filters.workingCity || undefined,
        nativePlace: this.filters.nativePlace || undefined,
        annualIncomeFrom: this.filters.annualIncomeFrom ? Number(this.filters.annualIncomeFrom) || undefined : undefined,
        annualIncomeTo: this.filters.annualIncomeTo ? Number(this.filters.annualIncomeTo) || undefined : undefined,
        maritalStatus: this.filters.maritalStatus || undefined,
        heightFromFt,
        heightFromIn,
        heightToFt,
        heightToIn,
        pageNumber: this.currentPage(),
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.results.set(response);
        },
        error: () => {
          this.isLoading.set(false);
          this.error.set('Search failed. Please try again.');
        },
      });
  }
}
