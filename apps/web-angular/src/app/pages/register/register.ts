import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MemberService } from '../../services/member.service';
import { RegisterDraftContext, RegisterDraftService } from '../../services/register-draft.service';
import { TenantStore } from '@org/data-access-tenant';
import { RegisterStepperComponent } from './components/register-stepper.component';
import { RegisterStepPersonalComponent } from './components/register-step-personal/register-step-personal.component';
import { RegisterStepHoroscopeComponent } from './components/register-step-horoscope/register-step-horoscope.component';
import { RegisterStepEducationComponent } from './components/register-step-education/register-step-education.component';
import { RegisterStepAddressComponent } from './components/register-step-address/register-step-address.component';
import { RegisterStepFamilyComponent } from './components/register-step-family/register-step-family.component';
import { RegisterStepExpectationComponent } from './components/register-step-expectation/register-step-expectation.component';
import { RegistrationFormService, EnrollStep, ValidationResult, CaptchaData } from './registration-form.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
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
  private readonly translate = inject(TranslateService);
  private readonly formService = inject(RegistrationFormService);

  private draftContext: RegisterDraftContext | null = null;
  private persistTimer: ReturnType<typeof setTimeout> | null = null;
  private selectedPhotos: File[] = [];

  readonly profileForm: FormGroup = this.formService.createForm();

  private readonly tenantRekeyEffect = effect(() => {
    const headerId = this.tenantStore.tenantHeaderId();
    if (headerId && this.draftContext && this.draftContext.tenantId !== headerId) {
      this.draftContext = this.registerDraftService.rekeyContext(this.draftContext, headerId);
      this.restoreDraftFromStorage();
    }
  });

  readonly steps = this.formService.getSteps();

  private readonly langTick = signal(0);

  private t(key: string): string {
    return this.translate.instant(key);
  }

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
    this.translate.onLangChange.subscribe(() => this.langTick.update((v) => v + 1));
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
    const validation = this.formService.validateStep(this.profileForm, this.currentStep());
    if (!validation.isValid) {
      this.isError.set(true);
      this.message.set(validation.errorMessage!);
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
      const validation = this.formService.validateStep(this.profileForm, step);
      if (!validation.isValid) {
        if (step === this.steps.length && validation.errorMessage?.includes('verification code')) {
          this.refreshCaptcha();
        }
        this.currentStep.set(step);
        this.isError.set(true);
        this.message.set(validation.errorMessage!);
        this.isLoading.set(false);
        return;
      }
    }

    const f = this.profileForm.value;
    const account = this.profileForm.get('account')!.value;
    const ct = this.profileForm.get('contactDetails')!.value;
    const name = [f.personalDetails?.firstName, f.personalDetails?.middleName, f.personalDetails?.lastName]
      .filter(Boolean).join(' ');

    if (!name || !ct.contactEmail || !account.password) {
      this.isError.set(true);
      this.message.set(this.t('register.errors.fillRequired'));
      this.isLoading.set(false);
      return;
    }

    if (account.password.length < 8) {
      this.isError.set(true);
      this.message.set(this.t('register.errors.passwordMin'));
      this.isLoading.set(false);
      return;
    }

    if (account.password !== account.confirmPassword) {
      this.isError.set(true);
      this.message.set(this.t('register.errors.passwordMatch'));
      this.isLoading.set(false);
      return;
    }

    const birthYear = f.personalDetails?.dobYear;
    const age = birthYear && birthYear > 0 ? new Date().getFullYear() - birthYear : undefined;

    const occupation = f.careerDetails?.occupationDetails || '';
    const address = f.contactDetails?.residenceAddress || '';
    const education = f.careerDetails?.educationId ? String(f.careerDetails.educationId) : '';

    const bioParts = [
      education && `Education: ${education}`,
      occupation && `Occupation: ${occupation}`,
      address && `Address: ${address}`,
    ].filter(Boolean);

    this.registerAsync(name, ct.contactEmail.trim().toLowerCase(), account.password, bioParts.join(' | '), age);
  }

  refreshCaptcha(): void {
    const captcha: CaptchaData = this.formService.generateCaptcha();
    this.profileForm.get('verification')!.patchValue({
      code: captcha.code,
      imageDataUrl: captcha.imageDataUrl,
      input: '',
    });
    this.queueDraftPersist();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && !/\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
      this.isError.set(true);
      this.message.set(this.t('register.errors.invalidPhoto'));
      input.value = '';
      return;
    }
    this.profileForm.get('photos')!.get('photo1Name')!.setValue(file?.name ?? '');
    this.selectedPhotos = file ? [file] : [];
  }

  private registerAsync(name: string, email: string, password: string, bio: string, age?: number): void {
    const dto = this.formService.buildCreateProfileDto(this.profileForm, age);
    this.persistAllSteps();
    this.memberService.registerWithProfile({
      email,
      password,
      confirmPassword: password,
      profile: dto,
      photos: this.selectedPhotos,
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
        } else {
          this.persistAllSteps();
        }
      },
      error: (error: unknown) => {
        this.isError.set(true);
        this.message.set(error instanceof Error ? error.message : this.t('register.errors.registrationFailed'));
        this.persistAllSteps();
      },
    });
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
      this.formService.captureStepValues(this.profileForm, this.currentStep()),
    );
  }

  private restoreDraftFromStorage(): void {
    if (!this.draftContext) return;
    let state = this.registerDraftService.read(this.draftContext);

    if (!state) {
      const existingKey = this.registerDraftService.findExistingDraftKey(this.draftContext.draftId);
      if (existingKey && existingKey !== this.draftContext.storageKey) {
        const existingContext = { ...this.draftContext, storageKey: existingKey };
        state = this.registerDraftService.read(existingContext);
        if (state) {
          this.registerDraftService.rekeyContext(existingContext, this.draftContext.tenantId);
        }
      }
    }

    if (!state) return;

    for (const [step, values] of Object.entries(state.steps)) {
      this.formService.restoreStepValues(this.profileForm, Number(step), values as Record<string, unknown>);
    }

    if (Number.isInteger(state.currentStep) && state.currentStep >= 1 && state.currentStep <= this.steps.length) {
      this.currentStep.set(state.currentStep);
    }
  }

  private persistAllSteps(): void {
    if (!this.draftContext) return;
    if (this.persistTimer) {
      clearTimeout(this.persistTimer);
      this.persistTimer = null;
    }
    for (let step = 1; step <= this.steps.length; step++) {
      const stepValues = this.formService.captureStepValues(this.profileForm, step);
      this.registerDraftService.saveStep(this.draftContext, step, stepValues);
    }
  }

  private clearDraftFromStorage(): void {
    if (!this.draftContext) return;
    this.registerDraftService.clear(this.draftContext);
  }
}