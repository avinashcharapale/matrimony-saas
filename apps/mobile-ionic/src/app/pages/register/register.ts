import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from '@org/data-access-auth';
import { RegisterFormDetails, RegisterSubmissionPayload, createEmptyRegisterFormDetails } from '@org/models';
import {
  ProfileRegistrationService,
  RegisterCountryOption,
  RegisterDraftContext,
  RegisterDraftService,
  RegisterDistrictOption,
  RegisterIncomeRangeOption,
  RegisterLookupOption,
  RegisterMasterDataService,
  RegisterStateOption,
  RegisterTalukaOption,
} from '@org/data-access-registration';
import {
  calculateAgeFromYear,
  generateCaptchaCode,
  isValidEmail,
  isValidName,
  isValidTenDigitPhone,
  normalizePhone,
  normalizeText,
} from '@org/shared-utils';
import { TenantService } from '../../services/tenant.service';

interface EnrollStep {
  title: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-register',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit, OnDestroy {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly registration = inject(ProfileRegistrationService);
  private readonly tenantService = inject(TenantService);
  private readonly masterData = inject(RegisterMasterDataService);
  private readonly registerDraftService = inject(RegisterDraftService);

  private draftContext: RegisterDraftContext | null = null;
  private persistTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly photoFiles = new Map<number, File>();

  readonly submitMessage = signal('');
  readonly isError = signal(false);
  readonly isLoading = signal(false);

  readonly steps: EnrollStep[] = [
    { title: 'Personal' },
    { title: 'Horoscope' },
    { title: 'Education' },
    { title: 'Address' },
    { title: 'Family' },
    { title: 'Expectations' },
  ];

  readonly currentStep = signal(1);
  readonly isLastStep = computed(() => this.currentStep() === this.steps.length);

  email = '';
  password = '';
  confirmPassword = '';
  captchaCode = '';
  captchaInput = '';
  captchaImageUrl = '';

  details: RegisterFormDetails = {
    ...createEmptyRegisterFormDetails(),
    verification: {
      verificationCode: '',
      verificationInput: '',
    },
  };
  photos = signal(this.details.photos);
  primaryPhotoName = computed(() => this.photos().find((photo) => photo.photoSlot === 1)?.fileName ?? '');
  secondaryPhotoName = computed(() => this.photos().find((photo) => photo.photoSlot === 2)?.fileName ?? '');

  // Master data
  readonly genders = signal<RegisterLookupOption[]>([]);
  readonly religions = signal<RegisterLookupOption[]>([]);
  readonly castes = signal<RegisterLookupOption[]>([]);
  readonly subCastes = signal<RegisterLookupOption[]>([]);
  readonly maritalStatuses = signal<RegisterLookupOption[]>([]);
  readonly bloodGroups = signal<RegisterLookupOption[]>([]);
  readonly complexions = signal<RegisterLookupOption[]>([]);
  readonly diets = signal<RegisterLookupOption[]>([]);
  readonly personalities = signal<RegisterLookupOption[]>([]);
  readonly rashis = signal<RegisterLookupOption[]>([]);
  readonly nakshatras = signal<RegisterLookupOption[]>([]);
  readonly charans = signal<RegisterLookupOption[]>([]);
  readonly nadis = signal<RegisterLookupOption[]>([]);
  readonly gans = signal<RegisterLookupOption[]>([]);
  readonly educationAreas = signal<RegisterLookupOption[]>([]);
  readonly educations = signal<RegisterLookupOption[]>([]);
  readonly occupations = signal<RegisterLookupOption[]>([]);
  readonly incomePeriods = signal<RegisterLookupOption[]>([]);
  readonly incomeRanges = signal<RegisterIncomeRangeOption[]>([]);
  readonly states = signal<RegisterStateOption[]>([]);
  readonly countries = signal<RegisterCountryOption[]>([]);
  readonly birthDistricts = signal<RegisterDistrictOption[]>([]);
  readonly nativeDistricts = signal<RegisterDistrictOption[]>([]);
  readonly nativeTalukas = signal<RegisterTalukaOption[]>([]);
  readonly workingDistricts = signal<RegisterDistrictOption[]>([]);

  birthState = '';
  nativeState = '';
  workingCityChoice = '';
  workingCityOther = '';

