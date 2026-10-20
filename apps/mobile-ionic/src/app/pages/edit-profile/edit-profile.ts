import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileClient, CreateProfileDto } from '@org/generated';
import {
  RegisterMasterDataService,
  RegisterLookupOption,
  RegisterStateOption,
  RegisterDistrictOption,
  RegisterTalukaOption,
  RegisterCountryOption,
  RegisterIncomeRangeOption,
} from '@org/data-access-registration';

interface EditableProfile {
  bio: string;
  locationText: string;
  interests: string;
  personal: {
    firstName: string;
    middleName: string;
    lastName: string;
    dobDay: number | null;
    dobMonth: string;
    dobYear: number | null;
    genderId: number | null;
    religionId: number | null;
    casteId: number | null;
    subCasteId: number | null;
    maritalStatusId: number | null;
    heightFt: number | null;
    heightIn: number | null;
    weightKg: number | null;
    bloodGroupId: number | null;
    complexionId: number | null;
    dietId: number | null;
    personalityId: number | null;
    physicalDisability: boolean;
    disabilityDetail: string;
    spectacles: boolean;
    lens: boolean;
  };
  career: {
    educationAreaId: number | null;
    educationId: number | null;
    occupationId: number | null;
    occupationDetails: string;
    workingCountryId: number | null;
    workingCountryOther: string;
    workingStateId: number | null;
    workingStateOther: string;
    workingCity: string;
    workingCityOther: string;
    incomeAmount: number | null;
    incomePeriodId: number | null;
  };
  contact: {
    residenceAddress: string;
    contactEmail: string;
    idProofNumber: string;
    smsMobile: string;
    mobileSecondary: string;
    phonePrimary: string;
    phoneSecondary: string;
  };
  family: {
    fatherStatus: boolean;
    motherStatus: boolean;
    brothers: number;
    marriedBrothers: number;
    sisters: number;
    marriedSisters: number;
    parentsFullName: string;
    parentsOccupation: string;
    parentsResidentCity: string;
    familyWealth: string;
    mamaSurnamePlace: string;
    nativeStateId: number | null;
    nativeStateOther: string;
    nativeDistrictId: number | null;
    nativeDistrictOther: string;
    nativeTalukaId: number | null;
    nativeTalukaOther: string;
    intercastMarriage: boolean;
    intercastRelation: string;
  };
  partnerPreference: {
    expectedManglik: boolean;
    maxAgeDifference: number;
    expectedHeightFt: number;
    expectedHeightIn: number;
    divorcee: boolean;
    expectedCasteNoBar: boolean;
    expectedEducationNoBar: boolean;
    expectedOccupationNoBar: boolean;
    expectedIncomeRangeId: number | null;
    expectedCasteIds: number[];
    expectedEducationIds: number[];
    expectedOccupationIds: number[];
  };
  horoscope: {
    manglik: boolean;
    rashiId: number | null;
    nakshatraId: number | null;
    charanId: number | null;
    nadiId: number | null;
    ganId: number | null;
    birthHour: number | null;
    birthMinute: number | null;
    birthPeriod: string;
    devak: string;
    birthStateId: number | null;
    birthStateOther: string;
    birthDistrictId: number | null;
    birthDistrictOther: string;
  };
  preferredCities: string;
}

