import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MemberService } from '../../services/member.service';
import { RegisterFormDetails } from '@org/models';
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
export class Register {
  private readonly memberService = inject(MemberService);
  private readonly router = inject(Router);

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
  verificationCode = '58164';
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
  private readonly phonePattern = /^\d{10}$/;

  readonly days = Array.from({ length: 31 }, (_, i) => `${i + 1}`);
  readonly months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  readonly years = Array.from({ length: 45 }, (_, i) => `${1980 + i}`);

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep -= 1;
    }
  }

  nextStep(): void {
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

    if (this.verificationInput !== this.verificationCode) {
      this.isError = true;
      this.message = 'Please enter correct verification code.';
      this.isLoading = false;
      return;
    }

    this.registerAsync(name, accountEmail, accountPassword, bioParts.join(' | '), age);
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

      if (result.ok) {
        this.router.navigateByUrl('/login');
      }
    } catch (error: any) {
      this.isError = true;
      this.message = error.message || 'Registration failed. Please try again.';
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
      if (!this.phonePattern.test(this.smsMobile.trim())) {
        return 'Mobile for SMS alert must be a 10-digit number.';
      }
      if (this.mobile2 && !this.phonePattern.test(this.mobile2.trim())) {
        return 'Mobile II must be a 10-digit number.';
      }
      if (this.phone1 && !this.phonePattern.test(this.phone1.trim())) {
        return 'Phone I must be a 10-digit number.';
      }
      if (this.phone2 && !this.phonePattern.test(this.phone2.trim())) {
        return 'Phone II must be a 10-digit number.';
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
      if (this.verificationInput.trim() !== this.verificationCode) {
        return 'Please enter correct verification code.';
      }
    }

    return null;
  }
}
