import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { MemberRecord, MemberService } from '../../services/member.service';
import { getDefaultAvatar, resolvePhotoUrl } from '../../utils/default-avatar';
import { RegisterMasterDataService, RegisterLookupOption } from '../../services/register-master-data.service';
import { AuthService } from '../../services/auth.service';
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
  private readonly registerMasterData = inject(RegisterMasterDataService);
  private readonly authService = inject(AuthService);

  readonly isAuthenticated = signal(false);
  readonly userName = signal('');
  readonly userFirstName = signal('');
  readonly userPhotoUrl = signal('');
  readonly userOccupation = signal('');

  religionOptions = signal<RegisterLookupOption[]>([]);
  casteOptions = signal<RegisterLookupOption[]>([]);
  educationOptions = signal<RegisterLookupOption[]>([]);
  maritalStatusOptions = signal<RegisterLookupOption[]>([]);
  occupationOptions = signal<RegisterLookupOption[]>([]);
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

  sortBy = signal('relevance');
  currentPage = signal(1);
  readonly pageSize = 5;

  results = signal<MemberRecord[]>([]);
  error = signal('');
  isLoading = signal(false);

  ngOnInit(): void {
    this.isAuthenticated.set(this.authService.isAuthenticated());
    if (this.isAuthenticated()) {
      this.loadMyProfile();
    } else {
      this.performSearch();
    }
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

        if (genderId) {
          this.filters.lookingFor = genderId === 1 ? 'Bride' : 'Groom';
        }
        this.performSearch();
      },
      error: () => {},
    });
  }

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
    Array.from({ length: this.totalPages() }, (_, idx) => idx + 1).slice(0, 5),
  );

  constructor() {
    this.loadFilterOptions();
  }

  loadFilterOptions(): void {
    this.registerMasterData.getReligions().subscribe({
      next: (opts) => this.religionOptions.set(opts),
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

  getProfilePhotoUrl(profile: MemberRecord): string {
    const genderId = profile.registrationDetails?.personal?.gender ? Number(profile.registrationDetails.personal.gender) || null : null;
    return getDefaultAvatar(profile.name, genderId);
  }

  onPhotoError(event: Event, name: string): void {
    const image = event.target as HTMLImageElement;
    image.onerror = null;
    image.src = getDefaultAvatar(name);
  }

  getReligionLabel(profile: MemberRecord): string {
    if (!profile.religionId) return '';
    const match = this.religionOptions().find(r => r.id === profile.religionId);
    return match?.label ?? '';
  }

  getCasteLabel(profile: MemberRecord): string {
    if (!profile.casteId) return '';
    const match = this.casteOptions().find(c => c.id === profile.casteId);
    return match?.label ?? '';
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

  openProfile(profile: MemberRecord): void {
    this.router.navigate(['/profiles', profile.id]);
  }

  goToPage(page: number): void {
    this.currentPage.set(Math.min(this.totalPages(), Math.max(1, page)));
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
    this.currentPage.set(1);
    this.performSearch();
  }

  private performSearch(): void {
    this.isLoading.set(true);
    this.error.set('');

    const searchGenderId = this.filters.lookingFor === 'Bride' ? 2 : 1;

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
        pageNumber: this.currentPage(),
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
