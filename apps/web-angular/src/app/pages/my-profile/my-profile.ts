import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MemberService } from '../../services/member.service';
import { RegisterMasterDataService } from '../../services/register-master-data.service';
import { AuthService } from '../../services/auth.service';
import { SubscriptionStore } from '@org/data-access-subscription';
import { SharedSidebarComponent } from '../../components/shared-sidebar/shared-sidebar.component';
import { getDefaultAvatar, resolvePhotoUrl } from '../../utils/default-avatar';
import { ProfileDetailDto } from '@org/generated';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

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
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, SharedSidebarComponent],
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.css',
})
export class MyProfile implements OnInit {
  private readonly memberService = inject(MemberService);
  private readonly masterData = inject(RegisterMasterDataService);
  private readonly authService = inject(AuthService);
  private readonly subscriptionStore = inject(SubscriptionStore);
  private readonly translate = inject(TranslateService);

  private readonly langTick = signal(0);

  readonly profile = signal<ProfileDetailDto | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly openSections = signal<Set<number>>(new Set());

  readonly userName = signal('');
  readonly userPhotoUrl = signal('');
  readonly userOccupation = signal('');
  readonly subscriptionStatus = this.subscriptionStore.status;
  readonly subscriptionLoading = computed(() => this.subscriptionStore.loading());

  private casteMap = new Map<number, string>();
  private educationMap = new Map<number, string>();
  private occupationMap = new Map<number, string>();
  private incomeRangeMap = new Map<number, string>();

  constructor() {
    this.translate.onLangChange.subscribe(() => this.langTick.update(v => v + 1));
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }

  readonly sections = computed(() => {
    const p = this.profile();
    if (!p) return [];

    this.langTick();

    const personal = p.personalDetails;
    const career = p.career;
    const family = p.familyInfo;
    const horoscope = p.horoscope;
    const contact = p.contact;
    const partner = p.partnerPreference;

    return [
      {
        title: this.t('profile.personalDetails'),
        fields: [
          this.field('profile.fullName', p.fullName),
          this.field('profile.age', p.age),
          this.field('profile.dob', this.dobText(personal)),
          this.field('profile.gender', personal?.genderName),
          this.field('profile.religion', personal?.religionName),
          this.field('profile.caste', personal?.casteName),
          this.field('profile.subCaste', personal?.subCasteName),
          this.field('profile.maritalStatus', personal?.maritalStatusName),
          this.field('profile.bio', p.bio),
          this.field('profile.location', p.locationText),
          this.field('profile.height', this.heightText(personal?.heightFt, personal?.heightIn)),
          this.field('profile.weight', personal?.weightKg ? `${personal.weightKg} ${this.t('common.kg')}` : null),
          this.field('profile.bloodGroup', personal?.bloodGroupName),
          this.field('profile.complexion', personal?.complexionName),
          this.field('profile.diet', personal?.dietName),
          this.field('profile.personality', personal?.personalityName),
          this.field('profile.spectacles', this.boolText(personal?.spectacles)),
          this.field('profile.lens', this.boolText(personal?.lens)),
          this.field('profile.physicalDisability', this.boolText(personal?.physicalDisability)),
          this.field('profile.disabilityDetail', personal?.disabilityDetail),
        ],
      },
      {
        title: this.t('profile.horoscope'),
        fields: [
          this.field('profile.manglik', this.boolText(horoscope?.manglik)),
          this.field('profile.rashi', horoscope?.rashiName),
          this.field('profile.nakshatra', horoscope?.nakshatraName),
          this.field('profile.charan', horoscope?.charanName),
          this.field('profile.nadi', horoscope?.nadiName),
          this.field('profile.gan', horoscope?.ganName),
          this.field('profile.birthHour', horoscope?.birthHour),
          this.field('profile.birthMinute', horoscope?.birthMinute),
          this.field('profile.birthPeriod', horoscope?.birthPeriod),
          this.field('profile.devak', horoscope?.devak),
          this.field('profile.birthState', horoscope?.birthStateName || horoscope?.birthStateOther),
          this.field('profile.birthDistrict', horoscope?.birthDistrictName || horoscope?.birthDistrictOther),
        ],
      },
      {
        title: this.t('profile.careerEducation'),
        fields: [
          this.field('profile.educationArea', career?.educationAreaName),
          this.field('profile.education', career?.educationName),
          this.field('profile.occupation', career?.occupationName),
          this.field('profile.occupationDetails', career?.occupationDetails),
          this.field('profile.workingCity', career?.workingCity),
          this.field('profile.workingState', career?.workingStateName || career?.workingStateOther),
          this.field('profile.workingCountry', career?.workingCountryName || career?.workingCountryOther),
          this.field('profile.incomeAmount', career?.incomeAmount),
          this.field('profile.incomePeriod', career?.incomePeriodName),
        ],
      },
      {
        title: this.t('profile.contact'),
        fields: [
          this.field('profile.email', contact?.contactEmail),
          this.field('profile.address', contact?.residenceAddress),
          this.field('profile.idProof', contact?.idProofNumber),
          this.field('profile.smsMobile', this.getPhone('sms_mobile')),
          this.field('profile.secondaryMobile', this.getPhone('mobile_secondary')),
          this.field('profile.phonePrimary', this.getPhone('phone_primary')),
          this.field('profile.phoneSecondary', this.getPhone('phone_secondary')),
        ],
      },
      {
        title: this.t('profile.familyBackground'),
        fields: [
          this.field('profile.father', this.boolText(family?.fatherStatus)),
          this.field('profile.mother', this.boolText(family?.motherStatus)),
          this.field('profile.brothers', family?.brothers),
          this.field('profile.marriedBrothers', family?.marriedBrothers),
          this.field('profile.sisters', family?.sisters),
          this.field('profile.marriedSisters', family?.marriedSisters),
          this.field('profile.parentsFullName', family?.parentsFullName),
          this.field('profile.parentsOccupation', family?.parentsOccupation),
          this.field('profile.parentsResidentCity', family?.parentsResidentCity),
          this.field('profile.familyWealth', family?.familyWealth),
          this.field('profile.mamaSurnamePlace', family?.mamaSurnamePlace),
          this.field('profile.nativeDistrict', family?.nativeDistrictName || family?.nativeDistrictOther),
          this.field('profile.nativeTaluka', family?.nativeTalukaName || family?.nativeTalukaOther),
          this.field('profile.intercastMarriage', this.boolText(family?.intercastMarriage)),
          this.field('profile.intercastRelation', family?.intercastRelation),
        ],
      },
      {
        title: this.t('profile.partnerPreferences'),
        fields: [
          this.field('profile.preferredCities', p.preferredCities?.join(', ')),
          this.field('profile.interests', p.interests?.join(', ')),
          this.field('profile.expectedManglik', this.boolText(partner?.expectedManglik)),
          this.field('profile.maxAgeDifference', partner?.maxAgeDifference),
          this.field('profile.expectedHeightFt', partner?.expectedHeightFt),
          this.field('profile.expectedHeightIn', partner?.expectedHeightIn),
          this.field('profile.divorcee', this.boolText(partner?.divorcee)),
          this.field('profile.expectedCaste', this.resolveIds(this.casteMap, p.expectedCasteIds) ?? (partner?.expectedCasteNoBar ? this.t('profile.noBar') : null)),
          this.field('profile.expectedEducation', this.resolveIds(this.educationMap, p.expectedEducationIds) ?? (partner?.expectedEducationNoBar ? this.t('profile.noBar') : null)),
          this.field('profile.expectedOccupation', this.resolveIds(this.occupationMap, p.expectedOccupationIds) ?? (partner?.expectedOccupationNoBar ? this.t('profile.noBar') : null)),
          this.field('profile.expectedIncomeRange', this.resolveName(this.incomeRangeMap, partner?.expectedIncomeRangeId)),
          this.field('profile.casteNoBar', this.boolText(partner?.expectedCasteNoBar)),
          this.field('profile.educationNoBar', this.boolText(partner?.expectedEducationNoBar)),
          this.field('profile.occupationNoBar', this.boolText(partner?.expectedOccupationNoBar)),
        ],
      },
    ];
  });

