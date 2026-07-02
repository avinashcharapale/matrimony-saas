import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MemberService } from '../../services/member.service';
import { RegisterFormDetails } from '@org/models';
import { RegisterDraftContext, RegisterDraftService } from '../../services/register-draft.service';
import { RegisterStepperComponent } from './components/register-stepper.component';
import { RegisterStepPersonalComponent } from './components/register-step-personal.component';
import { RegisterStepHoroscopeComponent } from './components/register-step-horoscope.component';
import { RegisterStepEducationComponent } from './components/register-step-education.component';
import { RegisterStepAddressComponent } from './components/register-step-address.component';
import { RegisterStepFamilyComponent } from './components/register-step-family.component';
import { RegisterStepExpectationComponent } from './components/register-step-expectation.component';

interface EnrollStep {
  title: string;
}

const REGISTER_SECTION_IMPORTS = [
  RegisterStepperComponent,
  RegisterStepPersonalComponent,
  RegisterStepHoroscopeComponent,
  RegisterStepEducationComponent,
  RegisterStepAddressComponent,
  RegisterStepFamilyComponent,
  RegisterStepExpectationComponent,
];

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ...REGISTER_SECTION_IMPORTS,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit, OnDestroy {
  private readonly memberService = inject(MemberService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly registerDraftService = inject(RegisterDraftService);

  private static readonly CAPTCHA_LENGTH = 6;
  private static readonly CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  private static readonly STEP_FIELDS: Record<number, readonly string[]> = {
    1: [
      'firstName', 'middleName', 'lastName', 'dobDay', 'dobMonth', 'dobYear', 'gender', 'religion', 'caste', 'subCast',
      'maritalStatus', 'heightFt', 'heightIn', 'weightKg', 'bloodGroup', 'complexion', 'physicalDisability',
      'disabilityDetail', 'diet', 'spectacles', 'lens', 'personality',
    ],
    2: [
      'manglik', 'rashi', 'nakshatra', 'charan', 'nadi', 'gan', 'birthHour', 'birthMinute', 'birthPeriod', 'birthDistrict', 'devak',
    ],
    3: [
      'educationArea', 'education', 'occupationType', 'occupationDetails', 'workingCityCountry', 'incomeAmount', 'incomePeriod',
    ],
    4: [
      'idProofNumber', 'residenceAddress', 'contactEmail', 'smsMobile', 'mobile2', 'phone1', 'phone2',
    ],
    5: [
      'fatherStatus', 'motherStatus', 'brothers', 'marriedBrothers', 'sisters', 'marriedSisters', 'parentsFullName',
      'parentsOccupation', 'parentsResidentCity', 'relativesSurnames', 'familyWealth', 'mamaSurnamePlace', 'nativeDistrict',
      'nativeTaluka', 'intercastMarriage', 'intercastRelation',
    ],
    6: [
      'preferredCities', 'expectedManglik', 'expectedCaste', 'maxAgeDifference', 'expectedHeightFt', 'expectedHeightIn',
      'expectedEducation', 'expectedOccupationIncome', 'divorcee', 'verificationInput', 'uploadedPhotoName',
      'uploadedPhoto2Name', 'password', 'confirmPassword',
    ],
  };

  private draftContext: RegisterDraftContext | null = null;
  private persistTimer: ReturnType<typeof setTimeout> | null = null;

  readonly steps: EnrollStep[] = [
    { title: 'Personal' },
    { title: 'Horoscope' },
    { title: 'Education' },
    { title: 'Address' },
    { title: 'Family' },
    { title: 'Expectation' },
  ];

  currentStep = 1;

  firstName = '';
  middleName = '';
  lastName = '';
  dobDay = '';
  dobMonth = '';
  dobYear = '';
  gender = '';
  religion = '';
  caste = 'MARATHA';
  subCast = '96_KULI';
  maritalStatus = 'Unmarried';
  heightFt = '5';
  heightIn = '4';
  weightKg = '40';
  bloodGroup = 'A+';
  complexion = 'Fair';
  physicalDisability = 'No';
  disabilityDetail = '';
  diet = 'N/A';
  spectacles = 'No';
  lens = 'No';
  personality = '';

  manglik = 'No';
  rashi = 'Unspecified';
  nakshatra = 'Unspecified';
  charan = 'Unspecified';
  nadi = 'Unspecified';
  gan = 'Unspecified';
  birthHour = '01';
  birthMinute = '00';
  birthPeriod = 'Select';
  birthDistrict = 'Select';
  devak = '';

  educationArea = 'Select';
  education = '';
  occupationType = 'Select';
  occupationDetails = '';
  workingCityCountry = 'Select';
  incomeAmount = '';
  incomePeriod = 'Per Month';

  idProofNumber = '';
  residenceAddress = '';
  contactEmail = '';
  smsMobile = '';
  mobile2 = '';
  phone1 = '';
  phone2 = '';

  fatherStatus = 'Yes';
  motherStatus = 'Yes';
  brothers = '0';
  marriedBrothers = '0';
  sisters = '0';
  marriedSisters = '0';
  parentsFullName = '';
  parentsOccupation = '';
  parentsResidentCity = '';
  relativesSurnames = '';
  familyWealth = '';
  mamaSurnamePlace = '';
  nativeDistrict = 'Select';
  nativeTaluka = '';
  intercastMarriage = 'No';
  intercastRelation = '';

  preferredCities = '';
  expectedManglik = 'No';
  expectedCaste = 'Maratha';
  maxAgeDifference = '0';
  expectedHeightFt = '5';
  expectedHeightIn = '0';
  expectedEducation = '';
  expectedOccupationIncome = '';
  divorcee = 'No';
  verificationCode = '';
  verificationImageDataUrl = '';
  verificationInput = '';
  uploadedPhotoName = '';
  uploadedPhoto2Name = '';

  email = '';
  password = '';
  confirmPassword = '';

  message = '';
  isError = false;
  isLoading = false;
  private readonly namePattern = /^[A-Za-z ]+$/;
  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  readonly days = Array.from({ length: 31 }, (_, i) => `${i + 1}`);
  readonly months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  readonly years = Array.from({ length: 45 }, (_, i) => `${1980 + i}`);

  ngOnInit(): void {
    this.draftContext = this.registerDraftService.resolveContext(this.route.snapshot.queryParamMap);
    this.restoreDraftFromStorage();
    this.refreshCaptcha();
  }

  ngOnDestroy(): void {
    this.persistCurrentStep();
    if (this.persistTimer) {
      clearTimeout(this.persistTimer);
      this.persistTimer = null;
    }
  }

  onFormInteraction(): void {
    this.queueDraftPersist();
  }

  previousStep(): void {
    this.persistCurrentStep();
    if (this.currentStep > 1) {
      this.currentStep -= 1;
    }
  }

  nextStep(): void {
    this.persistCurrentStep();
    const stepError = this.validateStep(this.currentStep);
    if (stepError) {
      this.isError = true;
      this.message = stepError;
      return;
    }

    this.message = '';
    this.isError = false;
    if (this.currentStep < this.steps.length) {
      this.currentStep += 1;
      if (this.currentStep === this.steps.length) {
        this.refreshCaptcha();
      }
      this.queueDraftPersist();
    }
  }

  get isLastStep(): boolean {
    return this.currentStep === this.steps.length;
  }

  submit(): void {
    this.message = '';
    this.isError = false;
    this.isLoading = true;

    for (let step = 1; step <= this.steps.length; step += 1) {
      const stepError = this.validateStep(step);
      if (stepError) {
        if (step === this.steps.length && stepError.includes('verification code')) {
          this.refreshCaptcha();
        }
        this.currentStep = step;
        this.isError = true;
        this.message = stepError;
        this.isLoading = false;
        return;
      }
    }

    const firstName = this.normalizeText(this.firstName);
    const middleName = this.normalizeText(this.middleName);
    const lastName = this.normalizeText(this.lastName);
    const name = [firstName, middleName, lastName].filter(Boolean).join(' ');

    const accountEmail = this.contactEmail.trim().toLowerCase();
    const accountPassword = this.password.trim();

    if (!name || !accountEmail || !accountPassword || !this.confirmPassword.trim()) {
      this.isError = true;
      this.message = 'Please fill required fields including email and account password.';
      this.isLoading = false;
      return;
    }

    if (accountPassword.length < 8) {
      this.isError = true;
      this.message = 'Password must be at least 8 characters.';
      this.isLoading = false;
      return;
    }

    if (accountPassword !== this.confirmPassword.trim()) {
      this.isError = true;
      this.message = 'Password and confirm password must match.';
      this.isLoading = false;
      return;
    }

    const birthYear = Number(this.dobYear);
    const age = Number.isFinite(birthYear) && birthYear > 0 ? new Date().getFullYear() - birthYear : undefined;

    const bioParts = [
      this.education && `Education: ${this.normalizeText(this.education)}`,
      this.occupationDetails && `Occupation: ${this.normalizeText(this.occupationDetails)}`,
      this.residenceAddress && `Address: ${this.normalizeText(this.residenceAddress)}`,
      this.expectedOccupationIncome && `Expectation: ${this.normalizeText(this.expectedOccupationIncome)}`,
    ].filter(Boolean);

    this.registerAsync(name, accountEmail, accountPassword, bioParts.join(' | '), age);
  }

  refreshCaptcha(): void {
    this.verificationCode = this.generateCaptchaCode();
    this.verificationImageDataUrl = this.createCaptchaImage(this.verificationCode);
    this.verificationInput = '';
    this.queueDraftPersist();
  }

  private async registerAsync(
    name: string,
    email: string,
    password: string,
    bio: string,
    age?: number
  ): Promise<void> {
    try {
      const result = await this.memberService.registerMember({
        name,
        email,
        password,
        location: this.normalizeText(this.residenceAddress) || this.workingCityCountry,
        occupation: this.normalizeText(this.occupationDetails),
        age,
        bio,
        registrationDetails: this.buildRegistrationDetails(),
      });

      this.isError = !result.ok;
      this.message = result.message;

      if (result.ok && result.profileSynced) {
        this.clearDraftFromStorage();
        this.router.navigateByUrl('/login');
      }
    } catch (error: unknown) {
      this.isError = true;
      this.message = error instanceof Error ? error.message : 'Registration failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && !this.isImageFile(file.name)) {
      this.isError = true;
      this.message = 'Only JPG, JPEG, PNG, or WEBP files are allowed.';
      input.value = '';
      return;
    }
    this.uploadedPhotoName = file?.name ?? '';
  }

  onPhoto2Selected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && !this.isImageFile(file.name)) {
      this.isError = true;
      this.message = 'Only JPG, JPEG, PNG, or WEBP files are allowed.';
      input.value = '';
      return;
    }
    this.uploadedPhoto2Name = file?.name ?? '';
  }

  private normalizeText(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }

  private normalizePhone(value: string): string {
    const digitsOnly = (value ?? '').toString().replace(/\D/g, '');
    if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
      return digitsOnly.slice(2);
    }
    if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
      return digitsOnly.slice(1);
    }
    return digitsOnly;
  }

  private isValidTenDigitPhone(value: string): boolean {
    return /^\d{10}$/.test(this.normalizePhone(value));
  }

  private isCaptchaValid(): boolean {
    return this.verificationInput.trim().toUpperCase() === this.verificationCode;
  }

  private generateCaptchaCode(): string {
    let result = '';
    for (let index = 0; index < Register.CAPTCHA_LENGTH; index += 1) {
      const randomIndex = Math.floor(Math.random() * Register.CAPTCHA_CHARS.length);
      result += Register.CAPTCHA_CHARS[randomIndex];
    }
    return result;
  }

  private createCaptchaImage(code: string): string {
    const width = 280;
    const height = 90;
    const chars = code.split('');
    const textNodes = chars
      .map((char, index) => {
        const x = 28 + index * 40;
        const y = 54 + Math.floor(Math.random() * 14) - 7;
        const rotate = Math.floor(Math.random() * 30) - 15;
        return `<text x="${x}" y="${y}" transform="rotate(${rotate} ${x} ${y})" font-size="36" font-family="Georgia, serif" font-weight="700" fill="#1f2638">${char}</text>`;
      })
      .join('');

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

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect width="${width}" height="${height}" rx="8" fill="#f9f5f0" />
        ${noiseLines}
        ${noiseDots}
        ${textNodes}
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  private isImageFile(fileName: string): boolean {
    return /\.(jpg|jpeg|png|webp)$/i.test(fileName);
  }

  private buildRegistrationDetails(): RegisterFormDetails {
    return {
      personal: {
        firstName: this.firstName,
        middleName: this.middleName,
        lastName: this.lastName,
        dobDay: this.dobDay,
        dobMonth: this.dobMonth,
        dobYear: this.dobYear,
        gender: this.gender,
        religion: this.religion,
        caste: this.caste,
        subCast: this.subCast,
        maritalStatus: this.maritalStatus,
        heightFt: this.heightFt,
        heightIn: this.heightIn,
        weightKg: this.weightKg,
        bloodGroup: this.bloodGroup,
        complexion: this.complexion,
        physicalDisability: this.physicalDisability,
        disabilityDetail: this.disabilityDetail,
        diet: this.diet,
        spectacles: this.spectacles,
        lens: this.lens,
        personality: this.personality,
      },
      horoscope: {
        manglik: this.manglik,
        rashi: this.rashi,
        nakshatra: this.nakshatra,
        charan: this.charan,
        nadi: this.nadi,
        gan: this.gan,
        birthHour: this.birthHour,
        birthMinute: this.birthMinute,
        birthPeriod: this.birthPeriod,
        birthDistrict: this.birthDistrict,
        devak: this.devak,
      },
      professional: {
        educationArea: this.educationArea,
        education: this.education,
        occupationType: this.occupationType,
        occupationDetails: this.occupationDetails,
        workingCityCountry: this.workingCityCountry,
        incomeAmount: this.incomeAmount,
        incomePeriod: this.incomePeriod,
      },
      contact: {
        idProofNumber: this.idProofNumber,
        residenceAddress: this.residenceAddress,
        contactEmail: this.contactEmail,
        smsMobile: this.smsMobile,
        mobileSecondary: this.mobile2,
        phonePrimary: this.phone1,
        phoneSecondary: this.phone2,
      },
      family: {
        fatherStatus: this.fatherStatus,
        motherStatus: this.motherStatus,
        brothers: this.brothers,
        marriedBrothers: this.marriedBrothers,
        sisters: this.sisters,
        marriedSisters: this.marriedSisters,
        parentsFullName: this.parentsFullName,
        parentsOccupation: this.parentsOccupation,
        parentsResidentCity: this.parentsResidentCity,
        relativesSurnames: this.relativesSurnames,
        familyWealth: this.familyWealth,
        mamaSurnamePlace: this.mamaSurnamePlace,
        nativeDistrict: this.nativeDistrict,
        nativeTaluka: this.nativeTaluka,
        intercastMarriage: this.intercastMarriage,
        intercastRelation: this.intercastRelation,
      },
      expectations: {
        preferredCities: this.preferredCities,
        expectedManglik: this.expectedManglik,
        expectedCaste: this.expectedCaste,
        maxAgeDifference: this.maxAgeDifference,
        expectedHeightFt: this.expectedHeightFt,
        expectedHeightIn: this.expectedHeightIn,
        expectedEducation: this.expectedEducation,
        expectedOccupationIncome: this.expectedOccupationIncome,
        divorcee: this.divorcee,
      },
      verification: {
        verificationCode: this.verificationCode,
        verificationInput: this.verificationInput,
      },
      photos: [
        ...(this.uploadedPhotoName ? [{ photoSlot: 1, fileName: this.uploadedPhotoName, isPrimary: true }] : []),
        ...(this.uploadedPhoto2Name ? [{ photoSlot: 2, fileName: this.uploadedPhoto2Name }] : []),
      ],
      accountPassword: this.password,
      confirmPassword: this.confirmPassword,
    };
  }

  private validateStep(step: number): string | null {
    if (step === 1) {
      if (!this.normalizeText(this.firstName) || !this.normalizeText(this.lastName)) {
        return 'First name and last name are required.';
      }
      if (!this.namePattern.test(this.normalizeText(this.firstName)) || !this.namePattern.test(this.normalizeText(this.lastName))) {
        return 'Name fields can contain letters and spaces only.';
      }
      if (!this.dobDay || !this.dobMonth || !this.dobYear) {
        return 'Please select complete date of birth.';
      }
      if (!this.gender) {
        return 'Please select gender.';
      }
      if (!this.religion) {
        return 'Please select religion.';
      }
      const age = new Date().getFullYear() - Number(this.dobYear);
      if (Number.isNaN(age) || age < 18 || age > 80) {
        return 'Age must be between 18 and 80 years.';
      }
      if (this.physicalDisability === 'Yes' && !this.normalizeText(this.disabilityDetail)) {
        return 'Please specify disability details.';
      }
    }

    if (step === 2) {
      if (this.birthPeriod === 'Select' || this.birthDistrict === 'Select') {
        return 'Please select birth time period and birth district.';
      }
    }

    if (step === 3) {
      if (this.educationArea === 'Select' || !this.normalizeText(this.education)) {
        return 'Please provide education details.';
      }
      if (this.occupationType === 'Select' || !this.normalizeText(this.occupationDetails)) {
        return 'Please provide occupation details.';
      }
      if (this.workingCityCountry === 'Select') {
        return 'Please select working city/country.';
      }
      if (this.incomeAmount && !/^\d+(\.\d+)?$/.test(this.incomeAmount.trim())) {
        return 'Income amount must be numeric.';
      }
    }

    if (step === 4) {
      if (!this.normalizeText(this.residenceAddress) || this.normalizeText(this.residenceAddress).length < 10) {
        return 'Please enter a valid residence address.';
      }
      if (!this.emailPattern.test(this.contactEmail.trim().toLowerCase())) {
        return 'Please enter a valid contact email.';
      }
      if (!this.isValidTenDigitPhone(this.smsMobile)) {
        return 'Mobile for SMS alert must be a 10-digit number.';
      }
      if (this.mobile2 && !this.isValidTenDigitPhone(this.mobile2)) {
        return 'Mobile II must be a 10-digit number.';
      }
      if (this.phone1 && !this.isValidTenDigitPhone(this.phone1)) {
        return 'Phone I must be a 10-digit number.';
      }
      if (this.phone2 && !this.isValidTenDigitPhone(this.phone2)) {
        return 'Phone II must be a 10-digit number.';
      }

      // Persist normalized 10-digit values so later steps and submit use a clean format.
      this.smsMobile = this.normalizePhone(this.smsMobile);
      if (this.mobile2) {
        this.mobile2 = this.normalizePhone(this.mobile2);
      }
      if (this.phone1) {
        this.phone1 = this.normalizePhone(this.phone1);
      }
      if (this.phone2) {
        this.phone2 = this.normalizePhone(this.phone2);
      }
    }

    if (step === 5) {
      if (!this.normalizeText(this.parentsFullName)) {
        return 'Please enter parents full name.';
      }
      if (this.nativeDistrict === 'Select') {
        return 'Please select native district.';
      }
    }

    if (step === 6) {
      if (!this.normalizeText(this.preferredCities)) {
        return 'Please enter preferred cities.';
      }
      if (!this.normalizeText(this.expectedEducation) || !this.normalizeText(this.expectedOccupationIncome)) {
        return 'Please fill expected education and occupation/income.';
      }
      if (!this.password.trim() || !this.confirmPassword.trim()) {
        return 'Please set your account password and confirm it.';
      }
      if (this.password.trim().length < 8) {
        return 'Password must be at least 8 characters.';
      }
      if (this.password.trim() !== this.confirmPassword.trim()) {
        return 'Password and confirm password must match.';
      }
      if (!this.isCaptchaValid()) {
        return 'Please enter correct verification code.';
      }
    }

    return null;
  }

  private queueDraftPersist(): void {
    if (this.persistTimer) {
      clearTimeout(this.persistTimer);
    }

    this.persistTimer = setTimeout(() => {
      this.persistCurrentStep();
      this.persistTimer = null;
    }, 250);
  }

  private persistCurrentStep(): void {
    if (!this.draftContext) {
      return;
    }

    this.registerDraftService.saveStep(
      this.draftContext,
      this.currentStep,
      this.captureStepValues(this.currentStep)
    );
  }

  private restoreDraftFromStorage(): void {
    if (!this.draftContext) {
      return;
    }

    const state = this.registerDraftService.read(this.draftContext);
    if (!state) {
      return;
    }

    for (const [step, values] of Object.entries(state.steps)) {
      const stepNumber = Number(step);
      const fields = Register.STEP_FIELDS[stepNumber] ?? [];

      for (const field of fields) {
        if (Object.prototype.hasOwnProperty.call(values, field)) {
          (this as unknown as Record<string, unknown>)[field] = values[field];
        }
      }
    }

    if (Number.isInteger(state.currentStep) && state.currentStep >= 1 && state.currentStep <= this.steps.length) {
      this.currentStep = state.currentStep;
    }
  }

  private captureStepValues(step: number): Record<string, unknown> {
    const fields = Register.STEP_FIELDS[step] ?? [];
    const source = this as unknown as Record<string, unknown>;
    const output: Record<string, unknown> = {};

    for (const field of fields) {
      output[field] = source[field];
    }

    return output;
  }

  private clearDraftFromStorage(): void {
    if (!this.draftContext) {
      return;
    }
    this.registerDraftService.clear(this.draftContext);
  }
}
