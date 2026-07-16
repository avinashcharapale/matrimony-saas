import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { MemberRecord, MemberService } from '../../services/member.service';
import { getDefaultAvatar, resolvePhotoUrl } from '../../utils/default-avatar';
import { MasterDataService, MasterDataItem } from '../../services/master-data.service';
import { RegisterMasterDataService, RegisterLookupOption } from '../../services/register-master-data.service';
import { ProfileListSidebarComponent } from './components/profile-list-sidebar.component';
import { ProfileListTitleComponent } from './components/profile-list-title.component';
import { ProfileListSearchPanelComponent } from './components/profile-list-search-panel.component';
import { ProfileListResultsComponent } from './components/profile-list-results.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profile-list',
  standalone: true,
  imports: [
    ProfileListSidebarComponent,
    ProfileListTitleComponent,
    ProfileListSearchPanelComponent,
    ProfileListResultsComponent,
  ],
  templateUrl: './profile-list.html',
  styleUrl: './profile-list.css',
})
export class ProfileList implements OnInit {
  private readonly memberService = inject(MemberService);
  private readonly router = inject(Router);
  private readonly masterDataSvc = inject(MasterDataService);
  private readonly registerMasterData = inject(RegisterMasterDataService);
  private readonly heights = ["5'0\"", "5'2\"", "5'4\"", "5'6\"", "5'8\""];

  readonly userName = signal('');
  readonly userFirstName = signal('');
  readonly userPhotoUrl = signal('');
  readonly userOccupation = signal('');

  religionOptions = signal<MasterDataItem[]>([]);
  casteOptions = signal<MasterDataItem[]>([]);
  educationOptions = signal<RegisterLookupOption[]>([]);
  maritalStatusOptions = signal<RegisterLookupOption[]>([]);
  occupationOptions = signal<RegisterLookupOption[]>([]);
  filters = {
    name: '',
    location: '',
    occupation: '',
    lookingFor: 'Bride',
    ageMin: 20,
    ageMax: 28,
    height: "5'0\" - 5'4\"",
    religion: '',
    caste: '',
    education: '',
    maritalStatus: '',
    horoscope: 50,
  };

  sortBy = 'relevance';
  currentPage = 1;
  readonly pageSize = 5;

  results = signal<MemberRecord[]>([]);
  error = signal('');
  isLoading = signal(false);

  ngOnInit(): void {
    this.loadMyProfile();
  }

  private loadMyProfile(): void {
    this.memberService.getMyProfile().subscribe({
      next: (profile) => {
        const fullName = profile.fullName ?? '';
        const firstName = fullName.split(' ')[0] ?? '';
        const genderId = profile.personalDetails?.genderId ?? null;
        const primaryPhoto = (profile.photos ?? []).find(ph => ph.isPrimary) ?? profile.photos?.[0];
        const photoUrl = primaryPhoto
          ? resolvePhotoUrl(primaryPhoto.fileUrl, fullName, genderId)
          : getDefaultAvatar(fullName, genderId);

        this.userName.set(fullName);
        this.userFirstName.set(firstName);
        this.userPhotoUrl.set(photoUrl);
        this.userOccupation.set(profile.occupationText ?? '');
      },
      error: () => {},
    });
  }

