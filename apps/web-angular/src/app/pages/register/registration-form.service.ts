import { Injectable, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { normalizeText, normalizePhone, isValidTenDigitPhone, isValidEmail, isValidName } from '@org/shared-utils';
import { CreateProfileDto } from '@org/generated';

export interface EnrollStep {
  title: string;
}

export const STEP_GROUP_NAMES: Record<number, string> = {
  1: 'personalDetails',
  2: 'profileHoroscope',
  3: 'careerDetails',
  4: 'contactDetails',
  5: 'familyDetails',
  6: 'partnerPreference',
};

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export interface CaptchaData {
  code: string;
  imageDataUrl: string;
}

@Injectable({ providedIn: 'root' })
export class RegistrationFormService {
  private readonly translate = inject(TranslateService);

  private static readonly CAPTCHA_LENGTH = 6;
  private static readonly CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  createForm(): FormGroup {
    return new FormGroup({
      personalDetails: this.createPersonalDetailsGroup(),
      profileHoroscope: this.createHoroscopeGroup(),
      careerDetails: this.createCareerDetailsGroup(),
      contactDetails: this.createContactDetailsGroup(),
      familyDetails: this.createFamilyDetailsGroup(),
      partnerPreference: this.createPartnerPreferenceGroup(),
      fullName: new FormControl<string | null>(null),
      age: new FormControl<number | null>(null),
      bio: new FormControl<string | null>(null),
      locationText: new FormControl<string | null>(null),
      occupationText: new FormControl<string | null>(null),
      preferredCities: new FormControl(''),
      relativesSurnames: new FormControl(''),
      interests: new FormControl(''),
      account: this.createAccountGroup(),
      verification: this.createVerificationGroup(),
      photos: this.createPhotosGroup(),
    });
  }

  private createPersonalDetailsGroup(): FormGroup {
    return new FormGroup({
      firstName: new FormControl('', { validators: [Validators.required], nonNullable: false }),
      middleName: new FormControl(''),
      lastName: new FormControl('', { validators: [Validators.required], nonNullable: false }),
      dobDay: new FormControl<number | null>(null, { validators: [Validators.required], nonNullable: true }),
      dobMonth: new FormControl('', { validators: [Validators.required], nonNullable: true }),
      dobYear: new FormControl<number | null>(null, { validators: [Validators.required], nonNullable: true }),
      genderId: new FormControl<number | null>(null, { validators: [Validators.required], nonNullable: true }),
      religionId: new FormControl<number | null>(null, { validators: [Validators.required], nonNullable: true }),
      casteId: new FormControl<number | null>(null, { validators: [Validators.required], nonNullable: true }),
      subCasteId: new FormControl<number | null>(null),
      maritalStatusId: new FormControl<number | null>(null, { validators: [Validators.required], nonNullable: true }),
      heightFt: new FormControl(5, { nonNullable: true }),
      heightIn: new FormControl(4, { nonNullable: true }),
      weightKg: new FormControl(40, { nonNullable: true }),
      bloodGroupId: new FormControl<number | null>(null),
      complexionId: new FormControl<number | null>(null),
      physicalDisability: new FormControl(false, { nonNullable: true }),
      disabilityDetail: new FormControl(''),
      dietId: new FormControl<number | null>(null),
      spectacles: new FormControl(false, { nonNullable: true }),
      lens: new FormControl(false, { nonNullable: true }),
      personalityId: new FormControl<number | null>(null),
    });
  }

  private createHoroscopeGroup(): FormGroup {
    return new FormGroup({
      manglik: new FormControl(false, { nonNullable: true }),
      rashiId: new FormControl<number | null>(null),
      nakshatraId: new FormControl<number | null>(null),
      charanId: new FormControl<number | null>(null),
      nadiId: new FormControl<number | null>(null),
      ganId: new FormControl<number | null>(null),
      birthHour: new FormControl(1, { nonNullable: true }),
      birthMinute: new FormControl(0, { nonNullable: true }),
      birthPeriod: new FormControl('', { validators: [Validators.required], nonNullable: true }),
      birthStateId: new FormControl<number | null>(null),
      birthStateOther: new FormControl(''),
      birthDistrictId: new FormControl<number | null>(null),
      birthDistrictOther: new FormControl(''),
      devak: new FormControl(''),
    });
  }

  private createCareerDetailsGroup(): FormGroup {
    return new FormGroup({
      educationAreaId: new FormControl<number | null>(null, { validators: [Validators.required], nonNullable: true }),
      educationId: new FormControl<number | null>(null, { validators: [Validators.required], nonNullable: true }),
      occupationId: new FormControl<number | null>(null, { validators: [Validators.required], nonNullable: true }),
      occupationDetails: new FormControl('', { validators: [Validators.required], nonNullable: true }),
      workingCity: new FormControl('', { validators: [Validators.required], nonNullable: true }),
      workingCityOther: new FormControl(''),
      workingStateId: new FormControl<number | null>(null),
      workingStateOther: new FormControl(''),
      workingCountryId: new FormControl<number | null>(null),
      workingCountryOther: new FormControl(''),
      incomeAmount: new FormControl<number | null>(null, { validators: [Validators.required], nonNullable: true }),
      incomePeriodId: new FormControl<number | null>(null),
    });
  }

  private createContactDetailsGroup(): FormGroup {
    return new FormGroup({
      residenceAddress: new FormControl('', { validators: [Validators.required, Validators.minLength(10)], nonNullable: true }),
      contactEmail: new FormControl('', { validators: [Validators.required, Validators.email], nonNullable: true }),
      idProofNumber: new FormControl(''),
      smsMobile: new FormControl('', { validators: [Validators.required, this.phoneValidator], nonNullable: true }),
      mobile2: new FormControl('', { validators: [this.phoneValidator], nonNullable: true }),
      phone1: new FormControl('', { validators: [this.phoneValidator], nonNullable: true }),
      phone2: new FormControl('', { validators: [this.phoneValidator], nonNullable: true }),
    });
  }

  private phoneValidator = (control: AbstractControl): { [key: string]: boolean } | null => {
    const value = control.value;
    if (!value) return null;
    return isValidTenDigitPhone(value) ? null : { invalidPhone: true };
  };

  private createFamilyDetailsGroup(): FormGroup {
    return new FormGroup({
      fatherStatus: new FormControl(false, { nonNullable: true }),
      motherStatus: new FormControl(false, { nonNullable: true }),
      brothers: new FormControl(0, { nonNullable: true }),
      marriedBrothers: new FormControl(0, { nonNullable: true }),
      sisters: new FormControl(0, { nonNullable: true }),
      marriedSisters: new FormControl(0, { nonNullable: true }),
      parentsFullName: new FormControl('', { validators: [Validators.required], nonNullable: true }),
      parentsOccupation: new FormControl(''),
      parentsResidentCity: new FormControl(''),
      familyWealth: new FormControl(''),
      mamaSurnamePlace: new FormControl(''),
      nativeStateId: new FormControl<number | null>(null),
      nativeStateOther: new FormControl(''),
      nativeDistrictId: new FormControl<number | null>(null, { validators: [Validators.required], nonNullable: true }),
      nativeDistrictOther: new FormControl(''),
      nativeTalukaId: new FormControl<number | null>(null),
      nativeTalukaOther: new FormControl(''),
      intercastMarriage: new FormControl(false, { nonNullable: true }),
      intercastRelation: new FormControl(''),
    }, {
      validators: [
        (g: AbstractControl) => g.get('marriedBrothers')!.value > g.get('brothers')!.value
          ? { marriedBrothersExceeds: true } : null,
        (g: AbstractControl) => g.get('marriedSisters')!.value > g.get('sisters')!.value
          ? { marriedSistersExceeds: true } : null,
      ],
    });
  }

  private createPartnerPreferenceGroup(): FormGroup {
    return new FormGroup({
      expectedManglik: new FormControl(false, { nonNullable: true }),
      maxAgeDifference: new FormControl(0, { nonNullable: true }),
      expectedHeightFt: new FormControl(5, { nonNullable: true }),
      expectedHeightIn: new FormControl(0, { nonNullable: true }),
      divorcee: new FormControl(false, { nonNullable: true }),
      expectedCasteNoBar: new FormControl(false, { nonNullable: true }),
      expectedEducationNoBar: new FormControl(false, { nonNullable: true }),
      expectedOccupationNoBar: new FormControl(false, { nonNullable: true }),
      expectedCasteIds: new FormControl(''),
      expectedEducationIds: new FormControl(''),
      expectedOccupationIds: new FormControl(''),
      expectedIncomeRangeId: new FormControl<number | null>(null),
    });
  }

  private createAccountGroup(): FormGroup {
    return new FormGroup({
      password: new FormControl('', { validators: [Validators.required, Validators.minLength(8)], nonNullable: true }),
      confirmPassword: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    }, {
      validators: (g: AbstractControl) => g.get('password')!.value === g.get('confirmPassword')!.value
        ? null : { passwordMismatch: true },
    });
  }

  private createVerificationGroup(): FormGroup {
    return new FormGroup({
      code: new FormControl(''),
      input: new FormControl(''),
      imageDataUrl: new FormControl(''),
    });
  }

  private createPhotosGroup(): FormGroup {
    return new FormGroup({
      photo1Name: new FormControl(''),
    });
  }

  getSteps(): EnrollStep[] {
    return [
      { title: this.t('register.steps.personal') },
      { title: this.t('register.steps.horoscope') },
      { title: this.t('register.steps.education') },
      { title: this.t('register.steps.address') },
      { title: this.t('register.steps.family') },
      { title: this.t('register.steps.expectation') },
    ];
  }

  validateStep(form: FormGroup, step: number): ValidationResult {
    const pd = form.get('personalDetails')!.value;
    const hd = form.get('profileHoroscope')!.value;
    const cd = form.get('careerDetails')!.value;
    const ct = form.get('contactDetails')!.value;
    const fd = form.get('familyDetails')!.value;
    const pp = form.get('partnerPreference')!.value;
    const verification = form.get('verification')!.value;
    const account = form.get('account')!.value;

    if (step === 1) {
      if (!normalizeText(pd.firstName) || !normalizeText(pd.lastName)) {
        return { isValid: false, errorMessage: this.t('register.errors.nameRequired') };
      }
      if (!isValidName(pd.firstName || '') || !isValidName(pd.lastName || '')) {
        return { isValid: false, errorMessage: this.t('register.errors.nameCharsOnly') };
      }
      if (!pd.dobDay || !pd.dobMonth || !pd.dobYear) {
        return { isValid: false, errorMessage: this.t('register.errors.dobComplete') };
      }
      if (!pd.genderId) {
        return { isValid: false, errorMessage: this.t('register.errors.genderRequired') };
      }
      if (!pd.religionId) {
        return { isValid: false, errorMessage: this.t('register.errors.religionRequired') };
      }
      const age = new Date().getFullYear() - (pd.dobYear || 0);
      if (Number.isNaN(age) || age < 18 || age > 80) {
        return { isValid: false, errorMessage: this.t('register.errors.ageRange') };
      }
      if (pd.physicalDisability && !normalizeText(pd.disabilityDetail || '')) {
        return { isValid: false, errorMessage: this.t('register.errors.disabilityDetail') };
      }
    }

    if (step === 2) {
      if (!hd.birthPeriod) {
        return { isValid: false, errorMessage: this.t('register.errors.birthPeriod') };
      }
      const birthStateIsOther = hd.birthStateId === 0;
      const birthDistrictIsSelected = hd.birthDistrictId && hd.birthDistrictId !== 0;
      const birthDistrictIsOther = hd.birthDistrictId === 0;
      if (!birthStateIsOther && !birthDistrictIsSelected && !birthDistrictIsOther) {
        return { isValid: false, errorMessage: this.t('register.errors.birthDistrict') };
      }
    }

    if (step === 3) {
      if (!cd.educationAreaId || !cd.educationId) {
        return { isValid: false, errorMessage: this.t('register.errors.educationDetails') };
      }
      if (!cd.occupationId || !normalizeText(cd.occupationDetails || '')) {
        return { isValid: false, errorMessage: this.t('register.errors.occupationDetails') };
      }
      if (!cd.workingCity) {
        return { isValid: false, errorMessage: this.t('register.errors.workingCity') };
      }
      if (cd.incomeAmount && !Number.isFinite(Number(cd.incomeAmount))) {
        return { isValid: false, errorMessage: this.t('register.errors.incomeNumeric') };
      }
    }

    if (step === 4) {
      const address = normalizeText(ct.residenceAddress || '');
      if (!address || address.length < 10) {
        return { isValid: false, errorMessage: this.t('register.errors.residenceAddress') };
      }
      if (!isValidEmail(ct.contactEmail || '')) {
        return { isValid: false, errorMessage: this.t('register.errors.contactEmail') };
      }
      if (!isValidTenDigitPhone(ct.smsMobile || '')) {
        return { isValid: false, errorMessage: this.t('register.errors.smsMobile') };
      }
      if (ct.mobile2 && !isValidTenDigitPhone(ct.mobile2)) {
        return { isValid: false, errorMessage: this.t('register.errors.mobile2') };
      }
      if (ct.phone1 && !isValidTenDigitPhone(ct.phone1)) {
        return { isValid: false, errorMessage: this.t('register.errors.phone1') };
      }
      if (ct.phone2 && !isValidTenDigitPhone(ct.phone2)) {
        return { isValid: false, errorMessage: this.t('register.errors.phone2') };
      }

      const normalize = (v: string) => normalizePhone(v);
      form.get('contactDetails')!.patchValue({
        smsMobile: normalize(ct.smsMobile || ''),
        mobile2: ct.mobile2 ? normalize(ct.mobile2) : '',
        phone1: ct.phone1 ? normalize(ct.phone1) : '',
        phone2: ct.phone2 ? normalize(ct.phone2) : '',
        residenceAddress: ct.residenceAddress,
        contactEmail: ct.contactEmail,
        idProofNumber: ct.idProofNumber,
      });
    }

    if (step === 5) {
      if (!normalizeText(fd.parentsFullName || '')) {
        return { isValid: false, errorMessage: this.t('register.errors.parentsFullName') };
      }
      const stateIsOther = fd.nativeStateId === 0;
      const districtIsSelected = fd.nativeDistrictId && fd.nativeDistrictId !== 0;
      const districtIsOther = fd.nativeDistrictId === 0;
      if (!stateIsOther && !districtIsSelected && !districtIsOther) {
        return { isValid: false, errorMessage: this.t('register.errors.nativeDistrict') };
      }
    }

    if (step === 6) {
      if (!normalizeText(form.get('preferredCities')!.value || '')) {
        return { isValid: false, errorMessage: this.t('register.errors.preferredCities') };
      }
      if (!account.password || !account.confirmPassword) {
        return { isValid: false, errorMessage: this.t('register.errors.accountPassword') };
      }
      if (account.password.length < 8) {
        return { isValid: false, errorMessage: this.t('register.errors.passwordMin') };
      }
      if (account.password !== account.confirmPassword) {
        return { isValid: false, errorMessage: this.t('register.errors.passwordMatch') };
      }
      if ((verification.input || '').trim().toUpperCase() !== (verification.code || '')) {
        return { isValid: false, errorMessage: this.t('register.errors.verificationCode') };
      }
    }

    return { isValid: true };
  }

  generateCaptcha(): CaptchaData {
    const code = this.generateCaptchaCode();
    return {
      code,
      imageDataUrl: this.createCaptchaImage(code),
    };
  }

  private generateCaptchaCode(): string {
    let result = '';
    for (let i = 0; i < RegistrationFormService.CAPTCHA_LENGTH; i++) {
      result += RegistrationFormService.CAPTCHA_CHARS[Math.floor(Math.random() * RegistrationFormService.CAPTCHA_CHARS.length)];
    }
    return result;
  }

  private createCaptchaImage(code: string): string {
    const width = 280;
    const height = 90;
    const textNodes = code.split('').map((char, i) => {
      const x = 28 + i * 40;
      const y = 54 + Math.floor(Math.random() * 14) - 7;
      const rotate = Math.floor(Math.random() * 30) - 15;
      return `<text x="${x}" y="${y}" transform="rotate(${rotate} ${x} ${y})" font-size="36" font-family="Georgia, serif" font-weight="700" fill="#1f2638">${char}</text>`;
    }).join('');

    const noiseLines = Array.from({ length: 6 }, () => {
      const x1 = Math.floor(Math.random() * width);
      const y1 = Math.floor(Math.random() * height);
      const x2 = Math.floor(Math.random() * width);
      const y2 = Math.floor(Math.random() * height);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#b88b66" stroke-width="1" opacity="0.45" />`;
    }).join('');

    const noiseDots = Array.from({ length: 24 }, () => {
      const cx = Math.floor(Math.random() * width);
      const cy = Math.floor(Math.random() * height);
      const r = Math.floor(Math.random() * 2) + 1;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#8b6f47" opacity="0.25" />`;
    }).join('');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" rx="8" fill="#f9f5f0" />
      ${noiseLines}${noiseDots}${textNodes}
    </svg>`;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  buildCreateProfileDto(form: FormGroup, age?: number): CreateProfileDto {
    const f = form.value;
    const pd = f.personalDetails!;
    const hd = f.profileHoroscope!;
    const cd = f.careerDetails!;
    const ct = f.contactDetails!;
    const fd = f.familyDetails!;
    const pp = f.partnerPreference!;

    const phoneNumbers: Array<{ phoneType: string; phoneNumber: string }> = [];
    if (ct.smsMobile) phoneNumbers.push({ phoneType: 'sms_mobile', phoneNumber: ct.smsMobile });
    if (ct.mobile2) phoneNumbers.push({ phoneType: 'mobile_secondary', phoneNumber: ct.mobile2 });
    if (ct.phone1) phoneNumbers.push({ phoneType: 'phone_primary', phoneNumber: ct.phone1 });
    if (ct.phone2) phoneNumbers.push({ phoneType: 'phone_secondary', phoneNumber: ct.phone2 });

    const relativeSurnames = f.relativesSurnames
      ? f.relativesSurnames.split(/[,\n]/).map((s: string) => s.trim()).filter(Boolean)
      : undefined;

    const profilePhotos: Array<{ photoSlot: number; fileName: string; isPrimary: boolean }> = [];
    const p1 = f.photos?.photo1Name;
    if (p1) profilePhotos.push({ photoSlot: 1, fileName: p1, isPrimary: true });

    const preferredCities = f.preferredCities
      ? f.preferredCities.split(/[,\n]/).map((s: string) => s.trim()).filter(Boolean)
      : undefined;

    const interests = f.interests
      ? f.interests.split(/[,\n]/).map((s: string) => s.trim()).filter(Boolean)
      : undefined;

    const expectedCasteIds = pp.expectedCasteIds
      ? String(pp.expectedCasteIds).split(',').map((s: string) => Number(s.trim())).filter((n: number) => Number.isFinite(n) && n > 0)
      : undefined;

    const expectedEducationIds = pp.expectedEducationIds
      ? String(pp.expectedEducationIds).split(',').map((s: string) => Number(s.trim())).filter((n: number) => Number.isFinite(n) && n > 0)
      : undefined;

    const expectedOccupationIds = pp.expectedOccupationIds
      ? String(pp.expectedOccupationIds).split(',').map((s: string) => Number(s.trim())).filter((n: number) => Number.isFinite(n) && n > 0)
      : undefined;

    return {
      fullName: [pd.firstName, pd.middleName, pd.lastName].filter(Boolean).join(' '),
      age: f.age ?? age,
      bio: f.bio ?? undefined,
      locationText: (f.locationText || ct.residenceAddress || cd.workingCity) ?? undefined,
      occupationText: (f.occupationText || cd.occupationDetails) ?? undefined,
      personalDetails: {
        firstName: pd.firstName ?? undefined,
        middleName: pd.middleName ?? undefined,
        lastName: pd.lastName ?? undefined,
        dobDay: pd.dobDay ?? undefined,
        dobMonth: pd.dobMonth ?? undefined,
        dobYear: pd.dobYear ?? undefined,
        genderId: pd.genderId ?? undefined,
        religionId: pd.religionId ?? undefined,
        casteId: pd.casteId ?? undefined,
        subCasteId: pd.subCasteId ?? undefined,
        maritalStatusId: pd.maritalStatusId ?? undefined,
        heightFt: pd.heightFt ?? undefined,
        heightIn: pd.heightIn ?? undefined,
        weightKg: pd.weightKg ?? undefined,
        bloodGroupId: pd.bloodGroupId ?? undefined,
        complexionId: pd.complexionId ?? undefined,
        physicalDisability: pd.physicalDisability ?? undefined,
        disabilityDetail: pd.disabilityDetail ?? undefined,
        dietId: pd.dietId ?? undefined,
        spectacles: pd.spectacles ?? undefined,
        lens: pd.lens ?? undefined,
        personalityId: pd.personalityId ?? undefined,
      },
      contactDetails: {
        residenceAddress: ct.residenceAddress ?? undefined,
        contactEmail: ct.contactEmail ?? undefined,
        idProofNumber: ct.idProofNumber ?? undefined,
      },
      phoneNumbers: phoneNumbers.length > 0 ? phoneNumbers : undefined,
      careerDetails: {
        educationAreaId: cd.educationAreaId ?? undefined,
        educationId: cd.educationId ?? undefined,
        occupationId: cd.occupationId ?? undefined,
        occupationDetails: cd.occupationDetails ?? undefined,
        workingCity: cd.workingCity === '__other__' ? (cd.workingCityOther || undefined) : (cd.workingCity || undefined),
        workingStateId: cd.workingStateId && cd.workingStateId !== 0 ? cd.workingStateId : undefined,
        workingStateOther: cd.workingStateId === 0 ? cd.workingStateOther || undefined : undefined,
        workingCountryId: cd.workingCountryId && cd.workingCountryId !== 0 ? cd.workingCountryId : undefined,
        workingCountryOther: cd.workingCountryId === 0 ? cd.workingCountryOther || undefined : undefined,
        incomeAmount: cd.incomeAmount ? Number(cd.incomeAmount) : undefined,
        incomePeriodId: cd.incomePeriodId ?? undefined,
      },
      familyDetails: {
        fatherStatus: fd.fatherStatus ?? undefined,
        motherStatus: fd.motherStatus ?? undefined,
        brothers: fd.brothers ?? undefined,
        marriedBrothers: fd.marriedBrothers ?? undefined,
        sisters: fd.sisters ?? undefined,
        marriedSisters: fd.marriedSisters ?? undefined,
        parentsFullName: fd.parentsFullName ?? undefined,
        parentsOccupation: fd.parentsOccupation ?? undefined,
        parentsResidentCity: fd.parentsResidentCity ?? undefined,
        familyWealth: fd.familyWealth ?? undefined,
        mamaSurnamePlace: fd.mamaSurnamePlace ?? undefined,
        nativeDistrictId: fd.nativeDistrictId && fd.nativeDistrictId !== 0 ? fd.nativeDistrictId : undefined,
        nativeDistrictOther: fd.nativeDistrictId === 0 ? fd.nativeDistrictOther || undefined : undefined,
        nativeTalukaId: fd.nativeTalukaId && fd.nativeTalukaId !== 0 ? fd.nativeTalukaId : undefined,
        nativeTalukaOther: fd.nativeTalukaId === 0 ? fd.nativeTalukaOther || undefined : undefined,
        intercastMarriage: fd.intercastMarriage ?? undefined,
        intercastRelation: fd.intercastRelation ?? undefined,
      },
      relativeSurnames,
      partnerPreference: {
        expectedManglik: pp.expectedManglik ?? undefined,
        maxAgeDifference: pp.maxAgeDifference ?? undefined,
        expectedHeightFt: pp.expectedHeightFt ?? undefined,
        expectedHeightIn: pp.expectedHeightIn ?? undefined,
        divorcee: pp.divorcee ?? undefined,
        expectedCasteNoBar: pp.expectedCasteNoBar ?? undefined,
        expectedEducationNoBar: pp.expectedEducationNoBar ?? undefined,
        expectedOccupationNoBar: pp.expectedOccupationNoBar ?? undefined,
        expectedIncomeRangeId: pp.expectedIncomeRangeId ?? undefined,
      },
      profileHoroscope: {
        manglik: hd.manglik ?? undefined,
        birthHour: hd.birthHour ?? undefined,
        birthMinute: hd.birthMinute ?? undefined,
        birthPeriod: hd.birthPeriod ?? undefined,
        devak: hd.devak ?? undefined,
        rashiId: hd.rashiId ?? undefined,
        nakshatraId: hd.nakshatraId ?? undefined,
        charanId: hd.charanId ?? undefined,
        nadiId: hd.nadiId ?? undefined,
        ganId: hd.ganId ?? undefined,
        birthStateId: hd.birthStateId && hd.birthStateId !== 0 ? hd.birthStateId : undefined,
        birthStateOther: hd.birthStateOther || undefined,
        birthDistrictId: hd.birthDistrictId && hd.birthDistrictId !== 0 ? hd.birthDistrictId : undefined,
        birthDistrictOther: hd.birthDistrictOther || undefined,
      },
      profilePhotos: profilePhotos.length > 0 ? profilePhotos : undefined,
      interests,
      preferredCities,
      expectedCasteIds,
      expectedEducationIds,
      expectedOccupationIds,
    };
  }

  captureStepValues(form: FormGroup, step: number): Record<string, unknown> {
    const groupName = STEP_GROUP_NAMES[step];
    if (groupName) {
      const groupValue = form.get(groupName)?.value ?? {};
      if (step === 6) {
        return {
          ...groupValue,
          preferredCities: form.get('preferredCities')?.value,
          relativesSurnames: form.get('relativesSurnames')?.value,
          account: form.get('account')?.value,
          verification: form.get('verification')?.value,
          photos: form.get('photos')?.value,
        };
      }
      return groupValue;
    }
    return {};
  }

  restoreStepValues(form: FormGroup, step: number, values: Record<string, unknown>): void {
    const groupName = STEP_GROUP_NAMES[step];
    if (groupName) {
      form.get(groupName)?.patchValue(values, { emitEvent: false });
    }
    if (step === 6) {
      if (values['preferredCities'] != null) form.get('preferredCities')?.patchValue(values['preferredCities'] as string, { emitEvent: false });
      if (values['relativesSurnames'] != null) form.get('relativesSurnames')?.patchValue(values['relativesSurnames'] as string, { emitEvent: false });
      if (values['account']) form.get('account')?.patchValue(values['account'] as { password: string | null; confirmPassword: string | null }, { emitEvent: false });
      if (values['verification']) form.get('verification')?.patchValue(values['verification'] as { code: string | null; input: string | null; imageDataUrl: string | null }, { emitEvent: false });
      if (values['photos']) form.get('photos')?.patchValue(values['photos'] as { photo1Name: string | null }, { emitEvent: false });
    }
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }
}