  readonly days = Array.from({ length: 31 }, (_, i) => i + 1);
  readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  readonly years = Array.from({ length: 45 }, (_, i) => 1980 + i);

  ngOnInit(): void {
    this.draftContext = this.registerDraftService.resolveContext(this.route.snapshot.queryParamMap);
    this.loadMasterData();
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

  loadMasterData(): void {
    this.masterData.getGenders().subscribe({ next: (o) => this.genders.set(o) });
    this.masterData.getReligions().subscribe({ next: (o) => this.religions.set(o) });
    this.masterData.getMaritalStatuses().subscribe({ next: (o) => this.maritalStatuses.set(o) });
    this.masterData.getBloodGroups().subscribe({ next: (o) => this.bloodGroups.set(o) });
    this.masterData.getComplexions().subscribe({ next: (o) => this.complexions.set(o) });
    this.masterData.getDiets().subscribe({ next: (o) => this.diets.set(o) });
    this.masterData.getPersonalities().subscribe({ next: (o) => this.personalities.set(o) });
    this.masterData.getRashis().subscribe({ next: (o) => this.rashis.set(o) });
    this.masterData.getNakshatras().subscribe({ next: (o) => this.nakshatras.set(o) });
    this.masterData.getCharans().subscribe({ next: (o) => this.charans.set(o) });
    this.masterData.getNadis().subscribe({ next: (o) => this.nadis.set(o) });
    this.masterData.getGans().subscribe({ next: (o) => this.gans.set(o) });
    this.masterData.getEducationAreas().subscribe({ next: (o) => this.educationAreas.set(o) });
    this.masterData.getEducations().subscribe({ next: (o) => this.educations.set(o) });
    this.masterData.getOccupations().subscribe({ next: (o) => this.occupations.set(o) });
    this.masterData.getIncomePeriods().subscribe({ next: (o) => this.incomePeriods.set(o) });
    this.masterData.getIncomeRanges().subscribe({ next: (o) => this.incomeRanges.set(o) });
    this.masterData.getStates().subscribe({ next: (o) => this.states.set(o) });
    this.masterData.getCountries().subscribe({ next: (o) => this.countries.set(o) });

    if (Number(this.details.personal.religion)) {
      this.reloadCastes();
    }
  }

  onReligionChange(): void {
    this.details.personal.caste = '';
    this.details.personal.subCast = '';
    this.castes.set([]);
    this.subCastes.set([]);
    this.reloadCastes();
    this.onFormInteraction();
  }

  onCasteChange(): void {
    this.details.personal.subCast = '';
    this.subCastes.set([]);
    const casteId = Number(this.details.personal.caste);
    if (!casteId) return;
    this.masterData.getSubCastes(casteId).subscribe({ next: (o) => this.subCastes.set(o) });
    this.onFormInteraction();
  }

  onExpectedCasteNoBarChange(): void {
    if (this.details.expectations.expectedCasteNoBar) {
      this.details.expectations.expectedCasteIds = [];
    }
    this.onFormInteraction();
  }

  onExpectedEducationNoBarChange(): void {
    if (this.details.expectations.expectedEducationNoBar) {
      this.details.expectations.expectedEducationIds = [];
    }
    this.onFormInteraction();
  }

  onExpectedOccupationNoBarChange(): void {
    if (this.details.expectations.expectedOccupationNoBar) {
      this.details.expectations.expectedOccupationIds = [];
    }
    this.onFormInteraction();
  }

  onBirthStateChange(): void {
    this.details.horoscope.birthDistrict = '';
    this.birthDistricts.set([]);
    const stateId = Number(this.birthState);
    if (!stateId) return;
    this.masterData.getDistricts(stateId).subscribe({ next: (o) => this.birthDistricts.set(o) });
    this.onFormInteraction();
  }

  onNativeStateChange(): void {
    this.details.family.nativeDistrict = '';
    this.details.family.nativeTaluka = '';
    this.nativeDistricts.set([]);
    this.nativeTalukas.set([]);
    const stateId = Number(this.nativeState);
    if (!stateId) return;
    this.masterData.getDistricts(stateId).subscribe({ next: (o) => this.nativeDistricts.set(o) });
    this.onFormInteraction();
  }

  onNativeDistrictChange(): void {
    this.details.family.nativeTaluka = '';
    this.nativeTalukas.set([]);
    const districtId = Number(this.details.family.nativeDistrict);
    if (!districtId) return;
    this.masterData.getTalukas(districtId).subscribe({ next: (o) => this.nativeTalukas.set(o) });
    this.onFormInteraction();
  }

  onWorkingCountryChange(): void {
    this.details.professional.workingState = '';
    this.details.professional.workingStateOther = '';
    this.details.professional.workingCityCountry = '';
    this.workingCityChoice = '';
    this.workingCityOther = '';
    this.workingDistricts.set([]);
  }

  onWorkingStateChange(): void {
    this.details.professional.workingCityCountry = '';
    this.workingCityChoice = '';
    this.workingCityOther = '';
    this.workingDistricts.set([]);
    const stateId = Number(this.details.professional.workingState);
    if (!stateId) return;
    this.masterData.getDistricts(stateId).subscribe({ next: (o) => this.workingDistricts.set(o) });
    this.onFormInteraction();
  }

  onWorkingCityChange(): void {
    if (this.workingCityChoice === '__other__') {
      this.details.professional.workingCityCountry = this.workingCityOther;
    } else {
      this.details.professional.workingCityCountry = this.workingCityChoice;
    }
    this.onFormInteraction();
  }

  onWorkingCityOtherInput(): void {
    if (this.workingCityChoice === '__other__') {
      this.details.professional.workingCityCountry = this.workingCityOther;
    }
    this.onFormInteraction();
  }

  private reloadCastes(): void {
    const religionId = Number(this.details.personal.religion);
    if (!religionId) return;
    this.masterData.getCastes(religionId).subscribe({ next: (o) => this.castes.set(o) });
  }

  isOther(value: unknown): boolean {
    return value === 0 || value === '0';
  }

  onFormInteraction(): void {
    this.queueDraftPersist();
  }

  goBack(): void {
    this.persistCurrentStep();
    this.router.navigateByUrl('/search');
  }

  previousStep(): void {
    this.persistCurrentStep();
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  nextStep(): void {
    this.persistCurrentStep();
    const stepError = this.validateStep(this.currentStep());
    if (stepError) {
      this.isError.set(true);
      this.submitMessage.set(stepError);
      return;
    }
    this.submitMessage.set('');
    this.isError.set(false);
    if (this.currentStep() < this.steps.length) {
      this.currentStep.set(this.currentStep() + 1);
      if (this.currentStep() === this.steps.length) {
        this.refreshCaptcha();
      }
      this.queueDraftPersist();
    }
  }

  refreshCaptcha(): void {
    this.captchaCode = generateCaptchaCode();
    this.captchaImageUrl = this.createCaptchaImage(this.captchaCode);
    this.captchaInput = '';
    this.queueDraftPersist();
  }

  onPrimaryPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && !/\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
      this.isError.set(true);
      this.submitMessage.set('Only JPG, JPEG, PNG or WEBP images are allowed.');
      input.value = '';
      return;
    }
    const next = this.photos().filter((photo) => photo.photoSlot !== 1);
    const updated = file
      ? [{ photoSlot: 1, fileName: file.name, isPrimary: true }, ...next]
      : next;
    this.details.photos = updated;
    this.photos.set(updated);
    if (file) {
      this.photoFiles.set(1, file);
    } else {
      this.photoFiles.delete(1);
    }
    this.onFormInteraction();
  }

  onSecondaryPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && !/\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
      this.isError.set(true);
      this.submitMessage.set('Only JPG, JPEG, PNG or WEBP images are allowed.');
      input.value = '';
      return;
    }
    const next = this.photos().filter((photo) => photo.photoSlot !== 2);
    const updated = file
      ? [...next, { photoSlot: 2, fileName: file.name }].sort((a, b) => a.photoSlot - b.photoSlot)
      : next;
    this.details.photos = updated;
    this.photos.set(updated);
    if (file) {
      this.photoFiles.set(2, file);
    } else {
      this.photoFiles.delete(2);
    }
    this.onFormInteraction();
  }

  submit(): void {
    this.submitMessage.set('');
    this.isError.set(false);

    for (let step = 1; step <= this.steps.length; step += 1) {
      const stepError = this.validateStep(step);
      if (stepError) {
        if (step === this.steps.length && stepError.includes('verification code')) {
          this.refreshCaptcha();
        }
        this.currentStep.set(step);
        this.isError.set(true);
        this.submitMessage.set(stepError);
        return;
      }
    }

    const fullName = [
      this.details.personal.firstName,
      this.details.personal.middleName,
      this.details.personal.lastName,
    ].filter((value) => value.trim().length > 0).join(' ');

    this.details.horoscope.birthState = this.birthState;
    this.details.family.nativeState = this.nativeState;

    if (!isValidEmail(this.email)) {
      this.currentStep.set(4);
      this.isError.set(true);
      this.submitMessage.set('Enter a valid email address.');
      return;
    }

    this.isLoading.set(true);

    const tenantHeaderId = Number(this.tenantService.tenantHeaderId);
    const tenantId = Number.isFinite(tenantHeaderId) && tenantHeaderId > 0 ? tenantHeaderId : undefined;

    this.authStore
      .register(this.email.trim().toLowerCase(), this.password.trim(), this.confirmPassword.trim(), tenantId)
      .subscribe({
        next: (result) => {
          if (!result.ok) {
            this.isLoading.set(false);
            this.isError.set(true);
            this.submitMessage.set(result.message);
            return;
          }

          const age = calculateAgeFromYear(this.details.personal.dobYear);
          const occupation = normalizeText(this.details.professional.occupationDetails);
          const address = normalizeText(this.details.contact.residenceAddress);
          const education = this.details.professional.education || '';
          const bioParts = [
            education && `Education: ${education}`,
            occupation && `Occupation: ${occupation}`,
            address && `Address: ${address}`,
          ].filter(Boolean);

          const submission: RegisterSubmissionPayload = {
            name: fullName,
            email: this.email.trim().toLowerCase(),
            password: this.password.trim(),
            age,
            bio: bioParts.length > 0 ? bioParts.join(' | ') : undefined,
            location: this.details.contact.residenceAddress || this.details.professional.workingCityCountry,
            occupation: occupation || undefined,
            registrationDetails: this.details,
          };

          this.persistAllSteps();

          this.registration
            .createMemberProfile(submission, Array.from(this.photoFiles.values()))
            .subscribe({
              next: (profileResult) => {
                this.isLoading.set(false);
                if (profileResult.ok && profileResult.profileSynced) {
                  this.clearDraftFromStorage();
                }
                this.submitMessage.set(profileResult.message);
                this.isError.set(!profileResult.ok || !profileResult.profileSynced);
                this.router.navigateByUrl('/home');
              },
              error: (error) => {
                this.isLoading.set(false);
                this.isError.set(true);
                this.submitMessage.set(error?.error?.error || 'Account created, but profile sync failed.');
                this.router.navigateByUrl('/home');
              },
            });
        },
        error: (error) => {
          this.isLoading.set(false);
          this.isError.set(true);
          this.submitMessage.set(error?.error?.error || 'Registration failed. Please try again.');
        },
      });
  }

  private validateStep(step: number): string | null {
    const pd = this.details.personal;
    const hd = this.details.horoscope;
    const prof = this.details.professional;
    const ct = this.details.contact;
    const fd = this.details.family;
    const ex = this.details.expectations;

    if (step === 1) {
      if (!normalizeText(pd.firstName) || !normalizeText(pd.lastName)) {
        return 'First name and last name are required.';
      }
      if (!isValidName(pd.firstName) || !isValidName(pd.lastName)) {
        return 'Names can contain letters and spaces only.';
      }
      if (!pd.dobDay || !pd.dobMonth || !pd.dobYear) {
        return 'Enter your complete date of birth.';
      }
      const age = calculateAgeFromYear(pd.dobYear);
      if (age == null || age < 18 || age > 80) {
        return 'You must be between 18 and 80 years old.';
      }
      if (!pd.gender) {
        return 'Gender is required.';
      }
      if (!pd.religion) {
        return 'Religion is required.';
      }
      if (!pd.caste) {
        return 'Caste is required.';
      }
      if (pd.physicalDisability === 'Yes' && !normalizeText(pd.disabilityDetail)) {
        return 'Please provide disability details.';
      }
    }

    if (step === 2) {
      if (!hd.birthPeriod) {
        return 'Select your birth time period (AM/PM).';
      }
      if (!hd.birthDistrict && !normalizeText(hd.birthDistrictOther)) {
        return 'Enter your birth district.';
      }
    }

    if (step === 3) {
      if (!prof.educationArea || !prof.education) {
        return 'Select your education area and qualification.';
      }
      if (!prof.occupationType || !normalizeText(prof.occupationDetails)) {
        return 'Enter your occupation and work details.';
      }
      if (!normalizeText(prof.workingCityCountry)) {
        return 'Enter your working city / country.';
      }
      if (prof.incomeAmount && !Number.isFinite(Number(prof.incomeAmount))) {
        return 'Income must be a number.';
      }
    }

    if (step === 4) {
      const address = normalizeText(ct.residenceAddress);
      if (!address || address.length < 10) {
        return 'Residence address should be at least 10 characters.';
      }
      if (!isValidEmail(ct.contactEmail)) {
        return 'Enter a valid contact email.';
      }
      if (!isValidTenDigitPhone(ct.smsMobile)) {
        return 'Enter a valid 10-digit mobile number.';
      }
      if (ct.mobileSecondary && !isValidTenDigitPhone(ct.mobileSecondary)) {
        return 'Secondary mobile must be a valid 10-digit number.';
      }
      if (ct.phonePrimary && !isValidTenDigitPhone(ct.phonePrimary)) {
        return 'Primary phone must be a valid 10-digit number.';
      }
      if (ct.phoneSecondary && !isValidTenDigitPhone(ct.phoneSecondary)) {
        return 'Secondary phone must be a valid 10-digit number.';
      }

      this.details.contact = {
        ...ct,
        smsMobile: normalizePhone(ct.smsMobile),
        mobileSecondary: ct.mobileSecondary ? normalizePhone(ct.mobileSecondary) : '',
        phonePrimary: ct.phonePrimary ? normalizePhone(ct.phonePrimary) : '',
        phoneSecondary: ct.phoneSecondary ? normalizePhone(ct.phoneSecondary) : '',
      };
    }

    if (step === 5) {
      if (!normalizeText(fd.parentsFullName)) {
        return 'Enter your parents\u2019 full name.';
      }
      const brothers = Number(fd.brothers);
      const marriedBrothers = Number(fd.marriedBrothers);
      if (
        fd.brothers &&
        fd.marriedBrothers &&
        Number.isFinite(brothers) &&
        Number.isFinite(marriedBrothers) &&
        marriedBrothers > brothers
      ) {
        return 'Married brothers cannot exceed total brothers.';
      }
      const sisters = Number(fd.sisters);
      const marriedSisters = Number(fd.marriedSisters);
      if (
        fd.sisters &&
        fd.marriedSisters &&
        Number.isFinite(sisters) &&
        Number.isFinite(marriedSisters) &&
        marriedSisters > sisters
      ) {
        return 'Married sisters cannot exceed total sisters.';
      }
      if (!fd.nativeDistrict && !normalizeText(fd.nativeDistrictOther)) {
        return 'Enter your native district.';
      }
    }

    if (step === 6) {
      if (!normalizeText(ex.preferredCities)) {
        return 'Enter at least one preferred city.';
      }
      if (!this.password || !this.confirmPassword) {
        return 'Enter a password and confirm it.';
      }
      if (this.password.trim().length < 8) {
        return 'Password must be at least 8 characters.';
      }
      if (this.password.trim() !== this.confirmPassword.trim()) {
        return 'Password and confirm password must match.';
      }
      if (!isValidEmail(this.email)) {
        return 'Enter a valid email for your account.';
      }
      if (this.captchaInput.trim().toUpperCase() !== this.captchaCode) {
        return 'Enter the correct verification code.';
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

  private captureStepValues(step: number): Record<string, unknown> {
    switch (step) {
      case 1:
        return { ...this.details.personal };
      case 2:
        return { ...this.details.horoscope, birthState: this.birthState };
      case 3:
        return {
          ...this.details.professional,
          workingCityChoice: this.workingCityChoice,
          workingCityOther: this.workingCityOther,
        };
      case 4:
        return { ...this.details.contact };
      case 5:
        return { ...this.details.family, nativeState: this.nativeState };
      case 6:
        return {
          ...this.details.expectations,
          interests: this.details.interests,
          email: this.email,
          password: this.password,
          confirmPassword: this.confirmPassword,
          photos: this.photos().map((p) => p.fileName),
        };
      default:
        return {};
    }
  }

  private restoreStep(step: number, values: Record<string, unknown>): void {
    switch (step) {
      case 1:
        this.details = { ...this.details, personal: { ...this.details.personal, ...values } };
        break;
      case 2:
        this.details = { ...this.details, horoscope: { ...this.details.horoscope, ...values } };
        if (values['birthState'] != null) this.birthState = values['birthState'] as string;
        break;
      case 3:
        this.details = { ...this.details, professional: { ...this.details.professional, ...values } };
        if (values['workingCityChoice'] != null) this.workingCityChoice = values['workingCityChoice'] as string;
        if (values['workingCityOther'] != null) this.workingCityOther = values['workingCityOther'] as string;
        break;
      case 4:
        this.details = { ...this.details, contact: { ...this.details.contact, ...values } };
        break;
      case 5:
        this.details = { ...this.details, family: { ...this.details.family, ...values } };
        if (values['nativeState'] != null) this.nativeState = values['nativeState'] as string;
        break;
      case 6: {
        const ex = { ...this.details.expectations, ...values };
        this.details = { ...this.details, expectations: ex };
        if (typeof values['interests'] === 'string') this.details.interests = values['interests'] as string;
        if (typeof values['email'] === 'string') this.email = values['email'] as string;
        if (typeof values['password'] === 'string') this.password = values['password'] as string;
        if (typeof values['confirmPassword'] === 'string') this.confirmPassword = values['confirmPassword'] as string;
        if (Array.isArray(values['photos'])) {
          const names = (values['photos'] as string[]).filter(Boolean);
          this.details.photos = names.map((fileName, index) => ({
            photoSlot: index + 1,
            fileName,
            isPrimary: index === 0,
          }));
          this.photos.set(this.details.photos);
        }
        break;
      }
    }
  }

  private persistCurrentStep(): void {
    if (!this.draftContext) return;
    this.registerDraftService.saveStep(
      this.draftContext,
      this.currentStep(),
      this.captureStepValues(this.currentStep()),
    );
  }

  private persistAllSteps(): void {
    if (!this.draftContext) return;
    if (this.persistTimer) {
      clearTimeout(this.persistTimer);
      this.persistTimer = null;
    }
    for (let step = 1; step <= this.steps.length; step++) {
      this.registerDraftService.saveStep(this.draftContext, step, this.captureStepValues(step));
    }
  }

  private restoreDraftFromStorage(): void {
    if (!this.draftContext) return;
    const state = this.registerDraftService.read(this.draftContext);

    if (!state) return;

    for (const [stepKey, values] of Object.entries(state.steps)) {
      this.restoreStep(Number(stepKey), values as Record<string, unknown>);
    }

    if (Number.isInteger(state.currentStep) && state.currentStep >= 1 && state.currentStep <= this.steps.length) {
      this.currentStep.set(state.currentStep);
    }

    this.reloadCascadesFromDraft();

    if (this.currentStep() === this.steps.length) {
      this.refreshCaptcha();
    }
  }

  private reloadCascadesFromDraft(): void {
    if (Number(this.details.personal.religion)) {
      this.reloadCastes();
    }
    if (Number(this.birthState)) {
      this.masterData.getDistricts(Number(this.birthState)).subscribe({ next: (o) => this.birthDistricts.set(o) });
    }
    if (Number(this.nativeState)) {
      this.masterData.getDistricts(Number(this.nativeState)).subscribe({ next: (o) => this.nativeDistricts.set(o) });
    }
    if (Number(this.details.family.nativeDistrict)) {
      this.masterData
        .getTalukas(Number(this.details.family.nativeDistrict))
        .subscribe({ next: (o) => this.nativeTalukas.set(o) });
    }
    if (Number(this.details.professional.workingState)) {
      this.masterData
        .getDistricts(Number(this.details.professional.workingState))
        .subscribe({ next: (o) => this.workingDistricts.set(o) });
    }
  }

  private clearDraftFromStorage(): void {
    if (!this.draftContext) return;
    this.registerDraftService.clear(this.draftContext);
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
}