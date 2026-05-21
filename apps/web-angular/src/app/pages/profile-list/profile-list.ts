import { Component, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { MemberRecord, MemberService } from '../../services/member.service';
import { MasterDataService, MasterDataItem } from '../../services/master-data.service';
import { ProfileListSidebarComponent } from './components/profile-list-sidebar.component';
import { ProfileListTitleComponent } from './components/profile-list-title.component';
import { ProfileListSearchPanelComponent } from './components/profile-list-search-panel.component';
import { ProfileListResultsComponent } from './components/profile-list-results.component';

@Component({
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
export class ProfileList {
  private readonly memberService = inject(MemberService);
  private readonly router = inject(Router);
  private readonly masterDataSvc = inject(MasterDataService);
  private readonly heights = ["5'0\"", "5'2\"", "5'4\"", "5'6\"", "5'8\""];

  religionOptions: MasterDataItem[] = [];
  casteOptions: MasterDataItem[] = [];
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

  results: MemberRecord[] = [];
  error = '';
  isLoading = false;

  constructor() {
    this.loadProfiles();
    this.loadFilterOptions();
  }

  async loadFilterOptions(): Promise<void> {
    try {
      const data = await this.masterDataSvc.getMultiple(['religion', 'caste']);
      this.religionOptions = data['religion'] ?? [];
      this.casteOptions = data['caste'] ?? [];
    } catch {
      // non-critical: filter dropdowns fall back to empty
    }
  }

  async loadProfiles(): Promise<void> {
    this.isLoading = true;
    try {
      const response = await this.memberService.getProfiles(this.currentPage, this.pageSize);
      this.results = response.profiles.map(p => ({
        id: `${p.profileId}`,
        email: p.email,
        name: p.fullName,
        age: p.age,
        occupation: p.occupationText,
        location: p.locationText,
        bio: p.bio,
        password: '',
        createdAt: p.createdAt,
      }));
    } catch (error) {
      console.error('Failed to load profiles:', error);
      this.error = 'Failed to load profiles. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  getProfilePhotoUrl(profile: MemberRecord): string {
    const seed = encodeURIComponent((profile.email || profile.id || profile.name).toLowerCase());
    return `https://i.pravatar.cc/180?u=${seed}`;
  }

  onPhotoError(event: Event, name: string): void {
    const image = event.target as HTMLImageElement;
    image.onerror = null;
    image.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=efe4d2&color=8f4228&size=180`;
  }

  get sortedResults(): MemberRecord[] {
    const items = [...this.results];
    if (this.sortBy === 'age-asc') {
      return items.sort((a, b) => (a.age ?? 99) - (b.age ?? 99));
    }
    if (this.sortBy === 'age-desc') {
      return items.sort((a, b) => (b.age ?? 0) - (a.age ?? 0));
    }
    return items.sort((a, b) => this.getMatchScore(b) - this.getMatchScore(a));
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.sortedResults.length / this.pageSize));
  }

  get pageResults(): MemberRecord[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sortedResults.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, idx) => idx + 1).slice(0, 5);
  }

  goToPage(page: number): void {
    this.currentPage = Math.min(this.totalPages, Math.max(1, page));
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
    if (this.religionOptions.length === 0) return '';
    return this.religionOptions[(this.hashSeed(profile) + index) % this.religionOptions.length].label;
  }

  getCaste(profile: MemberRecord, index: number): string {
    if (this.casteOptions.length === 0) return '';
    return this.casteOptions[(this.hashSeed(profile) + index) % this.casteOptions.length].label;
  }

  openProfile(profile: MemberRecord): void {
    this.router.navigate(['/profiles', profile.id]);
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
    this.error = '';

    if (form && form.invalid) {
      this.error = 'Use letters, spaces, dot or hyphen only in filters.';
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

  private async performSearch(): Promise<void> {
    this.isLoading = true;
    this.error = '';

    try {
      const response = await this.memberService.searchProfiles({
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
      });

      this.results = response;
    } catch (error) {
      console.error('Search failed:', error);
      this.error = 'Search failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
