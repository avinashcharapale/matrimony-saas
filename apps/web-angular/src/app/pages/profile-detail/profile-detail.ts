import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MemberRecord, MemberService } from '../../services/member.service';
import { RegisterFormDetails, createEmptyRegisterFormDetails } from '@org/models';
import { getDefaultAvatar, resolvePhotoUrl } from '../../utils/default-avatar';
import { finalize, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { SubscriptionStore } from '@org/data-access-subscription';
import { TenantService } from '../../services/tenant.service';
import { RegisterMasterDataService } from '../../services/register-master-data.service';
import { MatchClient } from '@org/generated';

interface ProfileField {
  label: string;
  value: string;
}

interface ProfileSection {
  title: string;
  fields: ProfileField[];
}

interface DbPersonalSection {
  FirstName?: string;
  MiddleName?: string;
  LastName?: string;
  DobDay?: number | string;
  DobMonth?: string;
  DobYear?: number | string;
  Gender?: string;
  Religion?: string;
  Caste?: string;
  SubCast?: string;
  MaritalStatus?: string;
  HeightFt?: number | string;
  HeightIn?: number | string;
  WeightKg?: number | string;
  BloodGroup?: string;
  Complexion?: string;
  PhysicalDisability?: boolean;
  DisabilityDetail?: string;
  Diet?: string;
  Spectacles?: boolean;
  Lens?: boolean;
  Personality?: string;
  GenderId?: number;
  ReligionId?: number;
  CasteId?: number;
  SubCasteId?: number;
  MaritalStatusId?: number;
}

interface DbHoroscopeSection {
  Manglik?: boolean;
  Rashi?: string;
  Nakshatra?: string;
  Charan?: string;
  Nadi?: string;
  Gan?: string;
  BirthHour?: number | string;
  BirthMinute?: number | string;
  BirthPeriod?: string;
  BirthDistrict?: string;
  Devak?: string;
}

interface DbProfessionalSection {
  EducationArea?: string;
  Education?: string;
  OccupationType?: string;
  OccupationDetails?: string;
  WorkingCityCountry?: string;
  IncomeAmount?: number | string;
  IncomePeriod?: string;
}

interface DbContactSection {
  IdProofNumber?: string;
  ResidenceAddress?: string;
  ContactEmail?: string;
  SmsMobile?: string;
  MobileSecondary?: string;
  PhonePrimary?: string;
  PhoneSecondary?: string;
}

interface DbFamilySection {
  FatherStatus?: boolean;
  MotherStatus?: boolean;
  Brothers?: number | string;
  MarriedBrothers?: number | string;
  Sisters?: number | string;
  MarriedSisters?: number | string;
  ParentsFullName?: string;
  ParentsOccupation?: string;
  ParentsResidentCity?: string;
  RelativesSurnames?: string;
  FamilyWealth?: string;
  MamaSurnamePlace?: string;
  NativeDistrict?: string;
  NativeTaluka?: string;
  IntercastMarriage?: boolean;
  IntercastRelation?: string;
}

interface DbExpectationsSection {
  PreferredCities?: string;
  ExpectedManglik?: boolean;
  ExpectedCasteIds?: number[];
  ExpectedCasteNoBar?: boolean;
  ExpectedEducationIds?: number[];
  ExpectedEducationNoBar?: boolean;
  ExpectedOccupationIds?: number[];
  ExpectedOccupationNoBar?: boolean;
  MaxAgeDifference?: number | string;
  ExpectedHeightFt?: number | string;
  ExpectedHeightIn?: number | string;
  Divorcee?: boolean;
  expectedEducation?: string;
  expectedOccupationIncome?: string;
  maxAgeDifference?: string;
  expectedHeightFt?: string;
  expectedHeightIn?: string;
  divorcee?: string;
  expectedManglik?: string;
  preferredCities?: string;
}

interface DbVerificationSection {
  VerificationCode?: string;
  VerificationPassed?: boolean;
}

interface DbPhotoSection {
  PhotoSlot?: number | string;
  FileName?: string;
  FileUrl?: string;
  IsPrimary?: boolean;
}

interface MappedProfileDetail {
  profileId?: number;
  profileCode?: string;
  fullName?: string;
  displayName?: string;
  age?: number;
  occupationText?: string;
  locationText?: string;
  city?: string;
  bio?: string;
  createdAt?: string;
  email?: string;
  isContactUnlocked?: boolean;
  personal?: DbPersonalSection;
  horoscope?: DbHoroscopeSection;
  professional?: DbProfessionalSection;
  contact?: DbContactSection;
  family?: DbFamilySection;
  expectations?: DbExpectationsSection;
  verification?: DbVerificationSection;
  photos?: DbPhotoSection[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profile-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-detail.html',
  styleUrl: './profile-detail.css',
})
export class ProfileDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly memberService = inject(MemberService);
  private readonly authService = inject(AuthService);
  private readonly subscriptionStore = inject(SubscriptionStore);
  private readonly tenantService = inject(TenantService);
  private readonly http = inject(HttpClient);
  private readonly masterData = inject(RegisterMasterDataService);
  private readonly matchClient = inject(MatchClient);

  readonly profile = signal<MemberRecord | null>(null);
  readonly isGalleryOpen = signal(false);
  readonly currentGalleryIndex = signal(0);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly isContactUnlocked = signal(false);
  readonly showUpgradePrompt = signal(false);
  readonly isSendingInterest = signal(false);
  readonly interestSent = signal(false);
  readonly interestError = signal<string | null>(null);
  readonly existingInterestStatus = signal<string | null>(null);
  readonly isShortlisted = signal(false);
  readonly isTogglingShortlist = signal(false);
  readonly shortlistError = signal<string | null>(null);
  private myProfileId = 0;

  readonly educationMap = signal<Map<number, string>>(new Map());
  readonly occupationMap = signal<Map<number, string>>(new Map());
  readonly casteMap = signal<Map<number, string>>(new Map());

  readonly isPaidUser = computed(() => this.subscriptionStore.isActive());
  readonly isFreeUser = computed(() => this.authService.isAuthenticated() && !this.subscriptionStore.isActive());
  readonly isVisitor = computed(() => !this.authService.isAuthenticated());

  private static readonly MONTH_MAP: Record<string, number> = {
    Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
    Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
  };

  readonly profileCode = computed(() => this.profile()?.profileCode ?? '');

  readonly displayName = computed(() => {
    const p = this.profile();
    if (!p) return '';
    const surname = p.lastName || '';
    return `${p.profileCode || ''} ${surname ? '(' + surname + ')' : ''}`.trim();
  });

  readonly galleryPhotos = computed(() => {
    const p = this.profile();
    const slots = p?.registrationDetails?.photos ?? [];
    const genderId = p?.registrationDetails?.personal?.gender ? Number(p.registrationDetails.personal.gender) || null : null;
    const urls: string[] = [];
    for (let i = 0; i < Math.min(slots.length, 3); i++) {
      const photo = slots[i] as any;
      const url = resolvePhotoUrl(photo.fileUrl ?? photo.FileUrl, p?.name ?? '', genderId);
      urls.push(url);
    }
    if (urls.length === 0) urls.push(getDefaultAvatar(p?.name ?? '', genderId));
    return urls;
  });

  readonly sections = computed(() => {
    const details = this.profile()?.registrationDetails;
    const personal = details?.personal;
    const horoscope = details?.horoscope;
    const professional = details?.professional;
    const contact = details?.contact;
    const family = details?.family;
    const expectations = details?.expectations;
    const casteLookup = this.casteMap();

    const contactSection = this.isContactUnlocked()
      ? [{
          title: 'Contact',
          fields: [
            this.field('Email', contact?.contactEmail || this.profile()?.email),
            this.field('Address', contact?.residenceAddress || this.profile()?.location),
            this.field('Primary Mobile', contact?.smsMobile),
            this.field('Secondary Mobile', contact?.mobileSecondary),
          ],
        }]
      : [];

    return [
      {
        title: 'Profile Details',
        fields: [
          this.field('Date of Birth', this.dateText(personal?.dobDay, personal?.dobMonth, personal?.dobYear)),
          this.field('Height', this.heightText(personal?.heightFt, personal?.heightIn)),
          this.field('Sex', this.profileSex(personal)),
          this.field('Religion', personal?.religion),
          this.field('Caste', personal?.caste),
          this.field('Sub Caste', personal?.subCast),
          this.field('Education', professional?.education || this.profile()?.bio),
          this.field('Occupation', professional?.occupationDetails || this.profile()?.occupation),
          this.field('Blood Group / Weight', `${personal?.bloodGroup || '-'} / ${personal?.weightKg || 'N/A'}`),
          this.field('Spectacle / Lens', `${personal?.spectacles || '-'} / ${personal?.lens || '-'}`),
          this.field('Complexion', personal?.complexion),
          this.field('Birth Place', horoscope?.birthDistrict),
          this.field('Diet', personal?.diet),
          this.field(
            'Horoscope Details',
            `${horoscope?.rashi || '-'} / ${horoscope?.nakshatra || '-'} / ${horoscope?.charan || '-'}`,
          ),
          this.field('Gotra & Devak', horoscope?.devak),
          this.field('Mangal', horoscope?.manglik),
        ],
      },
      ...contactSection,
      {
        title: 'Family Background',
        fields: [
          this.field('Father', family?.fatherStatus),
          this.field('Mother', family?.motherStatus),
          this.field('Brother', family?.brothers),
          this.field('Sister', family?.sisters),
          this.field('Mama', family?.mamaSurnamePlace),
          this.field('Native Place', `${family?.nativeDistrict || ''} ${family?.nativeTaluka || ''}`),
          this.field('Relatives', family?.relativesSurnames),
          this.field('Parents Residing In', family?.parentsResidentCity),
          this.field('Family Wealth', family?.familyWealth),
        ],
      },
      {
        title: 'Expectations',
        fields: [
          this.field('Age Difference Up To', expectations?.maxAgeDifference),
          this.field('Expected Height', this.heightText(expectations?.expectedHeightFt, expectations?.expectedHeightIn)),
          this.field('Education', expectations?.expectedEducation),
          this.field('Occupation', expectations?.expectedOccupationIncome),
          this.field('Expected Caste', this.resolveExpectationIds(
            expectations?.expectedCasteIds,
            expectations?.expectedCasteNoBar,
            casteLookup,
          )),
          this.field('Divorce', expectations?.divorcee),
          this.field('Mangal', expectations?.expectedManglik),
          this.field('Preferred City', expectations?.preferredCities),
        ],
      },
    ];
  });

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      const userId = this.authService.getSession()?.userId ?? 0;
      if (userId) {
        this.subscriptionStore.loadSubscriptionStatus(userId).subscribe();
      }
    }

    this.loadMasterData();

    const profileIdParam = this.route.snapshot.paramMap.get('id');
    if (profileIdParam) {
      this.loadProfile(profileIdParam);
    } else {
      this.error.set('Profile ID not found.');
      this.isLoading.set(false);
    }
  }

  private loadMasterData(): void {
    this.masterData.getEducations().subscribe({
      next: (opts) => {
        const map = new Map<number, string>();
        opts.forEach(o => map.set(o.id, o.label));
        this.educationMap.set(map);
      },
      error: () => {},
    });
    this.masterData.getOccupations().subscribe({
      next: (opts) => {
        const map = new Map<number, string>();
        opts.forEach(o => map.set(o.id, o.label));
        this.occupationMap.set(map);
      },
      error: () => {},
    });
  }

  private loadProfile(profileId: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    const numericId = parseInt(profileId.split('-')[1] || profileId, 10);
    if (isNaN(numericId)) {
      this.error.set('Invalid profile ID.');
      this.isLoading.set(false);
      return;
    }

    this.memberService.getProfileById(numericId).pipe(
      finalize(() => {
        this.isLoading.set(false);
      })
    ).subscribe({
      next: (profileDetail: MappedProfileDetail) => {
        const registrationDetails = this.mapRegistrationDetails(profileDetail);
        this.isContactUnlocked.set(profileDetail.isContactUnlocked === true);
        this.profile.set({
          id: `${profileDetail.profileId ?? ''}`,
          profileCode: profileDetail.profileCode ?? String(profileDetail.profileId ?? ''),
          email: profileDetail.email ?? '',
          name: profileDetail.fullName ?? profileDetail.displayName ?? '',
          lastName: profileDetail.personal?.LastName ?? '',
          age: profileDetail.age,
          occupation: profileDetail.occupationText,
          location: profileDetail.locationText ?? profileDetail.city,
          bio: profileDetail.bio,
          password: '',
          createdAt: profileDetail.createdAt ?? new Date().toISOString(),
          registrationDetails,
        });

        const religionId = profileDetail.personal?.ReligionId;
        if (religionId) {
          this.masterData.getCastes(Number(religionId)).subscribe({
            next: (opts) => {
              const map = new Map<number, string>();
              opts.forEach(o => map.set(o.id, o.label));
              this.casteMap.set(map);
            },
            error: () => {},
          });
        }

        this.recordViewAndCheckShortlist(numericId);
      },
      error: (error: unknown) => {
        console.error('Failed to load profile:', error);
        this.error.set('Failed to load profile. Please try again.');
      },
    });
  }

  private recordViewAndCheckShortlist(targetProfileId: number): void {
    if (!this.authService.isAuthenticated()) return;

    this.memberService.getMyProfile().pipe(
      switchMap((myProfile) => {
        const myId = (myProfile as any).profileId ?? (myProfile as any).userId ?? 0;
        this.myProfileId = myId;
        if (!myId || myId === targetProfileId) return of(null);

        this.matchClient.recordProfileView({ viewedProfileId: targetProfileId }).subscribe({ error: () => {} });

        return this.matchClient.getShortlistsByProfile(myId);
      }),
    ).subscribe({
      next: (shortlists) => {
        if (shortlists) {
          this.isShortlisted.set(shortlists.some((s: { targetProfileId?: number }) => s.targetProfileId === targetProfileId));
        }
      },
      error: () => {},
    });

    this.checkExistingInterest(targetProfileId);
  }

  private checkExistingInterest(targetProfileId: number): void {
    if (!this.myProfileId) return;

    this.matchClient.getInterestRequestsByRequester(this.myProfileId).subscribe({
      next: (requests) => {
        const existing = requests.find((r) => r.targetProfileId === targetProfileId);
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
    const genderId = p.registrationDetails?.personal?.gender ? Number(p.registrationDetails.personal.gender) || null : null;
    const photos = p.registrationDetails?.photos ?? [];
    if (secondary && photos.length > 1) {
      return resolvePhotoUrl((photos[1] as any).fileUrl ?? (photos[1] as any).FileUrl, p.name, genderId);
    }
    if (photos.length > 0) {
      return resolvePhotoUrl((photos[0] as any).fileUrl ?? (photos[0] as any).FileUrl, p.name, genderId);
    }
    return getDefaultAvatar(p.name, genderId);
  }

  openGallery(): void {
    this.isGalleryOpen.set(true);
    this.currentGalleryIndex.set(0);
  }

  closeGallery(): void {
    this.isGalleryOpen.set(false);
  }

  nextPhoto(): void {
    this.currentGalleryIndex.update(i => (i + 1) % this.galleryPhotos().length);
  }

  prevPhoto(): void {
    this.currentGalleryIndex.update(i => (i - 1 + this.galleryPhotos().length) % this.galleryPhotos().length);
  }

  goToPhoto(index: number): void {
    this.currentGalleryIndex.set(index);
  }

  getDobText(): string {
    const p = this.profile();
    if (!p) return '';
    const personal = p.registrationDetails?.personal as Record<string, unknown> | undefined;
    if (!personal) return '';
    const day = personal['DobDay'] ?? personal['dobDay'];
    const month = personal['DobMonth'] ?? personal['dobMonth'];
    const year = personal['DobYear'] ?? personal['dobYear'];
    if (!day || !month || !year) return '';
    let monthNum: number | undefined;
    if (typeof month === 'string' && month) {
      monthNum = ProfileDetail.MONTH_MAP[month] ?? parseInt(month, 10);
    } else if (typeof month === 'number') {
      monthNum = month;
    }
    if (!monthNum) return '';
    return `${String(day).padStart(2, '0')}/${String(monthNum).padStart(2, '0')}/${year}`;
  }

  getHeightText(): string {
    const p = this.profile();
    if (!p) return '';
    const personal = p.registrationDetails?.personal as Record<string, unknown> | undefined;
    if (!personal) return '';
    const ft = personal['HeightFt'] ?? personal['heightFt'];
    const inches = personal['HeightIn'] ?? personal['heightIn'];
    if (ft != null) return `${ft}'${String(inches ?? 0).padStart(2, '0')}"`;
    return '';
  }

  getCreatedAtText(): string {
    const p = this.profile();
    if (!p?.createdAt) return '';
    const d = new Date(p.createdAt);
    if (isNaN(d.getTime()) || d.getFullYear() < 100) return '';
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }

  getOccupationIncomeText(): string {
    const p = this.profile();
    if (!p) return '';
    const prof = p.registrationDetails?.professional as Record<string, unknown> | undefined;
    if (!prof) return p.occupation ?? '';
    const parts: string[] = [];
    const occupationDetails = prof['OccupationDetails'] ?? prof['occupationDetails'];
    const workingCityCountry = prof['WorkingCityCountry'] ?? prof['workingCityCountry'];
    const incomeAmount = prof['IncomeAmount'] ?? prof['incomeAmount'];
    const incomePeriod = prof['IncomePeriod'] ?? prof['incomePeriod'];
    if (occupationDetails) parts.push(occupationDetails as string);
    if (workingCityCountry) parts.push(workingCityCountry as string);
    const income = incomeAmount ? Number(incomeAmount) : null;
    const period = incomePeriod;
    if (parts.length > 0) {
      let text = parts.join(', ');
      if (income) {
        let formatted: string;
        if (income >= 10000000) formatted = `${(income / 10000000).toFixed(income % 10000000 === 0 ? 0 : 1)} Cr`;
        else if (income >= 100000) formatted = `${(income / 100000).toFixed(income % 100000 === 0 ? 0 : 1)} L`;
        else formatted = income.toLocaleString();
        text += ` / ${formatted}`;
        if (period) text += ` / ${period}`;
      }
      return text;
    }
    return p.occupation ?? '';
  }

  getNativeDistrictName(): string {
    const p = this.profile();
    if (!p) return '';
    const family = p.registrationDetails?.family as Record<string, unknown> | undefined;
    return (family?.['NativeDistrict'] ?? family?.['nativeDistrict'] ?? '') as string;
  }

  getEducationText(): string {
    const p = this.profile();
    if (!p) return '';
    const prof = p.registrationDetails?.professional as Record<string, unknown> | undefined;
    return ((prof?.['Education'] ?? prof?.['education']) ?? '') as string;
  }

  getReligionLabel(): string {
    const p = this.profile();
    if (!p) return '';
    const personal = p.registrationDetails?.personal as Record<string, unknown> | undefined;
    return ((personal?.['Religion'] ?? personal?.['religion']) ?? '') as string;
  }

  getCasteLabel(): string {
    const p = this.profile();
    if (!p) return '';
    const personal = p.registrationDetails?.personal as Record<string, unknown> | undefined;
    return ((personal?.['Caste'] ?? personal?.['caste']) ?? '') as string;
  }

  onConnect(): void {
    if (this.isVisitor()) {
      this.router.navigate(['/register']);
      return;
    }
    if (this.isFreeUser()) {
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
        const message = this.extractErrorMessage(err);
        this.interestError.set(message);
      },
    });
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
    return 'Failed to send interest. Please try again.';
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

  private hashSeed(profile: MemberRecord): number {
    const source = `${profile.id}-${profile.email}-${profile.name}`.toLowerCase();
    let hash = 0;
    for (let i = 0; i < source.length; i += 1) {
      hash = (hash << 5) - hash + source.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  private mapRegistrationDetails(profileDetail: MappedProfileDetail): RegisterFormDetails {
    const details = createEmptyRegisterFormDetails();
    const photos: DbPhotoSection[] = Array.isArray(profileDetail.photos) ? profileDetail.photos : [];

    return {
      ...details,
      personal: {
        ...details.personal,
        firstName: profileDetail.personal?.FirstName ?? '',
        middleName: profileDetail.personal?.MiddleName ?? '',
        lastName: profileDetail.personal?.LastName ?? '',
        dobDay: `${profileDetail.personal?.DobDay ?? ''}`,
        dobMonth: profileDetail.personal?.DobMonth ?? '',
        dobYear: `${profileDetail.personal?.DobYear ?? ''}`,
        gender: profileDetail.personal?.Gender ?? '',
        religion: profileDetail.personal?.Religion ?? '',
        caste: profileDetail.personal?.Caste ?? '',
        subCast: profileDetail.personal?.SubCast ?? '',
        maritalStatus: profileDetail.personal?.MaritalStatus ?? '',
        heightFt: `${profileDetail.personal?.HeightFt ?? ''}`,
        heightIn: `${profileDetail.personal?.HeightIn ?? ''}`,
        weightKg: `${profileDetail.personal?.WeightKg ?? ''}`,
        bloodGroup: profileDetail.personal?.BloodGroup ?? '',
        complexion: profileDetail.personal?.Complexion ?? '',
        physicalDisability: profileDetail.personal?.PhysicalDisability ? 'Yes' : 'No',
        disabilityDetail: profileDetail.personal?.DisabilityDetail ?? '',
        diet: profileDetail.personal?.Diet ?? '',
        spectacles: profileDetail.personal?.Spectacles ? 'Yes' : 'No',
        lens: profileDetail.personal?.Lens ? 'Yes' : 'No',
        personality: profileDetail.personal?.Personality ?? '',
      },
      horoscope: {
        ...details.horoscope,
        manglik: profileDetail.horoscope?.Manglik ? 'Yes' : 'No',
        rashi: profileDetail.horoscope?.Rashi ?? '',
        nakshatra: profileDetail.horoscope?.Nakshatra ?? '',
        charan: profileDetail.horoscope?.Charan ?? '',
        nadi: profileDetail.horoscope?.Nadi ?? '',
        gan: profileDetail.horoscope?.Gan ?? '',
        birthHour: `${profileDetail.horoscope?.BirthHour ?? ''}`,
        birthMinute: `${profileDetail.horoscope?.BirthMinute ?? ''}`,
        birthPeriod: profileDetail.horoscope?.BirthPeriod ?? '',
        birthDistrict: profileDetail.horoscope?.BirthDistrict ?? '',
        devak: profileDetail.horoscope?.Devak ?? '',
      },
      professional: {
        ...details.professional,
        educationArea: profileDetail.professional?.EducationArea ?? '',
        education: profileDetail.professional?.Education ?? '',
        occupationType: profileDetail.professional?.OccupationType ?? '',
        occupationDetails: profileDetail.professional?.OccupationDetails ?? '',
        workingCityCountry: profileDetail.professional?.WorkingCityCountry ?? '',
        incomeAmount: `${profileDetail.professional?.IncomeAmount ?? ''}`,
        incomePeriod: profileDetail.professional?.IncomePeriod ?? '',
      },
      contact: {
        ...details.contact,
        idProofNumber: profileDetail.contact?.IdProofNumber ?? '',
        residenceAddress: profileDetail.contact?.ResidenceAddress ?? '',
        contactEmail: profileDetail.contact?.ContactEmail ?? profileDetail.email ?? '',
        smsMobile: profileDetail.contact?.SmsMobile ?? '',
        mobileSecondary: profileDetail.contact?.MobileSecondary ?? '',
      },
      family: {
        ...details.family,
        fatherStatus: profileDetail.family?.FatherStatus === null || profileDetail.family?.FatherStatus === undefined ? '' : profileDetail.family?.FatherStatus ? 'Yes' : 'No',
        motherStatus: profileDetail.family?.MotherStatus === null || profileDetail.family?.MotherStatus === undefined ? '' : profileDetail.family?.MotherStatus ? 'Yes' : 'No',
        brothers: `${profileDetail.family?.Brothers ?? ''}`,
        marriedBrothers: `${profileDetail.family?.MarriedBrothers ?? ''}`,
        sisters: `${profileDetail.family?.Sisters ?? ''}`,
        marriedSisters: `${profileDetail.family?.MarriedSisters ?? ''}`,
        parentsFullName: profileDetail.family?.ParentsFullName ?? '',
        parentsOccupation: profileDetail.family?.ParentsOccupation ?? '',
        parentsResidentCity: profileDetail.family?.ParentsResidentCity ?? '',
        relativesSurnames: profileDetail.family?.RelativesSurnames ?? '',
        familyWealth: profileDetail.family?.FamilyWealth ?? '',
        mamaSurnamePlace: profileDetail.family?.MamaSurnamePlace ?? '',
        nativeDistrict: profileDetail.family?.NativeDistrict ?? '',
        nativeTaluka: profileDetail.family?.NativeTaluka ?? '',
        intercastMarriage: profileDetail.family?.IntercastMarriage === null || profileDetail.family?.IntercastMarriage === undefined ? '' : profileDetail.family?.IntercastMarriage ? 'Yes' : 'No',
        intercastRelation: profileDetail.family?.IntercastRelation ?? '',
      },
      expectations: {
        ...details.expectations,
        preferredCities: profileDetail.expectations?.PreferredCities ?? '',
        expectedManglik: profileDetail.expectations?.ExpectedManglik === null || profileDetail.expectations?.ExpectedManglik === undefined ? '' : profileDetail.expectations?.ExpectedManglik ? 'Yes' : 'No',
        expectedCasteIds: profileDetail.expectations?.ExpectedCasteIds ?? [],
        expectedCasteNoBar: profileDetail.expectations?.ExpectedCasteNoBar,
        maxAgeDifference: `${profileDetail.expectations?.MaxAgeDifference ?? ''}`,
        expectedHeightFt: `${profileDetail.expectations?.ExpectedHeightFt ?? ''}`,
        expectedHeightIn: `${profileDetail.expectations?.ExpectedHeightIn ?? ''}`,
        expectedEducation: this.resolveExpectationIds(
          profileDetail.expectations?.ExpectedEducationIds,
          profileDetail.expectations?.ExpectedEducationNoBar,
          this.educationMap()
        ),
        expectedOccupationIncome: this.resolveExpectationIds(
          profileDetail.expectations?.ExpectedOccupationIds,
          profileDetail.expectations?.ExpectedOccupationNoBar,
          this.occupationMap()
        ),
        divorcee: profileDetail.expectations?.Divorcee === null || profileDetail.expectations?.Divorcee === undefined ? '' : profileDetail.expectations?.Divorcee ? 'Yes' : 'No',
      },
      verification: {
        verificationCode: profileDetail.verification?.VerificationCode ?? '',
        verificationInput: profileDetail.verification?.VerificationPassed ? profileDetail.verification?.VerificationCode ?? '' : '',
      },
      photos: photos.map((photo, index: number) => ({
        photoSlot: Number(photo.PhotoSlot ?? index + 1),
        fileName: photo.FileName ?? '',
        fileUrl: photo.FileUrl ?? '',
        isPrimary: Boolean(photo.IsPrimary),
      })),
    };
  }

  private profileSex(details?: unknown): string {
    const record = (details ?? {}) as { gender?: string; sex?: string };
    return (record.gender || record.sex || '').trim() || '-';
  }

  private field(label: string, value: unknown): ProfileField {
    const text = `${value ?? ''}`.trim();
    return { label, value: text || '-' };
  }

  private dateText(day?: string, month?: string, year?: string): string {
    const parts = [day, month, year].filter(Boolean);
    return parts.length ? parts.join(' / ') : '-';
  }

  private heightText(ft?: string, inch?: string): string {
    if (!ft && !inch) {
      return '-';
    }

    return `${ft || '0'} ft ${inch || '0'} in`;
  }

  private resolveExpectationIds(
    ids?: number[] | null,
    noBar?: boolean,
    lookup?: Map<number, string>,
  ): string {
    if (noBar) return 'No Bar';
    if (!ids || ids.length === 0) return '';
    if (!lookup || lookup.size === 0) return ids.join(', ');
    return ids.map(id => lookup.get(id) ?? String(id)).join(', ');
  }

}
