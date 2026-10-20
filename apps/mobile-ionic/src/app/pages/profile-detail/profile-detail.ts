import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MemberRecord, MemberService } from '../../services/member.service';
import { AuthStore } from '@org/data-access-auth';
import { MatchClient, ProfileClient, SubscriptionClient } from '@org/generated';
import { RegisterMasterDataService } from '@org/data-access-registration';
import { finalize } from 'rxjs/operators';
import { TenantService } from '../../services/tenant.service';
import { getDefaultAvatar, resolvePhotoUrl } from '../../utils/default-avatar';

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
  private readonly profileClient = inject(ProfileClient);
  private readonly subscriptionClient = inject(SubscriptionClient);
  private readonly masterData = inject(RegisterMasterDataService);
  private readonly tenantService = inject(TenantService);

  readonly profile = signal<MemberRecord | null>(null);
  readonly currentPhotoIndex = signal(0);
  readonly isGalleryOpen = signal(false);
  readonly currentGalleryIndex = signal(0);
  readonly showUpgradePrompt = signal(false);
  readonly isSendingInterest = signal(false);
  readonly interestSent = signal(false);
  readonly interestError = signal<string | null>(null);
  readonly existingInterestStatus = signal<string | null>(null);
  readonly isShortlisted = signal(false);
  readonly isTogglingShortlist = signal(false);
  readonly shortlistError = signal<string | null>(null);
  readonly isContactUnlocked = signal(false);
  readonly subscriptionActive = signal(false);
  readonly isLoading = signal(true);
  readonly educationMap = signal<Map<number, string>>(new Map());
  readonly occupationMap = signal<Map<number, string>>(new Map());
  readonly casteMap = signal<Map<number, string>>(new Map());

  readonly isVisitor = computed(() => !this.authStore.isAuthenticated());
  readonly isFreeUser = computed(() => this.authStore.isAuthenticated() && !this.subscriptionActive());
  readonly isPaidUser = computed(() => this.subscriptionActive());

  private readonly visibilityMask = '•• ••••••';

  private get canViewAll(): boolean {
    const pv = this.profile()?.planVisibility;
    if (!pv) return true;
    return !!pv.canViewEducation && !!pv.canViewOccupation && !!pv.canViewHoroscope && !!pv.canViewFamily && !!pv.canViewPhotos;
  }

  readonly anyGatedContent = computed(() => {
    const pv = this.profile()?.planVisibility;
    return !pv
      ? false
      : !pv.canViewEducation || !pv.canViewOccupation || !pv.canViewHoroscope || !pv.canViewFamily;
  });

  readonly planUpgradePrompt = computed(() =>
    this.subscriptionActive() && !this.canViewAll,
  );

  private myProfileId = 0;

  readonly galleryPhotos = computed(() => {
    const p = this.profile();
    const photos = p?.registrationDetails?.photos ?? [];
    const genderId = p?.genderId ?? (p?.registrationDetails?.personal?.gender ? Number(p.registrationDetails.personal.gender) || null : null);
    const urls: string[] = [];
    for (let i = 0; i < Math.min(photos.length, 3); i++) {
      const photo = photos[i] as unknown as { fileUrl?: string; FileUrl?: string };
      urls.push(resolvePhotoUrl(photo.fileUrl ?? photo.FileUrl, p?.name, genderId));
    }
    if (urls.length === 0) urls.push(getDefaultAvatar(p?.name, genderId));
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

    const pv = p?.planVisibility;
    const canViewEducation = pv?.canViewEducation ?? true;
    const canViewOccupation = pv?.canViewOccupation ?? true;
    const canViewHoroscope = pv?.canViewHoroscope ?? true;
    const canViewFamily = pv?.canViewFamily ?? true;

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
          this.field('Caste', personal?.caste),
          this.field('Sub Caste', personal?.subCast),
          this.field('Blood Group', personal?.bloodGroup),
          this.field('Spectacles / Lens', `${personal?.spectacles || '-'} / ${personal?.lens || '-'}`),
          this.field('Complexion', personal?.complexion),
          this.field('Diet', personal?.diet),
          this.field('Marital Status', personal?.maritalStatus),
        ].filter((f): f is ProfileField => f !== null),
      });
    }

    if (this.flagEnabled('profileSectionHoroscope')) {
      const mask = !canViewHoroscope;
      sections.push({
        title: 'Horoscope',
        fields: [
          this.field('Manglik', mask ? this.visibilityMask : horoscope?.manglik),
          this.field('Rashi', mask ? this.visibilityMask : horoscope?.rashi),
          this.field('Nakshatra', mask ? this.visibilityMask : horoscope?.nakshatra),
          this.field('Charan', mask ? this.visibilityMask : horoscope?.charan),
          this.field('Gotra / Devak', mask ? this.visibilityMask : horoscope?.devak),
          this.field('Birth Time', mask ? this.visibilityMask : this.timeText(horoscope?.birthHour, horoscope?.birthMinute, horoscope?.birthPeriod)),
          this.field('Birth District', mask ? this.visibilityMask : horoscope?.birthDistrict, 'profileFieldBirthPlace'),
        ].filter((f): f is ProfileField => f !== null),
      });
    }

    const eduMask = !canViewEducation;
    const occMask = !canViewOccupation;
    sections.push({
      title: 'Education & Occupation',
      fields: [
        this.field('Education', eduMask ? this.visibilityMask : professional?.education || p?.bio),
        this.field('Occupation', occMask ? this.visibilityMask : professional?.occupationDetails || p?.occupation),
        this.field('Working City', occMask ? this.visibilityMask : professional?.workingCityCountry),
        this.field('Income', occMask ? this.visibilityMask : professional?.incomeAmount),
      ].filter((f): f is ProfileField => f !== null),
    });

    if (this.flagEnabled('profileSectionContact')) {
      const unlocked = this.isContactUnlocked();
      sections.push({
        title: 'Address & Contact',
        fields: this.isVisitor() || !unlocked
          ? []
          : [
              this.field('Address', contact?.residenceAddress || p?.location),
              this.field('Email', contact?.contactEmail || p?.email),
              this.field('Mobile', contact?.smsMobile),
              this.field('Secondary Mobile', contact?.mobileSecondary),
              this.field('Phone', contact?.phonePrimary),
            ].filter((f): f is ProfileField => f !== null),
      });
    }

    if (this.flagEnabled('profileSectionFamily')) {
      const mask = !canViewFamily;
      sections.push({
        title: 'Family Background',
        fields: [
          this.field('Father', mask ? this.visibilityMask : family?.fatherStatus),
          this.field('Mother', mask ? this.visibilityMask : family?.motherStatus),
          this.field('Brothers', mask ? this.visibilityMask : family?.brothers),
          this.field('Sisters', mask ? this.visibilityMask : family?.sisters),
          this.field('Mama', mask ? this.visibilityMask : family?.mamaSurnamePlace),
          this.field('Native District', mask ? this.visibilityMask : family?.nativeDistrict),
          this.field('Native Taluka', mask ? this.visibilityMask : family?.nativeTaluka),
          this.field('Relatives', mask ? this.visibilityMask : family?.relativesSurnames),
          this.field('Parents Residing In', mask ? this.visibilityMask : family?.parentsResidentCity),
          this.field('Family Wealth', mask ? this.visibilityMask : family?.familyWealth),
        ].filter((f): f is ProfileField => f !== null),
      });
    }

    if (this.flagEnabled('profileSectionExpectations')) {
      sections.push({
        title: 'Expectations',
        fields: [
          this.field('Preferred Cities', expectations?.preferredCities),
          this.field('Age Difference Up To', expectations?.maxAgeDifference),
          this.field(
            'Expected Caste',
            this.resolveExpectation(
              expectations?.expectedCasteNoBar,
              expectations?.expectedCasteIds,
              this.casteMap(),
              expectations?.expectedCaste,
            ),
          ),
          this.field('Expected Height', this.heightText(expectations?.expectedHeightFt, expectations?.expectedHeightIn)),
          this.field(
            'Expected Education',
            this.resolveExpectation(
              expectations?.expectedEducationNoBar,
              expectations?.expectedEducationIds,
              this.educationMap(),
              expectations?.expectedEducation,
            ),
          ),
          this.field(
            'Expected Occupation',
            this.resolveExpectation(
              expectations?.expectedOccupationNoBar,
              expectations?.expectedOccupationIds,
              this.occupationMap(),
              expectations?.expectedOccupationIncome,
            ),
          ),
          this.field('Divorce', expectations?.divorcee),
          this.field('Mangal', expectations?.expectedManglik),
        ].filter((f): f is ProfileField => f !== null),
      });
    }

    return sections;
  });

  ngOnInit(): void {
    const profileId = this.route.snapshot.paramMap.get('id');
    if (!profileId) {
      this.profile.set(null);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.profile.set(null);

    const numericId = parseInt(profileId.split('-')[1] || profileId, 10);
    if (isNaN(numericId)) {
      this.isLoading.set(false);
      return;
    }

    this.loadMasterData();

    const viewProfile = (): void => {
      this.memberService.getProfileByIdFromApi(numericId, this.authStore.isAuthenticated()).pipe(
        finalize(() => this.isLoading.set(false)),
      ).subscribe({
        next: (record) => {
          if (record) {
            this.profile.set(record);
            this.isContactUnlocked.set(record.isContactUnlocked === true);
            this.loadCastesForProfile(record);
            this.afterProfileLoaded();
          }
        },
        error: () => this.profile.set(null),
      });
    };

    if (!this.authStore.isAuthenticated()) {
      viewProfile();
      return;
    }

    const userId = this.authStore.userId();
    if (userId) {
      this.subscriptionClient.getUserSubscriptionStatus(userId).subscribe({
        next: (status) => this.subscriptionActive.set((status?.isActive ?? false) && !(status?.isTrial ?? false)),
      });
    }

    this.profileClient.getMyProfile().subscribe({
      next: (myProfile) => {
        const mp = myProfile as unknown as Record<string, unknown>;
        this.myProfileId = Number(mp['profileId'] ?? mp['userId'] ?? userId ?? 0);
        viewProfile();
      },
      error: () => viewProfile(),
    });
  }

  private loadMasterData(): void {
    this.masterData.getEducations().subscribe({
      next: (opts) => this.educationMap.set(new Map(opts.map((o) => [o.id, o.label]))),
      error: () => { /* noop */ },
    });
    this.masterData.getOccupations().subscribe({
      next: (opts) => this.occupationMap.set(new Map(opts.map((o) => [o.id, o.label]))),
      error: () => { /* noop */ },
    });
  }

  private loadCastesForProfile(record: MemberRecord): void {
    const religionName = record.registrationDetails?.personal?.religion;
    if (!religionName) return;
    this.masterData.getReligions().subscribe({
      next: (religions) => {
        const match = religions.find((r) => r.label === religionName);
        if (!match) return;
        this.masterData.getCastes(match.id).subscribe({
          next: (opts) => this.casteMap.set(new Map(opts.map((o) => [o.id, o.label]))),
          error: () => { /* noop */ },
        });
      },
      error: () => { /* noop */ },
    });
  }

  private afterProfileLoaded(): void {
    const p = this.profile();
    if (!p) return;

    const targetProfileId = parseInt(p.id, 10);
    if (!this.authStore.isAuthenticated() || !this.myProfileId || isNaN(targetProfileId)) {
      return;
    }

    if (this.myProfileId !== targetProfileId) {
      this.matchClient.recordProfileView({ viewedProfileId: targetProfileId }).subscribe({ error: () => { /* noop */ } });

      this.matchClient.getShortlistsByProfile(this.myProfileId).subscribe({
        next: (shortlists) => {
          if (shortlists) {
            this.isShortlisted.set(shortlists.some((s) => s.targetProfileId === targetProfileId));
          }
        },
        error: () => { /* noop */ },
      });
    }

    this.checkExistingInterest(targetProfileId);
  }

  private checkExistingInterest(targetProfileId: number): void {
    if (!this.myProfileId) return;

    this.matchClient.getInterestRequestsByRequester(this.myProfileId).subscribe({
      next: (requests) => {
        if (!requests) return;
        const existing = requests.find((r) => r.targetProfileId === targetProfileId);
        if (existing) {
          const status = String(existing.status ?? 'Pending');
          this.existingInterestStatus.set(status);
          if (status !== 'Declined' && status !== 'Withdrawn') {
            this.interestSent.set(true);
          }
        }
      },
      error: () => { /* noop */ },
    });
  }

  getProfilePhoto(secondary = false): string {
    const p = this.profile();
    if (!p) return '';
    const photos = p.registrationDetails?.photos ?? [];
    const genderId = p.genderId ?? (p.registrationDetails?.personal?.gender ? Number(p.registrationDetails.personal.gender) || null : null);

    const typedPhotos = photos as unknown as Array<{ fileUrl?: string; FileUrl?: string }>;
    if (secondary && typedPhotos.length > 1) {
      return resolvePhotoUrl(typedPhotos[1].fileUrl ?? typedPhotos[1].FileUrl, p.name, genderId);
    }
    if (typedPhotos.length > 0) {
      return resolvePhotoUrl(typedPhotos[0].fileUrl ?? typedPhotos[0].FileUrl, p.name, genderId);
    }
    return getDefaultAvatar(p.name, genderId);
  }

  getMemberId(): string {
    const p = this.profile();
    if (!p) return '';
    if (p.profileCode) return p.profileCode;
    const seed = this.hashSeed(p);
    const code = 10000 + (seed % 89999);
    return `MBU${code}`;
  }

  nextPhoto(): void {
    const count = this.galleryPhotos().length;
    if (count > 1) {
      this.currentPhotoIndex.update(i => (i + 1) % count);
    }
  }

  prevPhoto(): void {
    const count = this.galleryPhotos().length;
    if (count > 1) {
      this.currentPhotoIndex.update(i => (i - 1 + count) % count);
    }
  }

  getReligionTag(): string {
    return this.profile()?.registrationDetails?.personal?.religion ?? '';
  }

  getCasteTag(): string {
    return this.profile()?.registrationDetails?.personal?.caste ?? '';
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
    if (this.isFreeUser() && !this.existingInterestStatus()) {
      this.showUpgradePrompt.set(true);
      return;
    }
    this.sendInterest();
  }

  dismissUpgradePrompt(): void {
    this.showUpgradePrompt.set(false);
  }

  goToPlans(): void {
    this.router.navigate(['/plans']);
  }

  private sendInterest(): void {
    const p = this.profile();
    if (!p || this.isSendingInterest() || this.interestSent() || this.existingInterestStatus()) return;

    const targetProfileId = parseInt(p.id, 10);
    if (isNaN(targetProfileId)) return;

    this.isSendingInterest.set(true);
    this.interestError.set(null);
    const tenantId = Number(this.tenantService.tenantHeaderId);

    this.http.post('/match/InterestRequests', {
      targetProfileId,
      message: '',
    }, {
      headers: tenantId ? { 'X-Tenant-Id': String(tenantId) } : {},
    }).pipe(
      finalize(() => this.isSendingInterest.set(false)),
    ).subscribe({
      next: () => {
        this.interestSent.set(true);
        this.existingInterestStatus.set('Pending');
      },
      error: (err: unknown) => {
        this.interestError.set(this.extractErrorMessage(err));
      },
    });
  }

  toggleShortlist(): void {
    if (this.isVisitor()) {
      this.router.navigate(['/register']);
      return;
    }
    if (this.isTogglingShortlist()) return;

    const targetProfileId = parseInt(this.profile()?.id ?? '', 10);
    if (isNaN(targetProfileId) || !this.myProfileId) return;

    this.isTogglingShortlist.set(true);
    this.shortlistError.set(null);

    if (this.isShortlisted()) {
      this.matchClient.getShortlistsByProfile(this.myProfileId).pipe(
        finalize(() => this.isTogglingShortlist.set(false)),
      ).subscribe({
        next: (shortlists) => {
          const existing = shortlists.find(s => s.targetProfileId === targetProfileId);
          if (existing?.shortlistId) {
            this.matchClient.deleteShortlist(existing.shortlistId).subscribe({
              next: () => this.isShortlisted.set(false),
              error: (err: unknown) => this.shortlistError.set(this.extractErrorMessage(err)),
            });
          }
        },
        error: (err: unknown) => this.shortlistError.set(this.extractErrorMessage(err)),
      });
    } else {
      this.matchClient.addShortlist({
        profileId: this.myProfileId,
        targetProfileId,
      }).pipe(
        finalize(() => this.isTogglingShortlist.set(false)),
      ).subscribe({
        next: () => this.isShortlisted.set(true),
        error: (err: unknown) => this.shortlistError.set(this.extractErrorMessage(err)),
      });
    }
  }

  private extractErrorMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const httpErr = err as { error: unknown };
      if (httpErr.error && typeof httpErr.error === 'object' && 'message' in httpErr.error) {
        return (httpErr.error as { message: string }).message;
      }
      if (typeof httpErr.error === 'string') {
        return httpErr.error;
      }
    }
    return 'Something went wrong. Please try again.';
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

  private resolveExpectation(
    noBar: boolean | undefined,
    ids: number[] | undefined,
    map: Map<number, string>,
    fallback?: string,
  ): string {
    if (noBar) return 'No Bar';
    const resolved = (ids ?? [])
      .map((id) => map.get(id))
      .filter((label): label is string => !!label);
    if (resolved.length > 0) return resolved.join(', ');
    return fallback || '';
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