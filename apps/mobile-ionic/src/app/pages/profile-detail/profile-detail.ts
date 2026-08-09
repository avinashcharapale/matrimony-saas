import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MemberRecord, MemberService } from '../../services/member.service';
import { AuthStore } from '@org/data-access-auth';
import { MatchClient } from '@org/generated';
import { finalize } from 'rxjs/operators';
import { TenantService } from '../../services/tenant.service';

interface ProfileField {
  label: string;
  value: string;
}

interface ProfileSection {
  title: string;
  fields: ProfileField[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profile-detail',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './profile-detail.html',
  styleUrl: './profile-detail.css',
})
export class ProfileDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly memberService = inject(MemberService);
  private readonly authStore = inject(AuthStore);
  private readonly http = inject(HttpClient);
  private readonly matchClient = inject(MatchClient);
  private readonly tenantService = inject(TenantService);

  readonly profile = signal<MemberRecord | null>(null);
  readonly currentPhotoIndex = signal(0);
  readonly isGalleryOpen = signal(false);
  readonly currentGalleryIndex = signal(0);
  readonly showUpgradePrompt = signal(false);
  readonly isSendingInterest = signal(false);
  readonly interestSent = signal(false);
  readonly existingInterestStatus = signal<string | null>(null);
  readonly isLoading = signal(true);

  readonly isVisitor = computed(() => !this.authStore.isAuthenticated());
  readonly isFreeUser = computed(() => this.authStore.isAuthenticated());
  readonly isPaidUser = computed(() => false);

  private myProfileId = 0;

  readonly galleryPhotos = computed(() => {
    const p = this.profile();
    const photos = p?.registrationDetails?.photos ?? [];
    const genderId = p?.registrationDetails?.personal?.gender ? Number(p.registrationDetails.personal.gender) || null : null;
    const seed = encodeURIComponent((p?.email || p?.id || p?.name || '').toLowerCase());
    const urls: string[] = [];
    for (let i = 0; i < Math.min(photos.length, 3); i++) {
      const photo = photos[i] as any;
      const url = photo.fileUrl ?? photo.FileUrl;
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        urls.push(url);
      } else {
        urls.push(`https://i.pravatar.cc/300?u=${seed}-${i}`);
      }
    }
    if (urls.length === 0) urls.push(`https://i.pravatar.cc/300?u=${seed}`);
    return urls.slice(0, 3);
  });

  readonly sections = computed(() => {
    const p = this.profile();
    const details = p?.registrationDetails;
    const personal = details?.personal;
    const horoscope = details?.horoscope;
    const professional = details?.professional;
    const contact = details?.contact;
    const family = details?.family;
    const expectations = details?.expectations;

    const sections: ProfileSection[] = [];

    if (this.flagEnabled('profileSectionDetails')) {
      sections.push({
        title: 'Personal Details',
        fields: [
          this.field('Full Name', p?.name || this.joinNames(personal?.firstName, personal?.middleName, personal?.lastName)),
          this.field('Date of Birth', this.dateText(personal?.dobDay, personal?.dobMonth, personal?.dobYear)),
          this.field('Age', p?.age),
          this.field('Height', this.heightText(personal?.heightFt, personal?.heightIn)),
          this.field('Weight', personal?.weightKg),
          this.field('Gender', personal?.gender),
          this.field('Religion', personal?.religion),
          this.field('Blood Group', personal?.bloodGroup),
          this.field('Complexion', personal?.complexion),
          this.field('Diet', personal?.diet),
          this.field('Marital Status', personal?.maritalStatus),
        ].filter((f): f is ProfileField => f !== null),
      });
    }

    if (this.flagEnabled('profileSectionHoroscope')) {
      sections.push({
        title: 'Horoscope',
        fields: [
          this.field('Manglik', horoscope?.manglik),
          this.field('Rashi', horoscope?.rashi),
          this.field('Nakshatra', horoscope?.nakshatra),
          this.field('Birth Time', this.timeText(horoscope?.birthHour, horoscope?.birthMinute, horoscope?.birthPeriod)),
          this.field('Birth District', horoscope?.birthDistrict, 'profileFieldBirthPlace'),
        ].filter((f): f is ProfileField => f !== null),
      });
    }

    sections.push({
      title: 'Education & Occupation',
      fields: [
        this.field('Education', professional?.education || p?.bio),
        this.field('Occupation', professional?.occupationDetails || p?.occupation),
        this.field('Working City', professional?.workingCityCountry),
        this.field('Income', professional?.incomeAmount),
      ].filter((f): f is ProfileField => f !== null),
    });

    if (this.flagEnabled('profileSectionContact')) {
      sections.push({
        title: 'Address & Contact',
        fields: [
          this.field('Address', contact?.residenceAddress || p?.location),
          this.field('Email', contact?.contactEmail || p?.email),
          this.field('Mobile', contact?.smsMobile),
          this.field('Phone', contact?.phonePrimary),
        ].filter((f): f is ProfileField => f !== null),
      });
    }

    if (this.flagEnabled('profileSectionFamily')) {
      sections.push({
        title: 'Family Background',
        fields: [
          this.field('Father', family?.fatherStatus),
          this.field('Mother', family?.motherStatus),
          this.field('Brothers', family?.brothers),
          this.field('Sisters', family?.sisters),
          this.field('Native District', family?.nativeDistrict),
          this.field('Native Taluka', family?.nativeTaluka),
        ].filter((f): f is ProfileField => f !== null),
      });
    }

    if (this.flagEnabled('profileSectionExpectations')) {
      sections.push({
        title: 'Expectations',
        fields: [
          this.field('Preferred Cities', expectations?.preferredCities),
          this.field('Expected Caste', expectations?.expectedCaste),
          this.field('Expected Height', this.heightText(expectations?.expectedHeightFt, expectations?.expectedHeightIn)),
          this.field('Expected Education', expectations?.expectedEducation),
          this.field('Expected Occupation', expectations?.expectedOccupationIncome),
        ].filter((f): f is ProfileField => f !== null),
      });
    }

    return sections;
  });

  ngOnInit(): void {
    const profileId = this.route.snapshot.paramMap.get('id');
    if (profileId) {
      this.isLoading.set(true);
      const numericId = parseInt(profileId.split('-')[1] || profileId, 10);
      if (!isNaN(numericId)) {
        this.memberService.getProfileByIdFromApi(numericId).pipe(
          finalize(() => this.isLoading.set(false)),
        ).subscribe({
          next: (record) => {
            if (record) {
              this.profile.set(record);
              this.checkExistingInterest(numericId);
            } else {
              this.profile.set(this.memberService.getProfileById(profileId));
            }
          },
          error: () => {
            this.profile.set(this.memberService.getProfileById(profileId));
          },
        });
      } else {
        this.profile.set(this.memberService.getProfileById(profileId));
        this.isLoading.set(false);
      }
    }
  }

  private checkExistingInterest(targetProfileId: number): void {
    if (!this.authStore.isAuthenticated()) return;

    const userId = this.authStore.userId();
    if (!userId || userId === targetProfileId) return;

    this.myProfileId = userId;

    this.matchClient.getInterestRequestsByRequester(userId).subscribe({
      next: (requests: any[]) => {
        if (!requests) return;
        const existing = requests.find((r: any) => r.targetProfileId === targetProfileId);
        if (existing) {
          const status = String(existing.status ?? 'Pending');
          this.existingInterestStatus.set(status);
          if (status !== 'Declined' && status !== 'Withdrawn') {
            this.interestSent.set(true);
          }
        }
      },
      error: () => {},
    });
  }

  getProfilePhoto(secondary = false): string {
    const p = this.profile();
    if (!p) return '';
    const photos = p.registrationDetails?.photos ?? [];
    const genderId = p.registrationDetails?.personal?.gender ? Number(p.registrationDetails.personal.gender) || null : null;
    const seed = encodeURIComponent((p.email || p.id || p.name).toLowerCase());

    if (secondary && photos.length > 1) {
      const url = (photos[1] as any).fileUrl ?? (photos[1] as any).FileUrl;
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) return url;
      return `https://i.pravatar.cc/300?u=${seed}-alt`;
    }
    if (photos.length > 0) {
      const url = (photos[0] as any).fileUrl ?? (photos[0] as any).FileUrl;
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) return url;
    }
    return `https://i.pravatar.cc/300?u=${seed}`;
  }

  getMemberId(): string {
    const p = this.profile();
    if (!p) return '';
    const seed = this.hashSeed(p);
    const code = 10000 + (seed % 89999);
    return `MBU${code}`;
  }

  nextPhoto(): void {
    if ((this.profile()?.registrationDetails?.photos.length ?? 0) > 1) {
      this.currentPhotoIndex.update(i => (i + 1) % 2);
    }
  }

  prevPhoto(): void {
    if ((this.profile()?.registrationDetails?.photos.length ?? 0) > 1) {
      this.currentPhotoIndex.update(i => (i - 1 + 2) % 2);
    }
  }

  openGallery(): void {
    this.isGalleryOpen.set(true);
    this.currentGalleryIndex.set(0);
  }

  closeGallery(): void {
    this.isGalleryOpen.set(false);
  }

  nextGalleryPhoto(): void {
    this.currentGalleryIndex.update(i => (i + 1) % this.galleryPhotos().length);
  }

  prevGalleryPhoto(): void {
    this.currentGalleryIndex.update(i => (i - 1 + this.galleryPhotos().length) % this.galleryPhotos().length);
  }

  goToGalleryPhoto(index: number): void {
    this.currentGalleryIndex.set(index);
  }

  onConnect(): void {
    if (this.isVisitor()) {
      this.router.navigate(['/register']);
      return;
    }
    if (this.interestSent() || this.existingInterestStatus()) {
      return;
    }

    const p = this.profile();
    if (!p) return;

    const targetProfileId = parseInt(p.id, 10);
    if (isNaN(targetProfileId)) return;

    this.isSendingInterest.set(true);

    this.http.post('/match/InterestRequests', {
      targetProfileId,
      message: '',
    }).pipe(
      finalize(() => this.isSendingInterest.set(false)),
    ).subscribe({
      next: () => {
        this.interestSent.set(true);
        this.existingInterestStatus.set('Pending');
      },
      error: (err: unknown) => {
        console.error('Failed to send interest:', err);
      },
    });
  }

  dismissUpgradePrompt(): void {
    this.showUpgradePrompt.set(false);
  }

  goToPlans(): void {
    this.router.navigate(['/plans']);
  }

  private field(label: string, value: unknown, flagCode?: string): ProfileField | null {
    if (flagCode && !this.flagEnabled(flagCode)) return null;
    const text = `${value ?? ''}`.trim();
    return { label, value: text || '-' };
  }

  flagEnabled(code: string): boolean {
    return this.tenantService.flagEnabled(code);
  }

  private dateText(day?: string, month?: string, year?: string): string {
    const parts = [day, month, year].filter(Boolean);
    return parts.length ? parts.join('/') : '-';
  }

  private timeText(hour?: string, minute?: string, period?: string): string {
    if (!hour && !minute && !period) {
      return '-';
    }
    return `${hour || '00'}:${minute || '00'} ${period || ''}`.trim();
  }

  private heightText(ft?: string, inch?: string): string {
    if (!ft && !inch) {
      return '-';
    }
    return `${ft || '0'} ft ${inch || '0'} in`;
  }

  private joinNames(first?: string, middle?: string, last?: string): string {
    return [first, middle, last].filter(Boolean).join(' ');
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
}