  readonly sortedResults = computed(() => {
    const items = [...this.results()];
    if (this.sortBy === 'age-asc') {
      return items.sort((a, b) => (a.age ?? 99) - (b.age ?? 99));
    }
    if (this.sortBy === 'age-desc') {
      return items.sort((a, b) => (b.age ?? 0) - (a.age ?? 0));
    }
    return items.sort((a, b) => this.getMatchScore(b) - this.getMatchScore(a));
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.sortedResults().length / this.pageSize)),
  );

  readonly pageResults = computed(() => {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sortedResults().slice(start, start + this.pageSize);
  });

  readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, idx) => idx + 1).slice(0, 5),
  );

  constructor() {
    this.loadFilterOptions();
    this.performSearch();
  }

  loadFilterOptions(): void {
    this.masterDataSvc.getMultiple(['religion', 'caste']).subscribe({
      next: (data) => {
        this.religionOptions.set(data['religion'] ?? []);
        this.casteOptions.set(data['caste'] ?? []);
      },
      error: () => {},
    });

    this.registerMasterData.getEducations().subscribe({
      next: (opts) => this.educationOptions.set(opts),
      error: () => {},
    });

    this.registerMasterData.getMaritalStatuses().subscribe({
      next: (opts) => this.maritalStatusOptions.set(opts),
      error: () => {},
    });

    this.registerMasterData.getOccupations().subscribe({
      next: (opts) => this.occupationOptions.set(opts),
      error: () => {},
    });
  }

  loadProfiles(): void {
    this.isLoading.set(true);
    this.memberService.getProfiles(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.results.set(
          response.profiles.map((p) => ({
            id: `${p.profileId}`,
            email: p.email,
            name: p.fullName,
            age: p.age,
            occupation: p.occupationText,
            location: p.locationText,
            bio: p.bio,
            password: '',
            createdAt: p.createdAt,
          })),
        );
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Failed to load profiles:', error);
        this.error.set('Failed to load profiles. Please try again.');
      },
    });
  }

  getProfilePhotoUrl(profile: MemberRecord): string {
    const genderId = profile.registrationDetails?.personal?.gender ? Number(profile.registrationDetails.personal.gender) || null : null;
    return getDefaultAvatar(profile.name, genderId);
  }

  onPhotoError(event: Event, name: string): void {
    const image = event.target as HTMLImageElement;
    image.onerror = null;
    image.src = getDefaultAvatar(name);
  }

  getMatchScore(profile: MemberRecord): number {
    return 78 + (this.hashSeed(profile) % 20);
  }

  getMemberCode(profile: MemberRecord, index: number): string {
    const seed = 10000 + ((this.hashSeed(profile) + index * 17) % 89999);
    return `MES1${seed}`;
  }

  getHeight(profile: MemberRecord, index: number): string {
    return this.heights[(this.hashSeed(profile) + index) % this.heights.length];
  }

  getReligion(profile: MemberRecord, index: number): string {
    const opts = this.religionOptions();
    if (opts.length === 0) return '';
    return opts[(this.hashSeed(profile) + index) % opts.length].label;
  }

  getCaste(profile: MemberRecord, index: number): string {
    const opts = this.casteOptions();
    if (opts.length === 0) return '';
    return opts[(this.hashSeed(profile) + index) % opts.length].label;
  }

  openProfile(profile: MemberRecord): void {
    this.router.navigate(['/profiles', profile.id]);
  }

  goToPage(page: number): void {
    this.currentPage = Math.min(this.totalPages(), Math.max(1, page));
  }

  private hashSeed(profile: MemberRecord): number {
    const source = `${profile.id}-${profile.email}-${profile.name}`.toLowerCase();
    let hash = 0;
    for (let i = 0; i < source.length; i += 1) {
      hash = (hash << 5) - hash + source.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  search(form?: NgForm): void {
    this.error.set('');

    if (form && form.invalid) {
      this.error.set('Use letters, spaces, dot or hyphen only in filters.');
      return;
    }

    const normalized = {
      ...this.filters,
      name: this.filters.name.trim(),
      location: this.filters.location.trim(),
      occupation: this.filters.occupation.trim(),
    };

    this.filters = normalized;
    this.currentPage = 1;
    this.performSearch();
  }

  private performSearch(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.memberService
      .searchProfiles({
        name: this.filters.name,
        location: this.filters.location,
        occupation: this.filters.occupation,
        ageMin: this.filters.ageMin,
        ageMax: this.filters.ageMax,
        religion: this.filters.religion || undefined,
        caste: this.filters.caste || undefined,
        education: this.filters.education || undefined,
        maritalStatus: this.filters.maritalStatus || undefined,
        pageNumber: this.currentPage,
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.results.set(response);
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Search failed:', error);
          this.error.set('Search failed. Please try again.');
        },
      });
  }
}
