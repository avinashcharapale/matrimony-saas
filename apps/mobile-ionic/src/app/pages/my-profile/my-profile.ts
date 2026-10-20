import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ProfileClient, ProfileDetailDto } from '@org/generated';
import { RegisterMasterDataService } from '@org/data-access-registration';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

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
  imports: [CommonModule, RouterModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.css',
})
export class MyProfile implements OnInit {
  private readonly profileClient = inject(ProfileClient);
  private readonly masterData = inject(RegisterMasterDataService);

  readonly profile = signal<ProfileDetailDto | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly openSections = signal<Set<number>>(new Set());

  readonly headerPhotoUrl = computed(() => {
    const p = this.profile();
    if (!p) return '';
    const photo = (p.photos ?? []).find((ph) => ph.isPrimary) ?? p.photos?.[0];
    return photo?.fileUrl ?? '';
  });

  private casteMap = new Map<number, string>();
  private educationMap = new Map<number, string>();
  private occupationMap = new Map<number, string>();
  private incomeRangeMap = new Map<number, string>();

  readonly sections = computed<ProfileSection[]>(() => {
    const p = this.profile();
    if (!p) return [];

    const personal = p.personalDetails;
    const career = p.career;
    const family = p.familyInfo;
    const horoscope = p.horoscope;
    const contact = p.contact;
    const partner = p.partnerPreference;

    return [
      {
        title: 'Personal Details',
        fields: [
          this.field('Full Name', p.fullName),
          this.field('Age', p.age),
          this.field('Date of Birth', this.dobText(personal)),
          this.field('Gender', personal?.genderName),
          this.field('Religion', personal?.religionName),
          this.field('Caste', personal?.casteName),
          this.field('Sub Caste', personal?.subCasteName),
          this.field('Marital Status', personal?.maritalStatusName),
          this.field('Bio', p.bio),
          this.field('Location', p.locationText),
          this.field('Height', this.heightText(personal?.heightFt, personal?.heightIn)),
          this.field('Weight', personal?.weightKg ? `${personal.weightKg} Kg` : null),
          this.field('Blood Group', personal?.bloodGroupName),
          this.field('Complexion', personal?.complexionName),
          this.field('Diet', personal?.dietName),
          this.field('Personality', personal?.personalityName),
          this.field('Spectacles', this.boolText(personal?.spectacles)),
          this.field('Lens', this.boolText(personal?.lens)),
          this.field('Physical Disability', this.boolText(personal?.physicalDisability)),
          this.field('Disability Detail', personal?.disabilityDetail),
        ],
      },
      {
        title: 'Horoscope',
        fields: [
          this.field('Manglik', this.boolText(horoscope?.manglik)),
          this.field('Rashi', horoscope?.rashiName),
          this.field('Nakshatra', horoscope?.nakshatraName),
          this.field('Charan', horoscope?.charanName),
          this.field('Nadi', horoscope?.nadiName),
          this.field('Gan', horoscope?.ganName),
          this.field('Birth Time', this.timeText(horoscope?.birthHour, horoscope?.birthMinute, horoscope?.birthPeriod)),
          this.field('Devak', horoscope?.devak),
          this.field('Birth State', horoscope?.birthStateName || horoscope?.birthStateOther),
          this.field('Birth District', horoscope?.birthDistrictName || horoscope?.birthDistrictOther),
        ],
      },
      {
        title: 'Education & Career',
        fields: [
          this.field('Education Area', career?.educationAreaName),
          this.field('Education', career?.educationName),
          this.field('Occupation', career?.occupationName),
          this.field('Occupation Details', career?.occupationDetails),
          this.field('Working City', career?.workingCity),
          this.field('Working State', career?.workingStateName || career?.workingStateOther),
          this.field('Working Country', career?.workingCountryName || career?.workingCountryOther),
          this.field('Income', career?.incomeAmount),
          this.field('Income Period', career?.incomePeriodName),
        ],
      },
      {
        title: 'Contact & Address',
        fields: [
          this.field('Email', contact?.contactEmail),
          this.field('Address', contact?.residenceAddress),
          this.field('ID Proof', contact?.idProofNumber),
          this.field('Mobile', this.getPhone('sms_mobile')),
          this.field('Secondary Mobile', this.getPhone('mobile_secondary')),
          this.field('Primary Phone', this.getPhone('phone_primary')),
          this.field('Secondary Phone', this.getPhone('phone_secondary')),
        ],
      },
      {
        title: 'Family Background',
        fields: [
          this.field('Father', this.boolText(family?.fatherStatus)),
          this.field('Mother', this.boolText(family?.motherStatus)),
          this.field('Brothers', family?.brothers),
          this.field('Married Brothers', family?.marriedBrothers),
          this.field('Sisters', family?.sisters),
          this.field('Married Sisters', family?.marriedSisters),
          this.field('Parents Full Name', family?.parentsFullName),
          this.field('Parents Occupation', family?.parentsOccupation),
          this.field('Parents Resident City', family?.parentsResidentCity),
          this.field('Family Wealth', family?.familyWealth),
          this.field('Mama Surname Place', family?.mamaSurnamePlace),
          this.field('Native District', family?.nativeDistrictName || family?.nativeDistrictOther),
          this.field('Native Taluka', family?.nativeTalukaName || family?.nativeTalukaOther),
          this.field('Inter-cast Marriage', this.boolText(family?.intercastMarriage)),
          this.field('Inter-cast Relation', family?.intercastRelation),
        ],
      },
      {
        title: 'Partner Preferences',
        fields: [
          this.field('Preferred Cities', p.preferredCities?.join(', ')),
          this.field('Interests', p.interests?.join(', ')),
          this.field('Expected Manglik', this.boolText(partner?.expectedManglik)),
          this.field('Max Age Difference', partner?.maxAgeDifference),
          this.field('Expected Height', this.heightText(partner?.expectedHeightFt, partner?.expectedHeightIn)),
          this.field('Divorcee', this.boolText(partner?.divorcee)),
          this.field('Expected Caste', this.resolveIds(this.casteMap, p.expectedCasteIds) ?? (partner?.expectedCasteNoBar ? 'No Bar' : null)),
          this.field('Expected Education', this.resolveIds(this.educationMap, p.expectedEducationIds) ?? (partner?.expectedEducationNoBar ? 'No Bar' : null)),
          this.field('Expected Occupation', this.resolveIds(this.occupationMap, p.expectedOccupationIds) ?? (partner?.expectedOccupationNoBar ? 'No Bar' : null)),
          this.field('Expected Income Range', this.resolveName(this.incomeRangeMap, partner?.expectedIncomeRangeId)),
          this.field('Caste No Bar', this.boolText(partner?.expectedCasteNoBar)),
          this.field('Education No Bar', this.boolText(partner?.expectedEducationNoBar)),
          this.field('Occupation No Bar', this.boolText(partner?.expectedOccupationNoBar)),
        ],
      },
    ];
  });

