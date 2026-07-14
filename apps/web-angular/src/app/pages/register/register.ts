import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MemberService } from '../../services/member.service';
import { RegisterDraftContext, RegisterDraftService } from '../../services/register-draft.service';
import { normalizeText, normalizePhone, isValidTenDigitPhone, isValidEmail, isValidName } from '@org/shared-utils';
import { TenantStore } from '@org/data-access-tenant';
import { CreateProfileDto } from '@org/generated';
import { RegisterStepperComponent } from './components/register-stepper.component';
import { RegisterStepPersonalComponent } from './components/register-step-personal/register-step-personal.component';
import { RegisterStepHoroscopeComponent } from './components/register-step-horoscope/register-step-horoscope.component';
import { RegisterStepEducationComponent } from './components/register-step-education/register-step-education.component';
import { RegisterStepAddressComponent } from './components/register-step-address/register-step-address.component';
import { RegisterStepFamilyComponent } from './components/register-step-family/register-step-family.component';
import { RegisterStepExpectationComponent } from './components/register-step-expectation/register-step-expectation.component';
import { finalize } from 'rxjs/operators';

interface EnrollStep {
  title: string;
}

const STEP_GROUP_NAMES: Record<number, string> = {
  1: 'personalDetails',
  2: 'profileHoroscope',
  3: 'careerDetails',
  4: 'contactDetails',
  5: 'familyDetails',
  6: 'partnerPreference',
};

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    RegisterStepperComponent,
    RegisterStepPersonalComponent,
    RegisterStepHoroscopeComponent,
    RegisterStepEducationComponent,
    RegisterStepAddressComponent,
    RegisterStepFamilyComponent,
    RegisterStepExpectationComponent,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit, OnDestroy {
  private readonly memberService = inject(MemberService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly registerDraftService = inject(RegisterDraftService);
  private readonly tenantStore = inject(TenantStore);

  private static readonly CAPTCHA_LENGTH = 6;
  private static readonly CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  private draftContext: RegisterDraftContext | null = null;
  private persistTimer: ReturnType<typeof setTimeout> | null = null;

  readonly profileForm = new FormGroup({
    personalDetails: new FormGroup({
      firstName: new FormControl(''),
      middleName: new FormControl(''),
      lastName: new FormControl(''),
      dobDay: new FormControl<number | null>(null),
      dobMonth: new FormControl(''),
      dobYear: new FormControl<number | null>(null),
      genderId: new FormControl<number | null>(null),
      religionId: new FormControl<number | null>(null),
      casteId: new FormControl<number | null>(null),
      subCasteId: new FormControl<number | null>(null),
      maritalStatusId: new FormControl<number | null>(null),
      heightFt: new FormControl(5),
      heightIn: new FormControl(4),
      weightKg: new FormControl(40),
      bloodGroupId: new FormControl<number | null>(null),
      complexionId: new FormControl<number | null>(null),
      physicalDisability: new FormControl(false),
      disabilityDetail: new FormControl(''),
      dietId: new FormControl<number | null>(null),
      spectacles: new FormControl(false),
      lens: new FormControl(false),
      personalityId: new FormControl<number | null>(null),
    }),
    profileHoroscope: new FormGroup({
      manglik: new FormControl(false),
      rashiId: new FormControl<number | null>(null),
      nakshatraId: new FormControl<number | null>(null),
      charanId: new FormControl<number | null>(null),
      nadiId: new FormControl<number | null>(null),
      ganId: new FormControl<number | null>(null),
      birthHour: new FormControl(1),
      birthMinute: new FormControl(0),
      birthPeriod: new FormControl(''),
      birthDistrict: new FormControl(''),
      devak: new FormControl(''),
    }),
    careerDetails: new FormGroup({
      educationAreaId: new FormControl<number | null>(null),
      educationId: new FormControl<number | null>(null),
      occupationId: new FormControl<number | null>(null),
      occupationDetails: new FormControl(''),
      workingCityCountry: new FormControl(''),
      incomeAmount: new FormControl<number | null>(null),
      incomePeriodId: new FormControl<number | null>(null),
    }),
    contactDetails: new FormGroup({
      residenceAddress: new FormControl(''),
      contactEmail: new FormControl(''),
      idProofNumber: new FormControl(''),
      smsMobile: new FormControl(''),
      mobile2: new FormControl(''),
      phone1: new FormControl(''),
      phone2: new FormControl(''),
    }),
    familyDetails: new FormGroup({
      fatherStatus: new FormControl(false),
      motherStatus: new FormControl(false),
      brothers: new FormControl(0),
      marriedBrothers: new FormControl(0),
      sisters: new FormControl(0),
      marriedSisters: new FormControl(0),
      parentsFullName: new FormControl(''),
      parentsOccupation: new FormControl(''),
      parentsResidentCity: new FormControl(''),
      familyWealth: new FormControl(''),
      mamaSurnamePlace: new FormControl(''),
      nativeDistrict: new FormControl(''),
      nativeTaluka: new FormControl(''),
      intercastMarriage: new FormControl(false),
      intercastRelation: new FormControl(''),
    }),
    partnerPreference: new FormGroup({
      expectedManglik: new FormControl(false),
      expectedCaste: new FormControl(''),
      maxAgeDifference: new FormControl(0),
      expectedHeightFt: new FormControl(5),
      expectedHeightIn: new FormControl(0),
      expectedEducation: new FormControl(''),
      expectedOccupationIncome: new FormControl(''),
      divorcee: new FormControl(false),
    }),
    fullName: new FormControl<string | null>(null),
    age: new FormControl<number | null>(null),
    bio: new FormControl<string | null>(null),
    locationText: new FormControl<string | null>(null),
    occupationText: new FormControl<string | null>(null),
    preferredCities: new FormControl(''),
    relativesSurnames: new FormControl(''),
    account: new FormGroup({
      email: new FormControl(''),
      password: new FormControl(''),
      confirmPassword: new FormControl(''),
    }),
    verification: new FormGroup({
      code: new FormControl(''),
      input: new FormControl(''),
      imageDataUrl: new FormControl(''),
    }),
    photos: new FormGroup({
      photo1Name: new FormControl(''),
      photo2Name: new FormControl(''),
    }),
  });

  private readonly tenantRekeyEffect = effect(() => {
    const headerId = this.tenantStore.tenantHeaderId();
    if (headerId && this.draftContext && this.draftContext.tenantId !== headerId) {
      this.draftContext = this.registerDraftService.rekeyContext(this.draftContext, headerId);
      this.restoreDraftFromStorage();
    }
  });

  readonly steps: EnrollStep[] = [
    { title: 'Personal' },
    { title: 'Horoscope' },
    { title: 'Education' },
    { title: 'Address' },
    { title: 'Family' },
    { title: 'Expectation' },
  ];

  currentStep = signal(1);
  message = signal('');
  isError = signal(false);
  isLoading = signal(false);

  readonly days = Array.from({ length: 31 }, (_, i) => i + 1);
  readonly months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  readonly years = Array.from({ length: 45 }, (_, i) => 1980 + i);

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
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  nextStep(): void {
    this.persistCurrentStep();
    const stepError = this.validateStep(this.currentStep());
    if (stepError) {
      this.isError.set(true);
      this.message.set(stepError);
      return;
    }
    this.message.set('');
    this.isError.set(false);
    if (this.currentStep() < this.steps.length) {
      this.currentStep.set(this.currentStep() + 1);
      if (this.currentStep() === this.steps.length) {
        this.refreshCaptcha();
      }
      this.queueDraftPersist();
    }
  }

  isLastStep = computed(() => this.currentStep() === this.steps.length);

  submit(): void {
    this.message.set('');
    this.isError.set(false);
    this.isLoading.set(true);

    for (let step = 1; step <= this.steps.length; step += 1) {
      const stepError = this.validateStep(step);
      if (stepError) {
        if (step === this.steps.length && stepError.includes('verification code')) {
          this.refreshCaptcha();
        }
        this.currentStep.set(step);
        this.isError.set(true);
        this.message.set(stepError);
        this.isLoading.set(false);
        return;
      }
    }

    const f = this.profileForm.value;
    const account = this.profileForm.get('account')!.value;
    const name = [f.personalDetails?.firstName, f.personalDetails?.middleName, f.personalDetails?.lastName]
      .filter(Boolean).join(' ');

    if (!name || !account.email || !account.password) {
      this.isError.set(true);
      this.message.set('Please fill required fields including email and account password.');
      this.isLoading.set(false);
      return;
    }

    if (account.password.length < 8) {
      this.isError.set(true);
      this.message.set('Password must be at least 8 characters.');
      this.isLoading.set(false);
      return;
    }

    if (account.password !== account.confirmPassword) {
      this.isError.set(true);
      this.message.set('Password and confirm password must match.');
      this.isLoading.set(false);
      return;
    }

    const birthYear = f.personalDetails?.dobYear;
    const age = birthYear && birthYear > 0 ? new Date().getFullYear() - birthYear : undefined;

    const occupation = f.careerDetails?.occupationDetails || '';
    const address = f.contactDetails?.residenceAddress || '';
    const expectedOcc = f.partnerPreference?.expectedOccupationIncome || '';
    const education = f.careerDetails?.educationId ? String(f.careerDetails.educationId) : '';

    const bioParts = [
      education && `Education: ${education}`,
      occupation && `Occupation: ${normalizeText(occupation)}`,
      address && `Address: ${normalizeText(address)}`,
      expectedOcc && `Expectation: ${normalizeText(expectedOcc)}`,
    ].filter(Boolean);

    this.registerAsync(name, account.email.trim().toLowerCase(), account.password, bioParts.join(' | '), age);
  }

  refreshCaptcha(): void {
    const code = this.generateCaptchaCode();
    this.profileForm.get('verification')!.patchValue({
      code,
      imageDataUrl: this.createCaptchaImage(code),
      input: '',
    });
    this.queueDraftPersist();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && !/\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
      this.isError.set(true);
      this.message.set('Only JPG, JPEG, PNG, or WEBP files are allowed.');
      input.value = '';
      return;
    }
    this.profileForm.get('photos')!.get('photo1Name')!.setValue(file?.name ?? '');
  }

  onPhoto2Selected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && !/\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
      this.isError.set(true);
      this.message.set('Only JPG, JPEG, PNG, or WEBP files are allowed.');
      input.value = '';
      return;
    }
    this.profileForm.get('photos')!.get('photo2Name')!.setValue(file?.name ?? '');
  }

  private registerAsync(name: string, email: string, password: string, bio: string, age?: number): void {
    const dto = this.buildCreateProfileDto(age);
    this.memberService.registerWithProfile({
      email,
      password,
      confirmPassword: password,
      profile: dto,
      name,
      age,
      bio,
    }).pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: (result) => {
        this.isError.set(!result.ok);
        this.message.set(result.message);
        if (result.ok) {
          this.clearDraftFromStorage();
          this.router.navigateByUrl('/login');
        }
      },
      error: (error: unknown) => {
        this.isError.set(true);
        this.message.set(error instanceof Error ? error.message : 'Registration failed. Please try again.');
      },
    });
  }

  private buildCreateProfileDto(age?: number): CreateProfileDto {
    const f = this.profileForm.value;
    const pd = f.personalDetails!;
    const hd = f.profileHoroscope!;
    const cd = f.careerDetails!;
    const ct = f.contactDetails!;
    const fd = f.familyDetails!;
    const pp = f.partnerPreference!;

    const phoneNumbers: Array<{ phoneType: string; phoneNumber: string }> = [];
    if (ct.smsMobile) phoneNumbers.push({ phoneType: 'Mobile', phoneNumber: ct.smsMobile });
    if (ct.mobile2) phoneNumbers.push({ phoneType: 'Mobile2', phoneNumber: ct.mobile2 });
    if (ct.phone1) phoneNumbers.push({ phoneType: 'Phone', phoneNumber: ct.phone1 });
    if (ct.phone2) phoneNumbers.push({ phoneType: 'Phone2', phoneNumber: ct.phone2 });

    const relativeSurnames = f.relativesSurnames
      ? f.relativesSurnames.split(/[,\n]/).map((s: string) => s.trim()).filter(Boolean)
      : undefined;

    const profilePhotos: Array<{ photoSlot: number; fileName: string; isPrimary: boolean }> = [];
    const p1 = f.photos?.photo1Name;
    const p2 = f.photos?.photo2Name;
    if (p1) profilePhotos.push({ photoSlot: 1, fileName: p1, isPrimary: true });
    if (p2) profilePhotos.push({ photoSlot: 2, fileName: p2, isPrimary: false });

    return {
      fullName: [pd.firstName, pd.middleName, pd.lastName].filter(Boolean).join(' '),
      age: f.age ?? age,
      bio: f.bio ?? undefined,
      locationText: (f.locationText || ct.residenceAddress || cd.workingCityCountry) ?? undefined,
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
        workingCityCountry: cd.workingCityCountry ?? undefined,
        incomeAmount: cd.incomeAmount ?? undefined,
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
        nativeDistrict: fd.nativeDistrict ?? undefined,
        nativeTaluka: fd.nativeTaluka ?? undefined,
        intercastMarriage: fd.intercastMarriage ?? undefined,
        intercastRelation: fd.intercastRelation ?? undefined,
      },
      relativeSurnames,
      partnerPreference: {
        expectedManglik: pp.expectedManglik ?? undefined,
        expectedCaste: pp.expectedCaste ?? undefined,
        maxAgeDifference: pp.maxAgeDifference ?? undefined,
        expectedHeightFt: pp.expectedHeightFt ?? undefined,
        expectedHeightIn: pp.expectedHeightIn ?? undefined,
        expectedEducation: pp.expectedEducation ?? undefined,
        expectedOccupationIncome: pp.expectedOccupationIncome ?? undefined,
        divorcee: pp.divorcee ?? undefined,
      },
      profileHoroscope: {
        manglik: hd.manglik ?? undefined,
        birthHour: hd.birthHour ?? undefined,
        birthMinute: hd.birthMinute ?? undefined,
        birthPeriod: hd.birthPeriod ?? undefined,
        birthDistrict: hd.birthDistrict ?? undefined,
        devak: hd.devak ?? undefined,
        rashiId: hd.rashiId ?? undefined,
        nakshatraId: hd.nakshatraId ?? undefined,
        charanId: hd.charanId ?? undefined,
        nadiId: hd.nadiId ?? undefined,
        ganId: hd.ganId ?? undefined,
      },
      profilePhotos: profilePhotos.length > 0 ? profilePhotos : undefined,
    };
  }

  private validateStep(step: number): string | null {
    const pd = this.profileForm.get('personalDetails')!.value!;
    const hd = this.profileForm.get('profileHoroscope')!.value!;
    const cd = this.profileForm.get('careerDetails')!.value!;
    const ct = this.profileForm.get('contactDetails')!.value!;
    const fd = this.profileForm.get('familyDetails')!.value!;
    const pp = this.profileForm.get('partnerPreference')!.value!;
    const verification = this.profileForm.get('verification')!.value!;
    const account = this.profileForm.get('account')!.value!;

    if (step === 1) {
      if (!normalizeText(pd.firstName) || !normalizeText(pd.lastName)) {
        return 'First name and last name are required.';
      }
      if (!isValidName(pd.firstName || '') || !isValidName(pd.lastName || '')) {
        return 'Name fields can contain letters and spaces only.';
      }
      if (!pd.dobDay || !pd.dobMonth || !pd.dobYear) {
        return 'Please select complete date of birth.';
      }
      if (!pd.genderId) {
        return 'Please select gender.';
      }
      if (!pd.religionId) {
        return 'Please select religion.';
      }
      const age = new Date().getFullYear() - (pd.dobYear || 0);
      if (Number.isNaN(age) || age < 18 || age > 80) {
        return 'Age must be between 18 and 80 years.';
      }
      if (pd.physicalDisability && !normalizeText(pd.disabilityDetail || '')) {
        return 'Please specify disability details.';
      }
    }

    if (step === 2) {
      if (!hd.birthPeriod || !hd.birthDistrict) {
        return 'Please select birth time period and birth district.';
      }
    }

    if (step === 3) {
      if (!cd.educationAreaId || !cd.educationId) {
        return 'Please provide education details.';
      }
      if (!cd.occupationId || !normalizeText(cd.occupationDetails || '')) {
        return 'Please provide occupation details.';
      }
      if (!cd.workingCityCountry) {
        return 'Please select working city/country.';
      }
      if (cd.incomeAmount && !Number.isFinite(cd.incomeAmount)) {
        return 'Income amount must be numeric.';
      }
    }

    if (step === 4) {
      const address = normalizeText(ct.residenceAddress || '');
      if (!address || address.length < 10) {
        return 'Please enter a valid residence address.';
      }
      if (!isValidEmail(ct.contactEmail || '')) {
        return 'Please enter a valid contact email.';
      }
      if (!isValidTenDigitPhone(ct.smsMobile || '')) {
        return 'Mobile for SMS alert must be a 10-digit number.';
      }
      if (ct.mobile2 && !isValidTenDigitPhone(ct.mobile2)) {
        return 'Mobile II must be a 10-digit number.';
      }
      if (ct.phone1 && !isValidTenDigitPhone(ct.phone1)) {
        return 'Phone I must be a 10-digit number.';
      }
      if (ct.phone2 && !isValidTenDigitPhone(ct.phone2)) {
        return 'Phone II must be a 10-digit number.';
      }

      const normalize = (v: string) => normalizePhone(v);
      this.profileForm.get('contactDetails')!.patchValue({
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
        return 'Please enter parents full name.';
      }
      if (!fd.nativeDistrict) {
        return 'Please select native district.';
      }
    }

    if (step === 6) {
      if (!normalizeText(this.profileForm.get('preferredCities')!.value || '')) {
        return 'Please enter preferred cities.';
      }
      if (!normalizeText(pp.expectedEducation || '') || !normalizeText(pp.expectedOccupationIncome || '')) {
        return 'Please fill expected education and occupation/income.';
      }
      if (!account.password || !account.confirmPassword) {
        return 'Please set your account password and confirm it.';
      }
      if (account.password.length < 8) {
        return 'Password must be at least 8 characters.';
      }
      if (account.password !== account.confirmPassword) {
        return 'Password and confirm password must match.';
      }
      if ((verification.input || '').trim().toUpperCase() !== (verification.code || '')) {
        return 'Please enter correct verification code.';
      }
    }

    return null;
  }

  private generateCaptchaCode(): string {
    let result = '';
    for (let i = 0; i < Register.CAPTCHA_LENGTH; i++) {
      result += Register.CAPTCHA_CHARS[Math.floor(Math.random() * Register.CAPTCHA_CHARS.length)];
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
    if (!this.draftContext) return;
    this.registerDraftService.saveStep(
      this.draftContext,
      this.currentStep(),
      this.captureStepValues(this.currentStep()),
    );
  }

  private restoreDraftFromStorage(): void {
    if (!this.draftContext) return;
    const state = this.registerDraftService.read(this.draftContext);
    if (!state) return;

    for (const [step, values] of Object.entries(state.steps)) {
      const groupName = STEP_GROUP_NAMES[Number(step)];
      if (groupName) {
        this.profileForm.get(groupName)?.patchValue(values, { emitEvent: false });
      } else if (Number(step) === 6) {
        const v = values as Record<string, unknown>;
        if (v['preferredCities'] != null) this.profileForm.get('preferredCities')?.patchValue(v['preferredCities'] as string, { emitEvent: false });
        if (v['relativesSurnames'] != null) this.profileForm.get('relativesSurnames')?.patchValue(v['relativesSurnames'] as string, { emitEvent: false });
        if (v['account']) this.profileForm.get('account')?.patchValue(v['account'] as { email: string | null; password: string | null; confirmPassword: string | null }, { emitEvent: false });
        if (v['verification']) this.profileForm.get('verification')?.patchValue(v['verification'] as { code: string | null; input: string | null; imageDataUrl: string | null }, { emitEvent: false });
        if (v['photos']) this.profileForm.get('photos')?.patchValue(v['photos'] as { photo1Name: string | null; photo2Name: string | null }, { emitEvent: false });
      }
    }

    if (Number.isInteger(state.currentStep) && state.currentStep >= 1 && state.currentStep <= this.steps.length) {
      this.currentStep.set(state.currentStep);
    }
  }

  private captureStepValues(step: number): Record<string, unknown> {
    const groupName = STEP_GROUP_NAMES[step];
    if (groupName) {
      return this.profileForm.get(groupName)?.value ?? {};
    }
    if (step === 6) {
      return {
        preferredCities: this.profileForm.get('preferredCities')?.value,
        relativesSurnames: this.profileForm.get('relativesSurnames')?.value,
        account: this.profileForm.get('account')?.value,
        verification: this.profileForm.get('verification')?.value,
        photos: this.profileForm.get('photos')?.value,
      };
    }
    return {};
  }

  private clearDraftFromStorage(): void {
    if (!this.draftContext) return;
    this.registerDraftService.clear(this.draftContext);
  }
}
