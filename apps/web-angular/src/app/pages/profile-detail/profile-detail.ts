import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MemberRecord, MemberService } from '../../services/member.service';
import { RegisterFormDetails, createEmptyRegisterFormDetails } from '@org/models';
import { getDefaultAvatar, resolvePhotoUrl } from '../../utils/default-avatar';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { SubscriptionStore } from '@org/data-access-subscription';
import { TenantService } from '../../services/tenant.service';
import { RegisterMasterDataService } from '../../services/register-master-data.service';

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

  readonly profile = signal<MemberRecord | null>(null);
  readonly isGalleryOpen = signal(false);
  readonly currentGalleryIndex = signal(0);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly isContactUnlocked = signal(false);
  readonly showUpgradePrompt = signal(false);
  readonly isSendingInterest = signal(false);
  readonly interestSent = signal(false);

  readonly educationMap = signal<Map<number, string>>(new Map());
  readonly occupationMap = signal<Map<number, string>>(new Map());
  readonly casteMap = signal<Map<number, string>>(new Map());

  readonly isPaidUser = computed(() => this.subscriptionStore.isActive());
  readonly isFreeUser = computed(() => this.authService.isAuthenticated() && !this.subscriptionStore.isActive());
  readonly isVisitor = computed(() => !this.authService.isAuthenticated());

  readonly galleryPhotos = computed(() => {
    const p = this.profile();
    const slots = p?.registrationDetails?.photos ?? [];
    const photos: string[] = [this.getProfilePhoto()];
    if (slots.length > 1) {
      photos.push(this.getProfilePhoto(true));
    }
    if (slots.length > 2) {
      photos.push(this.getProfilePhoto());
    }
    return photos.slice(0, 3);
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
      const tenantId = Number(this.tenantService.tenantHeaderId);
      if (tenantId) {
        this.subscriptionStore.loadSubscriptionStatus(tenantId);
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
          email: profileDetail.email ?? '',
          name: profileDetail.fullName ?? profileDetail.displayName ?? '',
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
      },
      error: (error: unknown) => {
        console.error('Failed to load profile:', error);
        this.error.set('Failed to load profile. Please try again.');
      },
    });
  }

  getProfilePhoto(secondary = false): string {
    const p = this.profile();
    if (!p) return '';
    const genderId = p.registrationDetails?.personal?.gender ? Number(p.registrationDetails.personal.gender) || null : null;
    const photos = (p.registrationDetails?.photos ?? []) as DbPhotoSection[];
    if (secondary && photos.length > 1) {
      return resolvePhotoUrl(photos[1].FileUrl, p.name, genderId);
    }
    if (photos.length > 0) {
      return resolvePhotoUrl(photos[0].FileUrl, p.name, genderId);
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

  getMemberId(): string {
    const p = this.profile();
    if (!p) return '';
    const seed = this.hashSeed(p);
    const code = 10000 + (seed % 89999);
    return `MBU${code} (${[...p.name.split(' ')][0]?.toUpperCase()})`;
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
    if (!p || this.isSendingInterest() || this.interestSent()) return;

    const targetProfileId = parseInt(p.id, 10);
    if (isNaN(targetProfileId)) return;

    this.isSendingInterest.set(true);
    const tenantId = Number(this.tenantService.tenantHeaderId);

    this.http.post('/api/InterestRequests', {
      targetProfileId,
      message: '',
    }, {
      headers: tenantId ? { 'X-Tenant-Id': String(tenantId) } : {},
    }).pipe(
      finalize(() => this.isSendingInterest.set(false)),
    ).subscribe({
      next: () => this.interestSent.set(true),
      error: (err: unknown) => {
        console.error('Failed to send interest:', err);
      },
    });
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