  ngOnInit(): void {
    this.loadMyProfile();
  }

  loadMyProfile(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.profileClient.getMyProfile().pipe(
      finalize(() => this.isLoading.set(false)),
    ).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.loadLookups(profile);
      },
      error: () => {
        this.error.set('Failed to load profile. Please try again.');
      },
    });
  }

  private loadLookups(profile: ProfileDetailDto): void {
    const religionId = profile.personalDetails?.religionId;
    const fork: Record<string, ReturnType<RegisterMasterDataService['getEducations']> | ReturnType<RegisterMasterDataService['getOccupations']> | ReturnType<RegisterMasterDataService['getIncomeRanges']> | ReturnType<RegisterMasterDataService['getCastes']>> = {
      educations: this.masterData.getEducations(),
      occupations: this.masterData.getOccupations(),
      incomeRanges: this.masterData.getIncomeRanges(),
    };
    if (religionId) {
      fork['castes'] = this.masterData.getCastes(religionId);
    }

    forkJoin(fork).subscribe({
      next: (result) => {
        const castes = result['castes'] as Array<{ id: number; label: string }> | undefined;
        const educations = result['educations'] as Array<{ id: number; label: string }>;
        const occupations = result['occupations'] as Array<{ id: number; label: string }>;
        const incomeRanges = result['incomeRanges'] as Array<{ incomeRangeId: number; label: string }>;

        if (castes) castes.forEach((c) => this.casteMap.set(c.id, c.label));
        if (educations) educations.forEach((e) => this.educationMap.set(e.id, e.label));
        if (occupations) occupations.forEach((o) => this.occupationMap.set(o.id, o.label));
        if (incomeRanges) incomeRanges.forEach((i) => this.incomeRangeMap.set(i.incomeRangeId, i.label));

        this.profile.update((p) => (p ? { ...p } : p));
      },
    });
  }

  toggleSection(index: number): void {
    this.openSections.update((set) => {
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
    return value ? 'Yes' : 'No';
  }

  private heightText(ft?: number | null, inch?: number | null): string {
    if (!ft && !inch) return '-';
    return `${ft ?? 0} ft ${inch ?? 0} in`;
  }

  private timeText(hour?: number | null, minute?: number | null, period?: string | null): string {
    if (!hour && !minute && !period) return '-';
    return `${hour ?? '00'}:${minute ?? '00'} ${period ?? ''}`.trim();
  }

  private field(label: string, value: unknown): ProfileField {
    const text = `${value ?? ''}`.trim();
    return { label, value: text || '-' };
  }

  private resolveName(map: Map<number, string>, id?: number | null): string | null {
    if (!id) return null;
    return map.get(id) ?? null;
  }

  private resolveIds(map: Map<number, string>, ids?: number[] | null): string | null {
    if (!ids || ids.length === 0) return null;
    const names = ids.map((id) => map.get(id)).filter(Boolean);
    return names.length > 0 ? names.join(', ') : null;
  }

  private getPhone(phoneType: string): string | null {
    const p = this.profile();
    if (!p?.phoneNumbers) return null;
    const phone = p.phoneNumbers.find((n) => n.phoneType === phoneType);
    return phone?.phoneNumber ?? null;
  }

  private dobText(personal?: ProfileDetailDto['personalDetails']): string {
    if (!personal) return '-';
    const { dobDay, dobMonth, dobYear } = personal;
    if (!dobDay && !dobMonth && !dobYear) return '-';
    return `${dobDay ?? '?'}/${dobMonth ?? '?'}/${dobYear ?? '?'}`;
  }
}