  ngOnInit(): void {
    const userId = this.authService.getSession()?.userId ?? 0;
    if (userId) {
      this.subscriptionStore.loadSubscriptionStatus(userId).subscribe();
    }
    this.loadMyProfile();
  }

  loadMyProfile(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.memberService.getMyProfile().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.populateSidebar(profile);
        this.loadLookups(profile);
      },
      error: (err) => {
        console.error('Failed to load my profile:', err);
        this.error.set(this.translate.instant('profile.errors.load'));
      },
    });
  }

  private populateSidebar(profile: ProfileDetailDto): void {
    const fullName = profile.fullName ?? '';
    const genderId = profile.personalDetails?.genderId ?? null;
    const primaryPhoto = (profile.photos ?? []).find(ph => ph.isPrimary) ?? profile.photos?.[0];
    this.userName.set(fullName);
    this.userPhotoUrl.set(
      primaryPhoto
        ? resolvePhotoUrl(primaryPhoto.fileUrl, fullName, genderId)
        : getDefaultAvatar(fullName, genderId),
    );
    this.userOccupation.set(profile.occupationText ?? '');
  }

  private loadLookups(profile: ProfileDetailDto): void {
    const religionId = profile.personalDetails?.religionId;
    const fork: Record<string, import('rxjs').Observable<unknown>> = {
      educations: this.masterData.getEducations(),
      occupations: this.masterData.getOccupations(),
      incomeRanges: this.masterData.getIncomeRanges(),
    };
    if (religionId) {
      fork['castes'] = this.masterData.getCastes(religionId);
    }

    forkJoin(fork).subscribe({
      next: (result: Record<string, unknown>) => {
        const castes = result['castes'] as Array<{ id: number; label: string }> | undefined;
        const educations = result['educations'] as Array<{ id: number; label: string }>;
        const occupations = result['occupations'] as Array<{ id: number; label: string }>;
        const incomeRanges = result['incomeRanges'] as Array<{ incomeRangeId: number; label: string }>;

        if (castes) castes.forEach(c => this.casteMap.set(c.id, c.label));
        if (educations) educations.forEach(e => this.educationMap.set(e.id, e.label));
        if (occupations) occupations.forEach(o => this.occupationMap.set(o.id, o.label));
        if (incomeRanges) incomeRanges.forEach(i => this.incomeRangeMap.set(i.incomeRangeId, i.label));

        this.profile.update(p => p ? { ...p } : p);
      },
    });
  }

  toggleSection(index: number): void {
    this.openSections.update(set => {
      const next = new Set(set);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  isSectionOpen(index: number): boolean {
    return this.openSections().has(index);
  }

  private boolText(value: boolean | undefined | null): string {
    if (value === null || value === undefined) return '-';
    return value ? this.t('common.yes') : this.t('common.no');
  }

  private heightText(ft?: number | null, inch?: number | null): string {
    if (!ft && !inch) return '-';
    return `${ft ?? 0} ${this.t('common.ft')} ${inch ?? 0} ${this.t('common.in')}`;
  }

  private field(label: string, value: unknown): ProfileField {
    const text = `${value ?? ''}`.trim();
    return { label: this.t(label), value: text || '-' };
  }

  private resolveName(map: Map<number, string>, id?: number | null): string | null {
    if (!id) return null;
    return map.get(id) ?? null;
  }

  private resolveIds(map: Map<number, string>, ids?: number[] | null): string | null {
    if (!ids || ids.length === 0) return null;
    const names = ids.map(id => map.get(id)).filter(Boolean);
    return names.length > 0 ? names.join(', ') : null;
  }

  private getPhone(phoneType: string): string | null {
    const p = this.profile();
    if (!p?.phoneNumbers) return null;
    const phone = p.phoneNumbers.find(n => n.phoneType === phoneType);
    return phone?.phoneNumber ?? null;
  }

  private dobText(personal: ProfileDetailDto['personalDetails']): string {
    if (!personal) return '-';
    const day = personal.dobDay;
    const month = personal.dobMonth;
    const year = personal.dobYear;
    if (!day && !month && !year) return '-';
    return `${day ?? '?'}/${month ?? '?'}/${year ?? '?'}`;
  }
}