function createEmptyProfile(): EditableProfile {
  return {
    bio: '',
    locationText: '',
    interests: '',
    personal: {
      firstName: '', middleName: '', lastName: '',
      dobDay: null, dobMonth: '', dobYear: null,
      genderId: null, religionId: null, casteId: null, subCasteId: null,
      maritalStatusId: null, heightFt: 5, heightIn: 4, weightKg: 50,
      bloodGroupId: null, complexionId: null, dietId: null, personalityId: null,
      physicalDisability: false, disabilityDetail: '', spectacles: false, lens: false,
    },
    career: {
      educationAreaId: null, educationId: null, occupationId: null,
      occupationDetails: '', workingCountryId: null, workingCountryOther: '',
      workingStateId: null, workingStateOther: '', workingCity: '', workingCityOther: '',
      incomeAmount: null, incomePeriodId: null,
    },
    contact: {
      residenceAddress: '', contactEmail: '', idProofNumber: '',
      smsMobile: '', mobileSecondary: '', phonePrimary: '', phoneSecondary: '',
    },
    family: {
      fatherStatus: false, motherStatus: false,
      brothers: 0, marriedBrothers: 0, sisters: 0, marriedSisters: 0,
      parentsFullName: '', parentsOccupation: '', parentsResidentCity: '',
      familyWealth: '', mamaSurnamePlace: '',
      nativeStateId: null, nativeStateOther: '',
      nativeDistrictId: null, nativeDistrictOther: '',
      nativeTalukaId: null, nativeTalukaOther: '',
      intercastMarriage: false, intercastRelation: '',
    },
    partnerPreference: {
      expectedManglik: false, maxAgeDifference: 5, expectedHeightFt: 5, expectedHeightIn: 0,
      divorcee: false, expectedCasteNoBar: false, expectedEducationNoBar: false,
      expectedOccupationNoBar: false, expectedIncomeRangeId: null,
      expectedCasteIds: [], expectedEducationIds: [], expectedOccupationIds: [],
    },
    horoscope: {
      manglik: false, rashiId: null, nakshatraId: null, charanId: null,
      nadiId: null, ganId: null, birthHour: null, birthMinute: null,
      birthPeriod: '', devak: '',
      birthStateId: null, birthStateOther: '', birthDistrictId: null, birthDistrictOther: '',
    },
    preferredCities: '',
  };
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-edit-profile',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile implements OnInit {
  private readonly profileClient = inject(ProfileClient);
  private readonly masterData = inject(RegisterMasterDataService);
  private readonly router = inject(Router);

  readonly profile = signal<EditableProfile>(createEmptyProfile());
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);
  readonly validationErrors = signal<string[]>([]);
  readonly successMessage = signal<string | null>(null);

  genderOptions: RegisterLookupOption[] = [];
  religionOptions: RegisterLookupOption[] = [];
  casteOptions: RegisterLookupOption[] = [];
  subCasteOptions: RegisterLookupOption[] = [];
  maritalStatusOptions: RegisterLookupOption[] = [];
  bloodGroupOptions: RegisterLookupOption[] = [];
  complexionOptions: RegisterLookupOption[] = [];
  dietOptions: RegisterLookupOption[] = [];
  personalityOptions: RegisterLookupOption[] = [];
  rashisOptions: RegisterLookupOption[] = [];
  nakshatrasOptions: RegisterLookupOption[] = [];
  charansOptions: RegisterLookupOption[] = [];
  nadisOptions: RegisterLookupOption[] = [];
  gansOptions: RegisterLookupOption[] = [];
  educationAreasOptions: RegisterLookupOption[] = [];
  educationsOptions: RegisterLookupOption[] = [];
  occupationsOptions: RegisterLookupOption[] = [];
  incomePeriodsOptions: RegisterLookupOption[] = [];
  incomeRangesOptions: RegisterIncomeRangeOption[] = [];

  birthStates: RegisterStateOption[] = [];
  birthDistricts: RegisterDistrictOption[] = [];
  workingStates: RegisterStateOption[] = [];
  workingDistricts: RegisterDistrictOption[] = [];
  countries: RegisterCountryOption[] = [];
  nativeStates: RegisterStateOption[] = [];
  nativeDistricts: RegisterDistrictOption[] = [];
  nativeTalukas: RegisterTalukaOption[] = [];

  activeSection = signal(0);

  readonly days = Array.from({ length: 31 }, (_, i) => i + 1);
  readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  readonly years = Array.from({ length: 70 }, (_, i) => new Date().getFullYear() - 18 - i);
  readonly hours = Array.from({ length: 12 }, (_, i) => i + 1);
  readonly minutes = Array.from({ length: 60 }, (_, i) => i);

  ngOnInit(): void {
    this.loadLookups();
    this.loadProfile();
  }

  loadLookups(): void {
    this.masterData.getGenders().subscribe((o) => (this.genderOptions = o));
    this.masterData.getReligions().subscribe((o) => (this.religionOptions = o));
    this.masterData.getMaritalStatuses().subscribe((o) => (this.maritalStatusOptions = o));
    this.masterData.getBloodGroups().subscribe((o) => (this.bloodGroupOptions = o));
    this.masterData.getComplexions().subscribe((o) => (this.complexionOptions = o));
    this.masterData.getDiets().subscribe((o) => (this.dietOptions = o));
    this.masterData.getPersonalities().subscribe((o) => (this.personalityOptions = o));
    this.masterData.getRashis().subscribe((o) => (this.rashisOptions = o));
    this.masterData.getNakshatras().subscribe((o) => (this.nakshatrasOptions = o));
    this.masterData.getCharans().subscribe((o) => (this.charansOptions = o));
    this.masterData.getNadis().subscribe((o) => (this.nadisOptions = o));
    this.masterData.getGans().subscribe((o) => (this.gansOptions = o));
    this.masterData.getEducationAreas().subscribe((o) => (this.educationAreasOptions = o));
    this.masterData.getEducations().subscribe((o) => (this.educationsOptions = o));
    this.masterData.getOccupations().subscribe((o) => (this.occupationsOptions = o));
    this.masterData.getIncomePeriods().subscribe((o) => (this.incomePeriodsOptions = o));
    this.masterData.getIncomeRanges().subscribe((o) => (this.incomeRangesOptions = o));
    this.masterData.getStates().subscribe((o) => {
      this.birthStates = o;
      this.workingStates = o;
      this.nativeStates = o;
    });
    this.masterData.getCountries().subscribe((o) => (this.countries = o));
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.profileClient.getMyProfile().subscribe({
      next: (dto) => {
        const mapped = this.mapDtoToForm(dto as Record<string, unknown>);

        if (!mapped.career.workingCountryId && mapped.career.workingCountryOther) {
          mapped.career.workingCountryId = 0;
        }
        if (!mapped.career.workingStateId && mapped.career.workingStateOther) {
          mapped.career.workingStateId = 0;
        }
        if (!mapped.horoscope.birthStateId && mapped.horoscope.birthStateOther) {
          mapped.horoscope.birthStateId = 0;
        }
        if (!mapped.family.nativeStateId && !mapped.family.nativeDistrictId && mapped.family.nativeDistrictOther) {
          mapped.family.nativeStateId = 0;
        }

        this.profile.set(mapped);

        const religionId = mapped.personal.religionId;
        if (religionId) {
          this.masterData.getCastes(religionId).subscribe((o) => (this.casteOptions = o));
        }
        const casteId = mapped.personal.casteId;
        if (casteId) {
          this.masterData.getSubCastes(casteId).subscribe((o) => (this.subCasteOptions = o));
        }
        if (mapped.career.workingStateId && mapped.career.workingStateId !== 0) {
          this.masterData.getDistricts(mapped.career.workingStateId).subscribe((o) => (this.workingDistricts = o));
        }
        if (mapped.horoscope.birthStateId && mapped.horoscope.birthStateId !== 0) {
          this.masterData.getDistricts(mapped.horoscope.birthStateId).subscribe((o) => (this.birthDistricts = o));
        }
        if (mapped.family.nativeDistrictId && mapped.family.nativeDistrictId !== 0) {
          this.findNativeStateForDistrict(
            mapped.family.nativeDistrictId,
            mapped.family.nativeTalukaId,
            mapped.family.nativeTalukaOther,
          );
        } else if (mapped.family.nativeStateId && mapped.family.nativeStateId !== 0) {
          this.masterData.getDistricts(mapped.family.nativeStateId).subscribe((o) => (this.nativeDistricts = o));
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load profile. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  onReligionChange(religionId: number | null): void {
    this.updateField('personal', 'religionId', religionId);
    this.updateField('personal', 'casteId', null);
    this.updateField('personal', 'subCasteId', null);
    this.casteOptions = [];
    this.subCasteOptions = [];
    if (religionId) {
      this.masterData.getCastes(religionId).subscribe((o) => (this.casteOptions = o));
    }
  }

  onCasteChange(casteId: number | null): void {
    this.updateField('personal', 'casteId', casteId);
    this.updateField('personal', 'subCasteId', null);
    this.subCasteOptions = [];
    if (casteId) {
      this.masterData.getSubCastes(casteId).subscribe((o) => (this.subCasteOptions = o));
    }
  }

  onWorkingCountryChange(countryId: number | null): void {
    this.updateField('career', 'workingCountryId', countryId);
    this.updateField('career', 'workingStateId', null);
    this.updateField('career', 'workingStateOther', '');
    this.updateField('career', 'workingCity', '');
    this.workingDistricts = [];
  }

  onWorkingStateChange(stateId: number | null): void {
    this.updateField('career', 'workingStateId', stateId);
    this.updateField('career', 'workingCity', '');
    this.workingDistricts = [];
    if (stateId) {
      this.masterData.getDistricts(stateId).subscribe((o) => (this.workingDistricts = o));
    }
  }

  onBirthStateChange(stateId: number | null): void {
    this.updateField('horoscope', 'birthStateId', stateId);
    this.updateField('horoscope', 'birthStateOther', '');
    this.updateField('horoscope', 'birthDistrictId', null);
    this.updateField('horoscope', 'birthDistrictOther', '');
    this.birthDistricts = [];
    if (stateId) {
      this.masterData.getDistricts(stateId).subscribe((o) => (this.birthDistricts = o));
    }
  }

  onNativeStateChange(stateId: number | null): void {
    this.updateField('family', 'nativeStateId', stateId);
    this.updateField('family', 'nativeDistrictId', null);
    this.updateField('family', 'nativeDistrictOther', '');
    this.updateField('family', 'nativeTalukaId', null);
    this.updateField('family', 'nativeTalukaOther', '');
    this.nativeDistricts = [];
    this.nativeTalukas = [];
    if (stateId) {
      this.masterData.getDistricts(stateId).subscribe((o) => (this.nativeDistricts = o));
    }
  }

  onNativeDistrictChange(districtId: number | null): void {
    this.updateField('family', 'nativeDistrictId', districtId);
    this.updateField('family', 'nativeTalukaId', null);
    this.updateField('family', 'nativeTalukaOther', '');
    this.nativeTalukas = [];
    if (districtId) {
      this.masterData.getTalukas(districtId).subscribe((o) => (this.nativeTalukas = o));
    }
  }

  findNativeStateForDistrict(districtId: number, talukaId: number | null, talukaOther: string): void {
    let found = false;
    for (const state of this.nativeStates) {
      if (found) break;
      this.masterData.getDistricts(state.stateId).subscribe((districts) => {
        if (found) return;
        if (districts.some((d) => d.districtId === districtId)) {
          found = true;
          this.updateField('family', 'nativeStateId', state.stateId);
          this.nativeDistricts = districts;
          this.updateField('family', 'nativeDistrictId', districtId);
          if (talukaId && talukaId !== 0) {
            this.masterData.getTalukas(districtId).subscribe((talukas) => {
              this.nativeTalukas = talukas;
              this.updateField('family', 'nativeTalukaId', talukaId);
            });
          } else if (talukaOther) {
            this.updateField('family', 'nativeTalukaId', 0);
          }
        }
      });
    }
  }

  toggleSection(index: number): void {
    this.activeSection.set(this.activeSection() === index ? -1 : index);
  }

  onExpectedCasteNoBarChange(): void {
    this.updateField('partnerPreference', 'expectedCasteIds', []);
  }

  onExpectedEducationNoBarChange(): void {
    this.updateField('partnerPreference', 'expectedEducationIds', []);
  }

  onExpectedOccupationNoBarChange(): void {
    this.updateField('partnerPreference', 'expectedOccupationIds', []);
  }

  updateField<K extends keyof EditableProfile>(
    group: K,
    field: keyof EditableProfile[K],
    value: unknown,
  ): void {
    this.profile.update((p) => {
      const next = { ...p };
      (next[group] as Record<string, unknown>)[field as string] = value;
      return next;
    });
  }

  onSubmit(): void {
    const p = this.profile();
    const errors: string[] = [];
    if (!p.personal.firstName.trim()) errors.push('First name is required.');
    if (!p.personal.genderId) errors.push('Gender is required.');
    if (!p.personal.religionId) errors.push('Religion is required.');
    if (!p.personal.maritalStatusId) errors.push('Marital status is required.');
    if (errors.length > 0) {
      this.validationErrors.set(errors);
      this.error.set('Please fix the highlighted fields.');
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);
    this.validationErrors.set([]);
    this.successMessage.set(null);

    const dto = this.buildDto(p);

    this.profileClient.updateMyProfile(dto).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set('Profile updated successfully.');
        setTimeout(() => this.router.navigate(['/my-profile']), 1200);
      },
      error: (err) => {
        this.isSaving.set(false);
        if (err?.status === 400 && err?.error?.errors) {
          const fieldErrors: Record<string, string[]> = err.error.errors;
          const messages: string[] = [];
          for (const [field, msgs] of Object.entries(fieldErrors)) {
            const label = field.replace(/^[^.]+\./, '').replace(/([A-Z])/g, ' $1').trim();
            for (const msg of msgs) messages.push(`${label}: ${msg}`);
          }
          this.validationErrors.set(messages);
        } else {
          const msg = err?.error?.error || err?.error?.detail || 'Failed to update profile. Please try again.';
          this.error.set(msg);
        }
      },
    });
  }

  getTags(field: 'preferredCities' | 'interests'): string[] {
    return (this.profile()[field] ?? '')
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  onTagKeydown(event: KeyboardEvent, field: 'preferredCities' | 'interests'): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addTagFromInput(field, event);
    }
  }

  addTagFromInput(field: 'preferredCities' | 'interests', event?: Event): void {
    const input = (event?.target ?? document.activeElement) as HTMLInputElement | null;
    const text = (input?.value ?? '').trim().replace(/,/g, '');
    if (!text) return;
    const tags = this.getTags(field);
    if (!tags.includes(text)) {
      tags.push(text);
      this.setTags(field, tags);
    }
    if (input) input.value = '';
  }

  removeTag(field: 'preferredCities' | 'interests', tag: string): void {
    this.setTags(field, this.getTags(field).filter((t) => t !== tag));
  }

  private setTags(field: 'preferredCities' | 'interests', tags: string[]): void {
    const joined = tags.join(', ');
    this.profile.update((p) =>
      field === 'interests' ? { ...p, interests: joined } : { ...p, preferredCities: joined },
    );
  }

  private splitCsv(value: string): string[] | undefined {
    const parts = value.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    return parts.length > 0 ? parts : undefined;
  }

  private buildDto(p: EditableProfile): CreateProfileDto {
    const fullName = [p.personal.firstName, p.personal.middleName, p.personal.lastName]
      .filter((v) => v.trim().length > 0).join(' ');

    const phones: Array<{ phoneType: string; phoneNumber: string }> = [];
    if (p.contact.smsMobile) phones.push({ phoneType: 'sms_mobile', phoneNumber: p.contact.smsMobile });
    if (p.contact.mobileSecondary) phones.push({ phoneType: 'mobile_secondary', phoneNumber: p.contact.mobileSecondary });
    if (p.contact.phonePrimary) phones.push({ phoneType: 'phone_primary', phoneNumber: p.contact.phonePrimary });
    if (p.contact.phoneSecondary) phones.push({ phoneType: 'phone_secondary', phoneNumber: p.contact.phoneSecondary });

    const computeAge = (pd: EditableProfile['personal']): number | undefined => {
      if (!pd.dobYear) return undefined;
      return new Date().getFullYear() - pd.dobYear;
    };

    return {
      fullName: fullName || undefined,
      age: computeAge(p.personal),
      bio: p.bio || undefined,
      locationText: p.locationText || undefined,
      personalDetails: {
        firstName: p.personal.firstName || undefined,
        middleName: p.personal.middleName || undefined,
        lastName: p.personal.lastName || undefined,
        dobDay: p.personal.dobDay ?? undefined,
        dobMonth: p.personal.dobMonth || undefined,
        dobYear: p.personal.dobYear ?? undefined,
        genderId: p.personal.genderId ?? undefined,
        religionId: p.personal.religionId ?? undefined,
        casteId: p.personal.casteId ?? undefined,
        subCasteId: p.personal.subCasteId ?? undefined,
        maritalStatusId: p.personal.maritalStatusId ?? undefined,
        heightFt: p.personal.heightFt ?? undefined,
        heightIn: p.personal.heightIn ?? undefined,
        weightKg: p.personal.weightKg ?? undefined,
        bloodGroupId: p.personal.bloodGroupId ?? undefined,
        complexionId: p.personal.complexionId ?? undefined,
        physicalDisability: p.personal.physicalDisability,
        disabilityDetail: p.personal.disabilityDetail || undefined,
        dietId: p.personal.dietId ?? undefined,
        spectacles: p.personal.spectacles,
        lens: p.personal.lens,
        personalityId: p.personal.personalityId ?? undefined,
      },
      careerDetails: {
        educationAreaId: p.career.educationAreaId ?? undefined,
        educationId: p.career.educationId ?? undefined,
        occupationId: p.career.occupationId ?? undefined,
        occupationDetails: p.career.occupationDetails || undefined,
        workingCity: p.career.workingCity === '__other__' ? (p.career.workingCityOther || undefined) : (p.career.workingCity || undefined),
        workingStateId: p.career.workingStateId && p.career.workingStateId !== 0 ? p.career.workingStateId : undefined,
        workingStateOther: p.career.workingStateId === 0 ? (p.career.workingStateOther || undefined) : undefined,
        workingCountryId: p.career.workingCountryId && p.career.workingCountryId !== 0 ? p.career.workingCountryId : undefined,
        workingCountryOther: p.career.workingCountryId === 0 ? (p.career.workingCountryOther || undefined) : undefined,
        incomeAmount: p.career.incomeAmount ?? undefined,
        incomePeriodId: p.career.incomePeriodId ?? undefined,
      },
      contactDetails: {
        residenceAddress: p.contact.residenceAddress || undefined,
        contactEmail: p.contact.contactEmail || undefined,
        idProofNumber: p.contact.idProofNumber || undefined,
      },
      phoneNumbers: phones.length > 0 ? phones : undefined,
      familyDetails: {
        fatherStatus: p.family.fatherStatus,
        motherStatus: p.family.motherStatus,
        brothers: p.family.brothers ?? undefined,
        marriedBrothers: p.family.marriedBrothers ?? undefined,
        sisters: p.family.sisters ?? undefined,
        marriedSisters: p.family.marriedSisters ?? undefined,
        parentsFullName: p.family.parentsFullName || undefined,
        parentsOccupation: p.family.parentsOccupation || undefined,
        parentsResidentCity: p.family.parentsResidentCity || undefined,
        familyWealth: p.family.familyWealth || undefined,
        mamaSurnamePlace: p.family.mamaSurnamePlace || undefined,
        nativeDistrictId: p.family.nativeDistrictId && p.family.nativeDistrictId !== 0 ? p.family.nativeDistrictId : undefined,
        nativeDistrictOther: p.family.nativeDistrictId === 0 ? (p.family.nativeDistrictOther || undefined) : undefined,
        nativeTalukaId: p.family.nativeTalukaId && p.family.nativeTalukaId !== 0 ? p.family.nativeTalukaId : undefined,
        nativeTalukaOther: p.family.nativeTalukaId === 0 ? (p.family.nativeTalukaOther || undefined) : undefined,
        intercastMarriage: p.family.intercastMarriage,
        intercastRelation: p.family.intercastRelation || undefined,
      },
      partnerPreference: {
        expectedManglik: p.partnerPreference.expectedManglik,
        maxAgeDifference: p.partnerPreference.maxAgeDifference ?? undefined,
        expectedHeightFt: p.partnerPreference.expectedHeightFt ?? undefined,
        expectedHeightIn: p.partnerPreference.expectedHeightIn ?? undefined,
        divorcee: p.partnerPreference.divorcee,
        expectedCasteNoBar: p.partnerPreference.expectedCasteNoBar,
        expectedEducationNoBar: p.partnerPreference.expectedEducationNoBar,
        expectedOccupationNoBar: p.partnerPreference.expectedOccupationNoBar,
        expectedIncomeRangeId: p.partnerPreference.expectedIncomeRangeId ?? undefined,
      },
      expectedCasteIds: p.partnerPreference.expectedCasteIds.length > 0 ? p.partnerPreference.expectedCasteIds : undefined,
      expectedEducationIds: p.partnerPreference.expectedEducationIds.length > 0 ? p.partnerPreference.expectedEducationIds : undefined,
      expectedOccupationIds: p.partnerPreference.expectedOccupationIds.length > 0 ? p.partnerPreference.expectedOccupationIds : undefined,
      preferredCities: this.splitCsv(p.preferredCities),
      interests: this.splitCsv(p.interests),
      profileHoroscope: {
        manglik: p.horoscope.manglik,
        rashiId: p.horoscope.rashiId ?? undefined,
        nakshatraId: p.horoscope.nakshatraId ?? undefined,
        charanId: p.horoscope.charanId ?? undefined,
        nadiId: p.horoscope.nadiId ?? undefined,
        ganId: p.horoscope.ganId ?? undefined,
        birthHour: p.horoscope.birthHour ?? undefined,
        birthMinute: p.horoscope.birthMinute ?? undefined,
        birthPeriod: p.horoscope.birthPeriod || undefined,
        devak: p.horoscope.devak || undefined,
        birthStateId: p.horoscope.birthStateId && p.horoscope.birthStateId !== 0 ? p.horoscope.birthStateId : undefined,
        birthStateOther: p.horoscope.birthStateOther || undefined,
        birthDistrictId: p.horoscope.birthDistrictId && p.horoscope.birthDistrictId !== 0 ? p.horoscope.birthDistrictId : undefined,
        birthDistrictOther: p.horoscope.birthDistrictOther || undefined,
      },
    };
  }

  private num(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private parseIdList(value: unknown): number[] {
    if (Array.isArray(value)) {
      return value.map((v) => Number(v)).filter((n) => Number.isFinite(n) && n > 0);
    }
    if (typeof value === 'string' && value.trim()) {
      return value.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n > 0);
    }
    return [];
  }

  private toCsv(value: unknown): string {
    if (Array.isArray(value)) return value.filter(Boolean).join(', ');
    if (typeof value === 'string') return value;
    return '';
  }

  private normalizeMonth(raw: unknown): string {
    if (raw === null || raw === undefined) return '';
    const lower = String(raw).trim().toLowerCase();
    if (!lower) return '';
    if (/^[a-z]{3}$/.test(lower)) return String(raw).trim().slice(0, 3);
    const n = Number(lower);
    if (Number.isFinite(n) && n >= 1 && n <= 12) return this.months[n - 1];
    const fullMap: Record<string, string> = {
      january: 'Jan', february: 'Feb', march: 'Mar', april: 'Apr', may: 'May', june: 'Jun',
      july: 'Jul', august: 'Aug', september: 'Sep', october: 'Oct', november: 'Nov', december: 'Dec',
    };
    return fullMap[lower] ?? '';
  }

  private mapDtoToForm(dto: Record<string, unknown>): EditableProfile {
    const pd = (dto['personalDetails'] ?? {}) as Record<string, unknown>;
    const career = (dto['career'] ?? {}) as Record<string, unknown>;
    const contact = (dto['contact'] ?? {}) as Record<string, unknown>;
    const family = (dto['familyInfo'] ?? {}) as Record<string, unknown>;
    const partner = (dto['partnerPreference'] ?? {}) as Record<string, unknown>;
    const hd = (dto['horoscope'] ?? {}) as Record<string, unknown>;
    const phones = (dto['phoneNumbers'] ?? []) as Array<{ phoneType?: string; phoneNumber?: string }>;
    const phoneByType = (type: string) => phones.find((p) => p.phoneType === type)?.phoneNumber ?? '';
    const pick = (obj: Record<string, unknown>, ...keys: string[]): unknown => {
      for (const k of keys) {
        if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
      }
      return undefined;
    };

    const nameParts = String(dto['fullName'] ?? '').split(' ').filter(Boolean);
    const firstName = String(pd['firstName'] ?? nameParts[0] ?? '');
    const lastName = String(pd['lastName'] ?? (nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''));
    const middleName = String(pd['middleName'] ?? (nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : ''));

    return {
      bio: String(dto['bio'] ?? ''),
      locationText: String(dto['locationText'] ?? ''),
      interests: this.toCsv(dto['interests']),
      personal: {
        firstName,
        middleName,
        lastName,
        dobDay: this.num(pick(pd, 'DobDay', 'dobDay')),
        dobMonth: this.normalizeMonth(pick(pd, 'DobMonth', 'dobMonth')),
        dobYear: this.num(pick(pd, 'DobYear', 'dobYear')),
        genderId: this.num(pick(pd, 'GenderId', 'genderId')),
        religionId: this.num(pick(pd, 'ReligionId', 'religionId')),
        casteId: this.num(pick(pd, 'CasteId', 'casteId')),
        subCasteId: this.num(pick(pd, 'SubCasteId', 'subCasteId')),
        maritalStatusId: this.num(pick(pd, 'MaritalStatusId', 'maritalStatusId')),
        heightFt: this.num(pick(pd, 'HeightFt', 'heightFt')) ?? 5,
        heightIn: this.num(pick(pd, 'HeightIn', 'heightIn')) ?? 4,
        weightKg: this.num(pick(pd, 'WeightKg', 'weightKg')) ?? 50,
        bloodGroupId: this.num(pick(pd, 'BloodGroupId', 'bloodGroupId')),
        complexionId: this.num(pick(pd, 'ComplexionId', 'complexionId')),
        dietId: this.num(pick(pd, 'DietId', 'dietId')),
        personalityId: this.num(pick(pd, 'PersonalityId', 'personalityId')),
        physicalDisability: Boolean(pick(pd, 'PhysicalDisability', 'physicalDisability')),
        disabilityDetail: String(pick(pd, 'DisabilityDetail', 'disabilityDetail') ?? ''),
        spectacles: Boolean(pick(pd, 'Spectacles', 'spectacles')),
        lens: Boolean(pick(pd, 'Lens', 'lens')),
      },
      career: {
        educationAreaId: this.num(pick(career, 'EducationAreaId', 'educationAreaId')),
        educationId: this.num(pick(career, 'EducationId', 'educationId')),
        occupationId: this.num(pick(career, 'OccupationId', 'occupationId')),
        occupationDetails: String(pick(career, 'OccupationDetails', 'occupationDetails') ?? ''),
        workingCountryId: this.num(pick(career, 'WorkingCountryId', 'workingCountryId')),
        workingCountryOther: String(pick(career, 'WorkingCountryOther', 'workingCountryOther') ?? ''),
        workingStateId: this.num(pick(career, 'WorkingStateId', 'workingStateId')),
        workingStateOther: String(pick(career, 'WorkingStateOther', 'workingStateOther') ?? ''),
        workingCity: String(pick(career, 'WorkingCity', 'workingCity') ?? ''),
        workingCityOther: String(pick(career, 'WorkingCityOther', 'workingCityOther') ?? ''),
        incomeAmount: this.num(pick(career, 'IncomeAmount', 'incomeAmount')),
        incomePeriodId: this.num(pick(career, 'IncomePeriodId', 'incomePeriodId')),
      },
      contact: {
        residenceAddress: String(pick(contact, 'ResidenceAddress', 'residenceAddress') ?? ''),
        contactEmail: String(pick(contact, 'ContactEmail', 'contactEmail') ?? ''),
        idProofNumber: String(pick(contact, 'IdProofNumber', 'idProofNumber') ?? ''),
        smsMobile: phoneByType('sms_mobile') || phoneByType('Mobile'),
        mobileSecondary: phoneByType('mobile_secondary') || phoneByType('Mobile2'),
        phonePrimary: phoneByType('phone_primary') || phoneByType('Phone'),
        phoneSecondary: phoneByType('phone_secondary') || phoneByType('Phone2'),
      },
      family: {
        fatherStatus: Boolean(pick(family, 'FatherStatus', 'fatherStatus')),
        motherStatus: Boolean(pick(family, 'MotherStatus', 'motherStatus')),
        brothers: this.num(pick(family, 'Brothers', 'brothers')) ?? 0,
        marriedBrothers: this.num(pick(family, 'MarriedBrothers', 'marriedBrothers')) ?? 0,
        sisters: this.num(pick(family, 'Sisters', 'sisters')) ?? 0,
        marriedSisters: this.num(pick(family, 'MarriedSisters', 'marriedSisters')) ?? 0,
        parentsFullName: String(pick(family, 'ParentsFullName', 'parentsFullName') ?? ''),
        parentsOccupation: String(pick(family, 'ParentsOccupation', 'parentsOccupation') ?? ''),
        parentsResidentCity: String(pick(family, 'ParentsResidentCity', 'parentsResidentCity') ?? ''),
        familyWealth: String(pick(family, 'FamilyWealth', 'familyWealth') ?? ''),
        mamaSurnamePlace: String(pick(family, 'MamaSurnamePlace', 'mamaSurnamePlace') ?? ''),
        nativeStateId: this.num(pick(family, 'NativeStateId', 'nativeStateId')),
        nativeStateOther: String(pick(family, 'NativeStateOther', 'nativeStateOther') ?? ''),
        nativeDistrictId: this.num(pick(family, 'NativeDistrictId', 'nativeDistrictId')),
        nativeDistrictOther: String(pick(family, 'NativeDistrictOther', 'nativeDistrictOther') ?? ''),
        nativeTalukaId: this.num(pick(family, 'NativeTalukaId', 'nativeTalukaId')),
        nativeTalukaOther: String(pick(family, 'NativeTalukaOther', 'nativeTalukaOther') ?? ''),
        intercastMarriage: Boolean(pick(family, 'IntercastMarriage', 'intercastMarriage')),
        intercastRelation: String(pick(family, 'IntercastRelation', 'intercastRelation') ?? ''),
      },
      partnerPreference: {
        expectedManglik: Boolean(pick(partner, 'ExpectedManglik', 'expectedManglik')),
        maxAgeDifference: this.num(pick(partner, 'MaxAgeDifference', 'maxAgeDifference')) ?? 5,
        expectedHeightFt: this.num(pick(partner, 'ExpectedHeightFt', 'expectedHeightFt')) ?? 5,
        expectedHeightIn: this.num(pick(partner, 'ExpectedHeightIn', 'expectedHeightIn')) ?? 0,
        divorcee: Boolean(pick(partner, 'Divorcee', 'divorcee')),
        expectedCasteNoBar: Boolean(pick(partner, 'ExpectedCasteNoBar', 'expectedCasteNoBar')),
        expectedEducationNoBar: Boolean(pick(partner, 'ExpectedEducationNoBar', 'expectedEducationNoBar')),
        expectedOccupationNoBar: Boolean(pick(partner, 'ExpectedOccupationNoBar', 'expectedOccupationNoBar')),
        expectedIncomeRangeId: this.num(pick(partner, 'ExpectedIncomeRangeId', 'expectedIncomeRangeId')),
        expectedCasteIds: this.parseIdList(dto['expectedCasteIds']),
        expectedEducationIds: this.parseIdList(dto['expectedEducationIds']),
        expectedOccupationIds: this.parseIdList(dto['expectedOccupationIds']),
      },
      horoscope: {
        manglik: Boolean(pick(hd, 'Manglik', 'manglik')),
        rashiId: this.num(pick(hd, 'RashiId', 'rashiId')),
        nakshatraId: this.num(pick(hd, 'NakshatraId', 'nakshatraId')),
        charanId: this.num(pick(hd, 'CharanId', 'charanId')),
        nadiId: this.num(pick(hd, 'NadiId', 'nadiId')),
        ganId: this.num(pick(hd, 'GanId', 'ganId')),
        birthHour: this.num(pick(hd, 'BirthHour', 'birthHour')),
        birthMinute: this.num(pick(hd, 'BirthMinute', 'birthMinute')),
        birthPeriod: String(pick(hd, 'BirthPeriod', 'birthPeriod') ?? ''),
        devak: String(pick(hd, 'Devak', 'devak') ?? ''),
        birthStateId: this.num(pick(hd, 'BirthStateId', 'birthStateId')),
        birthStateOther: String(pick(hd, 'BirthStateOther', 'birthStateOther') ?? ''),
        birthDistrictId: this.num(pick(hd, 'BirthDistrictId', 'birthDistrictId')),
        birthDistrictOther: String(pick(hd, 'BirthDistrictOther', 'birthDistrictOther') ?? ''),
      },
      preferredCities: this.toCsv(dto['preferredCities']),
    };
  }
}
