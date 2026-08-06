import { Component, ChangeDetectionStrategy, inject, OnInit, signal, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MemberService } from '../../services/member.service';
import {
  RegisterMasterDataService,
  RegisterLookupOption,
  RegisterStateOption,
  RegisterDistrictOption,
  RegisterTalukaOption,
  RegisterCountryOption,
  RegisterIncomeRangeOption,
} from '../../services/register-master-data.service';
import { ProfileDetailDto, CreateProfileDto } from '@org/generated';
import { Subscription, forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { SubscriptionStore } from '@org/data-access-subscription';
import { SharedSidebarComponent } from '../../components/shared-sidebar/shared-sidebar.component';
import { getDefaultAvatar, resolvePhotoUrl } from '../../utils/default-avatar';
import { computed } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslateModule, SharedSidebarComponent],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile implements OnInit {
  private readonly memberService = inject(MemberService);
  private readonly masterData = inject(RegisterMasterDataService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly authService = inject(AuthService);
  private readonly subscriptionStore = inject(SubscriptionStore);
  private readonly translate = inject(TranslateService);

  readonly userName = signal('');
  readonly userPhotoUrl = signal('');
  readonly userOccupation = signal('');
  readonly subscriptionStatus = this.subscriptionStore.status;
  readonly subscriptionLoading = computed(() => this.subscriptionStore.loading());

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);
  readonly validationErrors = signal<string[]>([]);
  readonly successMessage = signal<string | null>(null);
  readonly openSections = signal<Set<number>>(new Set([0]));

  private subs: Subscription[] = [];
  private profileLoaded = false;

  profileForm = new FormGroup({
    personalDetails: new FormGroup({
      firstName: new FormControl(''),
      middleName: new FormControl(''),
      lastName: new FormControl(''),
      dobDay: new FormControl<number | null>(null),
      dobMonth: new FormControl(''),
      dobYear: new FormControl<number | null>(null),
      genderId: new FormControl<number | null>(null, Validators.required),
      religionId: new FormControl<number | null>(null, Validators.required),
      casteId: new FormControl<number | null>(null),
      subCasteId: new FormControl<number | null>(null),
      maritalStatusId: new FormControl<number | null>(null, Validators.required),
      heightFt: new FormControl<number>(5),
      heightIn: new FormControl<number>(4),
      weightKg: new FormControl<number>(50),
      bloodGroupId: new FormControl<number | null>(null),
      complexionId: new FormControl<number | null>(null),
      physicalDisability: new FormControl<boolean>(false),
      disabilityDetail: new FormControl(''),
      dietId: new FormControl<number | null>(null),
      spectacles: new FormControl<boolean>(false),
      lens: new FormControl<boolean>(false),
      personalityId: new FormControl<number | null>(null),
    }),
    careerDetails: new FormGroup({
      educationAreaId: new FormControl<number | null>(null),
      educationId: new FormControl<number | null>(null),
      occupationId: new FormControl<number | null>(null),
      occupationDetails: new FormControl(''),
      workingCountryId: new FormControl<number | null>(null),
      workingCountryOther: new FormControl(''),
      workingStateId: new FormControl<number | null>(null),
      workingStateOther: new FormControl(''),
      workingCity: new FormControl(''),
      workingCityOther: new FormControl(''),
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
      fatherStatus: new FormControl<boolean>(false),
      motherStatus: new FormControl<boolean>(false),
      brothers: new FormControl<number>(0),
      marriedBrothers: new FormControl<number>(0),
      sisters: new FormControl<number>(0),
      marriedSisters: new FormControl<number>(0),
      parentsFullName: new FormControl(''),
      parentsOccupation: new FormControl(''),
      parentsResidentCity: new FormControl(''),
      familyWealth: new FormControl(''),
      mamaSurnamePlace: new FormControl(''),
      nativeStateId: new FormControl<number | null>(null),
      nativeStateOther: new FormControl(''),
      nativeDistrictId: new FormControl<number | null>(null),
      nativeDistrictOther: new FormControl(''),
      nativeTalukaId: new FormControl<number | null>(null),
      nativeTalukaOther: new FormControl(''),
      intercastMarriage: new FormControl<boolean>(false),
      intercastRelation: new FormControl(''),
    }),
    partnerPreference: new FormGroup({
      expectedManglik: new FormControl<boolean>(false),
      maxAgeDifference: new FormControl<number>(0),
      expectedHeightFt: new FormControl<number>(5),
      expectedHeightIn: new FormControl<number>(0),
      divorcee: new FormControl<boolean>(false),
      expectedCasteNoBar: new FormControl<boolean>(false),
      expectedEducationNoBar: new FormControl<boolean>(false),
      expectedOccupationNoBar: new FormControl<boolean>(false),
      expectedIncomeRangeId: new FormControl<number | null>(null),
      expectedCasteIds: new FormControl(''),
      expectedEducationIds: new FormControl(''),
      expectedOccupationIds: new FormControl(''),
    }),
    horoscope: new FormGroup({
      manglik: new FormControl<boolean>(false),
      rashiId: new FormControl<number | null>(null),
      nakshatraId: new FormControl<number | null>(null),
      charanId: new FormControl<number | null>(null),
      nadiId: new FormControl<number | null>(null),
      ganId: new FormControl<number | null>(null),
      birthHour: new FormControl<number>(1),
      birthMinute: new FormControl<number>(0),
      birthPeriod: new FormControl(''),
      devak: new FormControl(''),
      birthStateId: new FormControl<number | null>(null),
      birthStateOther: new FormControl(''),
      birthDistrictId: new FormControl<number | null>(null),
      birthDistrictOther: new FormControl(''),
    }),
    preferredCities: new FormControl(''),
    interests: new FormControl(''),
    bio: new FormControl(''),
    locationText: new FormControl(''),
  });

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
  incomeRangeOptions: RegisterIncomeRangeOption[] = [];
  lookupsLoading = true;

  allExpectedCasteOptions: RegisterLookupOption[] = [];
  expectedCasteOptions: RegisterLookupOption[] = [];
  allExpectedEducationOptions: RegisterLookupOption[] = [];
  expectedEducationOptions: RegisterLookupOption[] = [];
  allExpectedOccupationOptions: RegisterLookupOption[] = [];
  expectedOccupationOptions: RegisterLookupOption[] = [];
  casteDropdownOpen = false;
  educationDropdownOpen = false;
  occupationDropdownOpen = false;
  dropdownStyle: Record<string, string> = {};

  readonly days = Array.from({ length: 31 }, (_, i) => i + 1);
  readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  readonly years = Array.from({ length: 45 }, (_, i) => 1980 + i);

  birthStates: RegisterStateOption[] = [];
  birthDistricts: RegisterDistrictOption[] = [];
  workingStates: RegisterStateOption[] = [];
  workingDistricts: RegisterDistrictOption[] = [];
  countries: RegisterCountryOption[] = [];
  nativeStates: RegisterStateOption[] = [];
  nativeDistricts: RegisterDistrictOption[] = [];
  nativeTalukas: RegisterTalukaOption[] = [];

  get personal() { return this.profileForm.get('personalDetails') as FormGroup; }
  get career() { return this.profileForm.get('careerDetails') as FormGroup; }
  get contact() { return this.profileForm.get('contactDetails') as FormGroup; }
  get family() { return this.profileForm.get('familyDetails') as FormGroup; }
  get partner() { return this.profileForm.get('partnerPreference') as FormGroup; }
  get horoscope() { return this.profileForm.get('horoscope') as FormGroup; }

  ngOnInit(): void {
    const userId = this.authService.getSession()?.userId ?? 0;
    if (userId) {
      this.subscriptionStore.loadSubscriptionStatus(userId).subscribe();
    }
    this.loadLookups();
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-select')) {
      this.casteDropdownOpen = false;
      this.educationDropdownOpen = false;
      this.occupationDropdownOpen = false;
    }
  }

  private loadLookups(): void {
    forkJoin({
      genders: this.masterData.getGenders(),
      religions: this.masterData.getReligions(),
      maritalStatuses: this.masterData.getMaritalStatuses(),
      bloodGroups: this.masterData.getBloodGroups(),
      complexions: this.masterData.getComplexions(),
      diets: this.masterData.getDiets(),
      personalities: this.masterData.getPersonalities(),
      rashis: this.masterData.getRashis(),
      nakshatras: this.masterData.getNakshatras(),
      charans: this.masterData.getCharans(),
      nadis: this.masterData.getNadis(),
      gans: this.masterData.getGans(),
      educationAreas: this.masterData.getEducationAreas(),
      educations: this.masterData.getEducations(),
      occupations: this.masterData.getOccupations(),
      incomePeriods: this.masterData.getIncomePeriods(),
      incomeRanges: this.masterData.getIncomeRanges(),
      states: this.masterData.getStates(),
      countries: this.masterData.getCountries(),
    }).subscribe({
      next: (r) => {
        this.genderOptions = r.genders;
        this.religionOptions = r.religions;
        this.maritalStatusOptions = r.maritalStatuses;
        this.bloodGroupOptions = r.bloodGroups;
        this.complexionOptions = r.complexions;
        this.dietOptions = r.diets;
        this.personalityOptions = r.personalities;
        this.rashisOptions = r.rashis;
        this.nakshatrasOptions = r.nakshatras;
        this.charansOptions = r.charans;
        this.nadisOptions = r.nadis;
        this.gansOptions = r.gans;
        this.educationAreasOptions = r.educationAreas;
        this.educationsOptions = r.educations;
        this.occupationsOptions = r.occupations;
        this.allExpectedEducationOptions = r.educations;
        this.allExpectedOccupationOptions = r.occupations;
        this.updateExpectedEducationOptions();
        this.updateExpectedOccupationOptions();
        this.incomePeriodsOptions = r.incomePeriods;
        this.incomeRangeOptions = r.incomeRanges;
        this.birthStates = r.states;
        this.workingStates = r.states;
        this.nativeStates = r.states;
        this.countries = r.countries;
      },
      complete: () => { this.lookupsLoading = false; this.cdr.detectChanges(); },
      error: () => { this.lookupsLoading = false; this.cdr.detectChanges(); },
    });

    this.subs.push(
      this.personal.get('religionId')!.valueChanges.subscribe((religionId: number | null) => {
        this.loadCastes(religionId, false);
        this.loadExpectedCastes(religionId);
      }),
      this.personal.get('casteId')!.valueChanges.subscribe((casteId: number | null) => {
        this.loadSubCastes(casteId);
      }),
      this.partner.get('expectedCasteNoBar')!.valueChanges.subscribe(() => this.updateExpectedCasteOptions()),
      this.partner.get('expectedEducationNoBar')!.valueChanges.subscribe(() => this.updateExpectedEducationOptions()),
      this.partner.get('expectedOccupationNoBar')!.valueChanges.subscribe(() => this.updateExpectedOccupationOptions()),
      this.horoscope.get('birthStateId')!.valueChanges.subscribe((value) => {
        const stateId = Number(value);
        if (!stateId || stateId === 0) {
          this.horoscope.get('birthStateOther')!.setValue('', { emitEvent: false });
          this.birthDistricts = [];
          this.horoscope.get('birthDistrictId')!.setValue(null, { emitEvent: false });
          this.horoscope.get('birthDistrictOther')!.setValue('', { emitEvent: false });
        } else {
          this.horoscope.get('birthStateOther')!.setValue('', { emitEvent: false });
          this.horoscope.get('birthDistrictId')!.setValue(null, { emitEvent: false });
          this.horoscope.get('birthDistrictOther')!.setValue('', { emitEvent: false });
          this.masterData.getDistricts(stateId).subscribe((districts) => {
            this.birthDistricts = districts;
            this.cdr.detectChanges();
          });
        }
      }),
      this.career.get('workingCountryId')!.valueChanges.subscribe((value) => {
        this.career.get('workingCountryOther')!.setValue('', { emitEvent: false });
        if (!value || value === 0) {
          this.career.get('workingStateId')!.setValue(null, { emitEvent: false });
          this.career.get('workingStateOther')!.setValue('', { emitEvent: false });
          this.career.get('workingCity')!.setValue('', { emitEvent: false });
          this.career.get('workingCityOther')!.setValue('', { emitEvent: false });
          this.workingDistricts = [];
        }
      }),
      this.career.get('workingStateId')!.valueChanges.subscribe((value) => {
        const stateId = Number(value);
        if (!stateId || stateId === 0) {
          this.career.get('workingStateOther')!.setValue('', { emitEvent: false });
          this.career.get('workingCity')!.setValue('', { emitEvent: false });
          this.career.get('workingCityOther')!.setValue('', { emitEvent: false });
          this.workingDistricts = [];
        } else {
          this.career.get('workingStateOther')!.setValue('', { emitEvent: false });
          this.career.get('workingCity')!.setValue('', { emitEvent: false });
          this.career.get('workingCityOther')!.setValue('', { emitEvent: false });
          this.workingDistricts = [];
          this.masterData.getDistricts(stateId).subscribe((districts) => {
            this.workingDistricts = districts;
            this.cdr.detectChanges();
          });
        }
      }),
      this.family.get('nativeStateId')!.valueChanges.subscribe((value) => {
        const stateId = Number(value);
        if (!stateId || stateId === 0) {
          this.nativeDistricts = [];
          this.nativeTalukas = [];
          this.family.get('nativeDistrictId')!.setValue(null, { emitEvent: false });
          this.family.get('nativeDistrictOther')!.setValue('', { emitEvent: false });
          this.family.get('nativeTalukaId')!.setValue(null, { emitEvent: false });
          this.family.get('nativeTalukaOther')!.setValue('', { emitEvent: false });
        } else {
          this.nativeDistricts = [];
          this.nativeTalukas = [];
          this.family.get('nativeDistrictId')!.setValue(null, { emitEvent: false });
          this.family.get('nativeDistrictOther')!.setValue('', { emitEvent: false });
          this.family.get('nativeTalukaId')!.setValue(null, { emitEvent: false });
          this.family.get('nativeTalukaOther')!.setValue('', { emitEvent: false });
          this.masterData.getDistricts(stateId).subscribe((districts) => {
            this.nativeDistricts = districts;
            this.cdr.detectChanges();
          });
        }
      }),
      this.family.get('nativeDistrictId')!.valueChanges.subscribe((value) => {
        const districtId = Number(value);
        if (!districtId || districtId === 0) {
          this.nativeTalukas = [];
          this.family.get('nativeTalukaId')!.setValue(null, { emitEvent: false });
          this.family.get('nativeTalukaOther')!.setValue('', { emitEvent: false });
        } else {
          this.nativeTalukas = [];
          this.family.get('nativeTalukaId')!.setValue(null, { emitEvent: false });
          this.family.get('nativeTalukaOther')!.setValue('', { emitEvent: false });
          this.masterData.getTalukas(districtId).subscribe((talukas) => {
            this.nativeTalukas = talukas;
            this.cdr.detectChanges();
          });
        }
      }),
    );
  }

  private loadCastes(religionId: number | null, preserve: boolean): void {
    this.casteOptions = [];
    this.subCasteOptions = [];
    if (!religionId) {
      this.personal.patchValue({ casteId: null, subCasteId: null });
      return;
    }
    this.masterData.getCastes(religionId).subscribe((castes) => {
      this.casteOptions = castes;
      if (!preserve) this.personal.patchValue({ casteId: null, subCasteId: null });
      this.cdr.detectChanges();
    });
  }

  private loadSubCastes(casteId: number | null): void {
    this.subCasteOptions = [];
    if (!casteId) {
      this.personal.get('subCasteId')!.setValue(null);
      return;
    }
    this.masterData.getSubCastes(casteId).subscribe((subCastes) => {
      this.subCasteOptions = subCastes;
      this.cdr.detectChanges();
    });
  }

  private loadExpectedCastes(religionId: number | null): void {
    if (!religionId) {
      this.allExpectedCasteOptions = [];
      this.expectedCasteOptions = [];
      return;
    }
    this.masterData.getCastes(religionId).subscribe((castes) => {
      this.allExpectedCasteOptions = castes;
      this.updateExpectedCasteOptions();
      this.cdr.detectChanges();
    });
  }

  private updateExpectedCasteOptions(): void {
    const noBar = this.partner.get('expectedCasteNoBar')?.value;
    this.expectedCasteOptions = noBar ? [] : this.allExpectedCasteOptions;
    if (noBar) this.partner.get('expectedCasteIds')!.setValue('', { emitEvent: false });
  }

  private updateExpectedEducationOptions(): void {
    const noBar = this.partner.get('expectedEducationNoBar')?.value;
    this.expectedEducationOptions = noBar ? [] : this.allExpectedEducationOptions;
    if (noBar) this.partner.get('expectedEducationIds')!.setValue('', { emitEvent: false });
  }

  private updateExpectedOccupationOptions(): void {
    const noBar = this.partner.get('expectedOccupationNoBar')?.value;
    this.expectedOccupationOptions = noBar ? [] : this.allExpectedOccupationOptions;
    if (noBar) this.partner.get('expectedOccupationIds')!.setValue('', { emitEvent: false });
  }

  private getSelectedIds(field: string): number[] {
    const val = this.partner.get(field)?.value;
    if (!val) return [];
    return String(val).split(',').map((s: string) => Number(s.trim())).filter((n: number) => Number.isFinite(n) && n > 0);
  }

  isCasteSelected(id: number): boolean { return this.getSelectedIds('expectedCasteIds').includes(id); }
  isEducationSelected(id: number): boolean { return this.getSelectedIds('expectedEducationIds').includes(id); }
  isOccupationSelected(id: number): boolean { return this.getSelectedIds('expectedOccupationIds').includes(id); }

  toggleCasteDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.casteDropdownOpen = !this.casteDropdownOpen;
    if (this.casteDropdownOpen) { this.educationDropdownOpen = false; this.occupationDropdownOpen = false; this.positionDropdown(event); }
  }

  toggleEducationDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.educationDropdownOpen = !this.educationDropdownOpen;
    if (this.educationDropdownOpen) { this.occupationDropdownOpen = false; this.casteDropdownOpen = false; this.positionDropdown(event); }
  }

  toggleOccupationDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.occupationDropdownOpen = !this.occupationDropdownOpen;
    if (this.occupationDropdownOpen) { this.educationDropdownOpen = false; this.casteDropdownOpen = false; this.positionDropdown(event); }
  }

  private positionDropdown(event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.dropdownStyle = {
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      maxHeight: '220px',
      zIndex: '9999',
    };
  }

  toggleCasteOption(id: number, event: Event): void {
    event.stopPropagation();
    const current = this.getSelectedIds('expectedCasteIds');
    const idx = current.indexOf(id);
    if (idx > -1) { current.splice(idx, 1); } else { current.push(id); }
    this.partner.get('expectedCasteIds')!.setValue(current.join(','));
  }

  toggleEducationOption(id: number, event: Event): void {
    event.stopPropagation();
    const current = this.getSelectedIds('expectedEducationIds');
    const idx = current.indexOf(id);
    if (idx > -1) { current.splice(idx, 1); } else { current.push(id); }
    this.partner.get('expectedEducationIds')!.setValue(current.join(','));
  }

  toggleOccupationOption(id: number, event: Event): void {
    event.stopPropagation();
    const current = this.getSelectedIds('expectedOccupationIds');
    const idx = current.indexOf(id);
    if (idx > -1) { current.splice(idx, 1); } else { current.push(id); }
    this.partner.get('expectedOccupationIds')!.setValue(current.join(','));
  }

  getSelectedCasteLabels(): string[] {
    return this.expectedCasteOptions.filter(o => this.getSelectedIds('expectedCasteIds').includes(o.id)).map(o => o.label);
  }

  getSelectedEducationLabels(): string[] {
    return this.expectedEducationOptions.filter(o => this.getSelectedIds('expectedEducationIds').includes(o.id)).map(o => o.label);
  }

  getSelectedOccupationLabels(): string[] {
    return this.expectedOccupationOptions.filter(o => this.getSelectedIds('expectedOccupationIds').includes(o.id)).map(o => o.label);
  }

  getTags(field: string): string[] {
    const val = (this.profileForm.get(field)?.value ?? '').toString().trim();
    if (!val) return [];
    return val.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  }

  onTagKeydown(event: KeyboardEvent, field: string): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addTagFromInput(field, event);
    }
  }

  addTagFromInput(field: string, event?: Event): void {
    const input = ((event?.target) ?? (document.activeElement)) as HTMLInputElement;
    const text = (input?.value ?? '').trim().replace(/,/g, '');
    if (!text) return;
    const tags = this.getTags(field);
    if (!tags.includes(text)) {
      tags.push(text);
      this.profileForm.get(field)!.setValue(tags.join(', '), { emitEvent: false });
    }
    if (input && input.tagName === 'INPUT') input.value = '';
  }

  removeTag(field: string, tag: string): void {
    const tags = this.getTags(field).filter(t => t !== tag);
    this.profileForm.get(field)!.setValue(tags.join(', '), { emitEvent: false });
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.memberService.getMyProfile().pipe(
      finalize(() => { this.isLoading.set(false); this.cdr.detectChanges(); })
    ).subscribe({
      next: (profile) => {
        this.populateForm(profile);
        this.populateSidebar(profile);
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
        this.error.set(this.translate.instant('editProfile.errors.load'));
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

  private populateForm(profile: ProfileDetailDto): void {
    const personal = profile.personalDetails as Record<string, unknown> | undefined;
    const career = profile.career as Record<string, unknown> | undefined;
    const contact = profile.contact as Record<string, unknown> | undefined;
    const family = profile.familyInfo as Record<string, unknown> | undefined;
    const partner = profile.partnerPreference as Record<string, unknown> | undefined;
    const horoscope = profile.horoscope as Record<string, unknown> | undefined;

    const nameParts = (profile.fullName ?? '').split(' ');
    const firstName = nameParts[0] ?? '';
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

    this.personal.patchValue({
      firstName,
      middleName,
      lastName,
      dobDay: this.num(personal?.['DobDay'] ?? personal?.['dobDay']),
      dobMonth: this.normalizeMonth((personal?.['DobMonth'] ?? personal?.['dobMonth']) as string),
      dobYear: this.num(personal?.['DobYear'] ?? personal?.['dobYear']),
      genderId: this.num(personal?.['GenderId'] ?? personal?.['genderId']),
      religionId: this.num(personal?.['ReligionId'] ?? personal?.['religionId']),
      maritalStatusId: this.num(personal?.['MaritalStatusId'] ?? personal?.['maritalStatusId']),
      heightFt: this.num(personal?.['HeightFt'] ?? personal?.['heightFt']) ?? 5,
      heightIn: this.num(personal?.['HeightIn'] ?? personal?.['heightIn']) ?? 4,
      weightKg: this.num(personal?.['WeightKg'] ?? personal?.['weightKg']) ?? 50,
      bloodGroupId: this.num(personal?.['BloodGroupId'] ?? personal?.['bloodGroupId']),
      complexionId: this.num(personal?.['ComplexionId'] ?? personal?.['complexionId']),
      physicalDisability: Boolean(personal?.['PhysicalDisability'] ?? personal?.['physicalDisability']),
      disabilityDetail: personal?.['DisabilityDetail'] ?? personal?.['disabilityDetail'] ?? '',
      dietId: this.num(personal?.['DietId'] ?? personal?.['dietId']),
      spectacles: Boolean(personal?.['Spectacles'] ?? personal?.['spectacles']),
      lens: Boolean(personal?.['Lens'] ?? personal?.['lens']),
      personalityId: this.num(personal?.['PersonalityId'] ?? personal?.['personalityId']),
    }, { emitEvent: false });

    const casteId = this.num(personal?.['CasteId'] ?? personal?.['casteId']);
    const subCasteId = this.num(personal?.['SubCasteId'] ?? personal?.['subCasteId']);
    const religionId = this.personal.get('religionId')?.value;

    if (religionId) {
      this.loadCastes(religionId, true);
      setTimeout(() => {
        this.personal.patchValue({ casteId }, { emitEvent: false });
        if (casteId) {
          this.loadSubCastes(casteId);
          setTimeout(() => {
            this.personal.patchValue({ subCasteId }, { emitEvent: false });
            this.cdr.detectChanges();
          }, 200);
        }
      }, 200);
    }

    const workingCountryId = this.num(career?.['WorkingCountryId'] ?? career?.['workingCountryId']);
    const workingStateId = this.num(career?.['WorkingStateId'] ?? career?.['workingStateId']);
    const workingCityValue = career?.['WorkingCity'] ?? career?.['workingCity'] ?? '';
    const workingStateOther = career?.['WorkingStateOther'] ?? career?.['workingStateOther'] ?? '';
    const workingCountryOther = career?.['WorkingCountryOther'] ?? career?.['workingCountryOther'] ?? '';

    this.career.patchValue({
      educationAreaId: this.num(career?.['EducationAreaId'] ?? career?.['educationAreaId']),
      educationId: this.num(career?.['EducationId'] ?? career?.['educationId']),
      occupationId: this.num(career?.['OccupationId'] ?? career?.['occupationId']),
      occupationDetails: career?.['OccupationDetails'] ?? career?.['occupationDetails'] ?? '',
      workingCity: workingCityValue,
      incomeAmount: this.num(career?.['IncomeAmount'] ?? career?.['incomeAmount']),
      incomePeriodId: this.num(career?.['IncomePeriodId'] ?? career?.['incomePeriodId']),
    }, { emitEvent: false });

    if (workingCountryId && workingCountryId !== 0) {
      this.career.patchValue({ workingCountryId }, { emitEvent: false });
    } else if (workingCountryOther) {
      this.career.patchValue({ workingCountryId: 0, workingCountryOther }, { emitEvent: false });
    }

    if (workingStateId && workingStateId !== 0) {
      this.career.patchValue({ workingStateId }, { emitEvent: false });
      this.masterData.getDistricts(workingStateId).subscribe((districts) => {
        this.workingDistricts = districts;
        if (workingCityValue && districts.some(d => d.name === workingCityValue)) {
          this.career.get('workingCity')!.setValue(workingCityValue, { emitEvent: false });
        }
        this.cdr.detectChanges();
      });
    } else if (workingStateOther) {
      this.career.patchValue({ workingStateId: 0, workingStateOther, workingCity: workingCityValue }, { emitEvent: false });
    }

    this.contact.patchValue({
      residenceAddress: contact?.['ResidenceAddress'] ?? contact?.['residenceAddress'] ?? '',
      contactEmail: contact?.['ContactEmail'] ?? contact?.['contactEmail'] ?? '',
      idProofNumber: contact?.['IdProofNumber'] ?? contact?.['idProofNumber'] ?? '',
    });

    const phoneNumbers = (profile as Record<string, unknown>)?.['phoneNumbers'] as Array<{ phoneType?: string; phoneNumber?: string }> | undefined;
    if (phoneNumbers) {
      const phoneMap: Record<string, string> = {};
      for (const p of phoneNumbers) {
        if (p.phoneType && p.phoneNumber) phoneMap[p.phoneType] = p.phoneNumber;
      }
      this.contact.patchValue({
        smsMobile: phoneMap['sms_mobile'] ?? '',
        mobile2: phoneMap['mobile_secondary'] ?? '',
        phone1: phoneMap['phone_primary'] ?? '',
        phone2: phoneMap['phone_secondary'] ?? '',
      });
    }

    const nativeDistrictId = this.num(family?.['NativeDistrictId'] ?? family?.['nativeDistrictId']);
    const nativeDistrictOther = family?.['NativeDistrictOther'] ?? family?.['nativeDistrictOther'] ?? '';
    const nativeTalukaId = this.num(family?.['NativeTalukaId'] ?? family?.['nativeTalukaId']);
    const nativeTalukaOther = family?.['NativeTalukaOther'] ?? family?.['nativeTalukaOther'] ?? '';

    this.family.patchValue({
      fatherStatus: Boolean(family?.['FatherStatus'] ?? family?.['fatherStatus']),
      motherStatus: Boolean(family?.['MotherStatus'] ?? family?.['motherStatus']),
      brothers: this.num(family?.['Brothers'] ?? family?.['brothers']) ?? 0,
      marriedBrothers: this.num(family?.['MarriedBrothers'] ?? family?.['marriedBrothers']) ?? 0,
      sisters: this.num(family?.['Sisters'] ?? family?.['sisters']) ?? 0,
      marriedSisters: this.num(family?.['MarriedSisters'] ?? family?.['marriedSisters']) ?? 0,
      parentsFullName: family?.['ParentsFullName'] ?? family?.['parentsFullName'] ?? '',
      parentsOccupation: family?.['ParentsOccupation'] ?? family?.['parentsOccupation'] ?? '',
      parentsResidentCity: family?.['ParentsResidentCity'] ?? family?.['parentsResidentCity'] ?? '',
      familyWealth: family?.['FamilyWealth'] ?? family?.['familyWealth'] ?? '',
      mamaSurnamePlace: family?.['MamaSurnamePlace'] ?? family?.['mamaSurnamePlace'] ?? '',
      intercastMarriage: Boolean(family?.['IntercastMarriage'] ?? family?.['intercastMarriage']),
      intercastRelation: family?.['IntercastRelation'] ?? family?.['intercastRelation'] ?? '',
    }, { emitEvent: false });

    if (nativeDistrictId && nativeDistrictId !== 0) {
      this.findNativeStateForDistrict(nativeDistrictId, this.num(nativeTalukaId), String(nativeTalukaOther ?? ''));
    } else if (nativeDistrictOther) {
      this.family.patchValue({ nativeStateId: 0, nativeDistrictOther }, { emitEvent: false });
    }

    this.partner.patchValue({
      expectedManglik: Boolean(partner?.['ExpectedManglik'] ?? partner?.['expectedManglik']),
      maxAgeDifference: this.num(partner?.['MaxAgeDifference'] ?? partner?.['maxAgeDifference']) ?? 0,
      expectedHeightFt: this.num(partner?.['ExpectedHeightFt'] ?? partner?.['expectedHeightFt']) ?? 5,
      expectedHeightIn: this.num(partner?.['ExpectedHeightIn'] ?? partner?.['expectedHeightIn']) ?? 0,
      divorcee: Boolean(partner?.['Divorcee'] ?? partner?.['divorcee']),
      expectedCasteNoBar: Boolean(partner?.['ExpectedCasteNoBar'] ?? partner?.['expectedCasteNoBar']),
      expectedEducationNoBar: Boolean(partner?.['ExpectedEducationNoBar'] ?? partner?.['expectedEducationNoBar']),
      expectedOccupationNoBar: Boolean(partner?.['ExpectedOccupationNoBar'] ?? partner?.['expectedOccupationNoBar']),
      expectedIncomeRangeId: this.num(partner?.['ExpectedIncomeRangeId'] ?? partner?.['expectedIncomeRangeId']),
      expectedCasteIds: this.toIntListString(profile.expectedCasteIds),
      expectedEducationIds: this.toIntListString(profile.expectedEducationIds),
      expectedOccupationIds: this.toIntListString(profile.expectedOccupationIds),
    }, { emitEvent: false });

    this.updateExpectedCasteOptions();
    this.updateExpectedEducationOptions();
    this.updateExpectedOccupationOptions();

    const expectedCasteRaw = profile.expectedCasteIds;
    if (expectedCasteRaw && expectedCasteRaw.length > 0) {
      const ids = Array.isArray(expectedCasteRaw)
        ? expectedCasteRaw
        : String(expectedCasteRaw).split(',').map((s: string) => Number(s.trim())).filter((n: number) => Number.isFinite(n) && n > 0);
      this.partner.get('expectedCasteIds')!.setValue(ids.join(','));
    }

    this.loadExpectedCastes(this.personal.get('religionId')?.value);

    const expectedEduRaw = profile.expectedEducationIds;
    if (expectedEduRaw && expectedEduRaw.length > 0) {
      const ids = Array.isArray(expectedEduRaw) ? expectedEduRaw : String(expectedEduRaw).split(',').map((s: string) => Number(s.trim())).filter((n: number) => Number.isFinite(n) && n > 0);
      this.partner.get('expectedEducationIds')!.setValue(ids.join(','));
    }

    const expectedOccRaw = profile.expectedOccupationIds;
    if (expectedOccRaw && expectedOccRaw.length > 0) {
      const ids = Array.isArray(expectedOccRaw) ? expectedOccRaw : String(expectedOccRaw).split(',').map((s: string) => Number(s.trim())).filter((n: number) => Number.isFinite(n) && n > 0);
      this.partner.get('expectedOccupationIds')!.setValue(ids.join(','));
    }

    this.profileForm.get('preferredCities')!.setValue(
      this.toStringList(profile.preferredCities), { emitEvent: false }
    );
    this.profileForm.get('interests')!.setValue(
      this.toStringList(profile.interests), { emitEvent: false }
    );
    this.profileForm.get('bio')!.setValue(profile.bio ?? '', { emitEvent: false });
    this.profileForm.get('locationText')!.setValue(profile.locationText ?? '', { emitEvent: false });

    const birthStateId = this.num(horoscope?.['BirthStateId'] ?? horoscope?.['birthStateId']);
    const birthStateOther = horoscope?.['BirthStateOther'] ?? horoscope?.['birthStateOther'] ?? '';
    const birthDistrictId = this.num(horoscope?.['BirthDistrictId'] ?? horoscope?.['birthDistrictId']);
    const birthDistrictOther = horoscope?.['BirthDistrictOther'] ?? horoscope?.['birthDistrictOther'] ?? '';

    this.horoscope.patchValue({
      manglik: Boolean(horoscope?.['Manglik'] ?? horoscope?.['manglik']),
      rashiId: this.num(horoscope?.['RashiId'] ?? horoscope?.['rashiId']),
      nakshatraId: this.num(horoscope?.['NakshatraId'] ?? horoscope?.['nakshatraId']),
      charanId: this.num(horoscope?.['CharanId'] ?? horoscope?.['charanId']),
      nadiId: this.num(horoscope?.['NadiId'] ?? horoscope?.['nadiId']),
      ganId: this.num(horoscope?.['GanId'] ?? horoscope?.['ganId']),
      birthHour: this.num(horoscope?.['BirthHour'] ?? horoscope?.['birthHour']) ?? 1,
      birthMinute: this.num(horoscope?.['BirthMinute'] ?? horoscope?.['birthMinute']) ?? 0,
      birthPeriod: horoscope?.['BirthPeriod'] ?? horoscope?.['birthPeriod'] ?? '',
      devak: horoscope?.['Devak'] ?? horoscope?.['devak'] ?? '',
    }, { emitEvent: false });

    if (birthStateId && birthStateId !== 0) {
      this.horoscope.patchValue({ birthStateId }, { emitEvent: false });
      this.masterData.getDistricts(birthStateId).subscribe((districts) => {
        this.birthDistricts = districts;
        if (birthDistrictId && birthDistrictId !== 0) {
          this.horoscope.patchValue({ birthDistrictId }, { emitEvent: false });
        }
        this.cdr.detectChanges();
      });
    } else if (birthStateOther) {
      this.horoscope.patchValue({ birthStateId: 0, birthStateOther, birthDistrictOther }, { emitEvent: false });
    }

    this.profileLoaded = true;
  }

  private findNativeStateForDistrict(districtId: number, talukaId: number | null, talukaOther: string): void {
    let found = false;
    let remaining = this.nativeStates.length;

    for (const state of this.nativeStates) {
      if (found) break;
      this.masterData.getDistricts(state.stateId).subscribe((districts) => {
        if (!found && districts.some(d => d.districtId === districtId)) {
          found = true;
          this.family.patchValue({ nativeStateId: state.stateId }, { emitEvent: false });
          this.nativeDistricts = districts;
          this.family.patchValue({ nativeDistrictId: districtId }, { emitEvent: false });
          if (talukaId && talukaId !== 0) {
            this.masterData.getTalukas(districtId).subscribe((talukas) => {
              this.nativeTalukas = talukas;
              this.family.patchValue({ nativeTalukaId: talukaId }, { emitEvent: false });
              this.cdr.detectChanges();
            });
          } else if (talukaOther) {
            this.family.patchValue({ nativeTalukaId: 0, nativeTalukaOther: talukaOther }, { emitEvent: false });
          }
          this.cdr.detectChanges();
        }
        remaining--;
      });
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    this.isSaving.set(true);
    this.error.set(null);
    this.validationErrors.set([]);
    this.successMessage.set(null);

    const formValue = this.profileForm.getRawValue();
    const hd = formValue.horoscope;
    const cd = formValue.careerDetails;
    const fd = formValue.familyDetails;

    const dto: CreateProfileDto = {
      fullName: [formValue.personalDetails.firstName, formValue.personalDetails.middleName, formValue.personalDetails.lastName]
        .filter(Boolean).join(' ') || undefined,
      age: this.computeAge(formValue.personalDetails),
      bio: formValue.bio || undefined,
      locationText: formValue.locationText || undefined,
      personalDetails: {
        firstName: formValue.personalDetails.firstName || undefined,
        middleName: formValue.personalDetails.middleName || undefined,
        lastName: formValue.personalDetails.lastName || undefined,
        dobDay: formValue.personalDetails.dobDay ?? undefined,
        dobMonth: formValue.personalDetails.dobMonth || undefined,
        dobYear: formValue.personalDetails.dobYear ?? undefined,
        genderId: formValue.personalDetails.genderId ?? undefined,
        religionId: formValue.personalDetails.religionId ?? undefined,
        casteId: formValue.personalDetails.casteId ?? undefined,
        subCasteId: formValue.personalDetails.subCasteId ?? undefined,
        maritalStatusId: formValue.personalDetails.maritalStatusId ?? undefined,
        heightFt: formValue.personalDetails.heightFt ?? undefined,
        heightIn: formValue.personalDetails.heightIn ?? undefined,
        weightKg: formValue.personalDetails.weightKg ?? undefined,
        bloodGroupId: formValue.personalDetails.bloodGroupId ?? undefined,
        complexionId: formValue.personalDetails.complexionId ?? undefined,
        physicalDisability: formValue.personalDetails.physicalDisability ?? false,
        disabilityDetail: formValue.personalDetails.disabilityDetail || undefined,
        dietId: formValue.personalDetails.dietId ?? undefined,
        spectacles: formValue.personalDetails.spectacles ?? false,
        lens: formValue.personalDetails.lens ?? false,
        personalityId: formValue.personalDetails.personalityId ?? undefined,
      },
      careerDetails: {
        educationAreaId: cd.educationAreaId ?? undefined,
        educationId: cd.educationId ?? undefined,
        occupationId: cd.occupationId ?? undefined,
        occupationDetails: cd.occupationDetails || undefined,
        workingCity: cd.workingCity === '__other__' ? (cd.workingCityOther || undefined) : (cd.workingCity || undefined),
        workingStateId: cd.workingStateId && cd.workingStateId !== 0 ? cd.workingStateId : undefined,
        workingStateOther: cd.workingStateId === 0 ? cd.workingStateOther || undefined : undefined,
        workingCountryId: cd.workingCountryId && cd.workingCountryId !== 0 ? cd.workingCountryId : undefined,
        workingCountryOther: cd.workingCountryId === 0 ? cd.workingCountryOther || undefined : undefined,
        incomeAmount: cd.incomeAmount ?? undefined,
        incomePeriodId: cd.incomePeriodId ?? undefined,
      },
      contactDetails: {
        residenceAddress: formValue.contactDetails.residenceAddress || undefined,
        contactEmail: formValue.contactDetails.contactEmail || undefined,
        idProofNumber: formValue.contactDetails.idProofNumber || undefined,
      },
      phoneNumbers: (() => {
        const phones: Array<{ phoneType: string; phoneNumber: string }> = [];
        if (formValue.contactDetails.smsMobile) phones.push({ phoneType: 'sms_mobile', phoneNumber: formValue.contactDetails.smsMobile });
        if (formValue.contactDetails.mobile2) phones.push({ phoneType: 'mobile_secondary', phoneNumber: formValue.contactDetails.mobile2 });
        if (formValue.contactDetails.phone1) phones.push({ phoneType: 'phone_primary', phoneNumber: formValue.contactDetails.phone1 });
        if (formValue.contactDetails.phone2) phones.push({ phoneType: 'phone_secondary', phoneNumber: formValue.contactDetails.phone2 });
        return phones.length > 0 ? phones : undefined;
      })(),
      familyDetails: {
        fatherStatus: fd.fatherStatus ?? false,
        motherStatus: fd.motherStatus ?? false,
        brothers: fd.brothers ?? undefined,
        marriedBrothers: fd.marriedBrothers ?? undefined,
        sisters: fd.sisters ?? undefined,
        marriedSisters: fd.marriedSisters ?? undefined,
        parentsFullName: fd.parentsFullName || undefined,
        parentsOccupation: fd.parentsOccupation || undefined,
        parentsResidentCity: fd.parentsResidentCity || undefined,
        familyWealth: fd.familyWealth || undefined,
        mamaSurnamePlace: fd.mamaSurnamePlace || undefined,
        nativeDistrictId: fd.nativeDistrictId && fd.nativeDistrictId !== 0 ? fd.nativeDistrictId : undefined,
        nativeDistrictOther: fd.nativeDistrictId === 0 ? fd.nativeDistrictOther || undefined : undefined,
        nativeTalukaId: fd.nativeTalukaId && fd.nativeTalukaId !== 0 ? fd.nativeTalukaId : undefined,
        nativeTalukaOther: fd.nativeTalukaId === 0 ? fd.nativeTalukaOther || undefined : undefined,
        intercastMarriage: fd.intercastMarriage ?? false,
        intercastRelation: fd.intercastRelation || undefined,
      },
      partnerPreference: {
        expectedManglik: formValue.partnerPreference.expectedManglik ?? false,
        maxAgeDifference: formValue.partnerPreference.maxAgeDifference ?? undefined,
        expectedHeightFt: formValue.partnerPreference.expectedHeightFt ?? undefined,
        expectedHeightIn: formValue.partnerPreference.expectedHeightIn ?? undefined,
        divorcee: formValue.partnerPreference.divorcee ?? false,
        expectedCasteNoBar: formValue.partnerPreference.expectedCasteNoBar ?? false,
        expectedEducationNoBar: formValue.partnerPreference.expectedEducationNoBar ?? false,
        expectedOccupationNoBar: formValue.partnerPreference.expectedOccupationNoBar ?? false,
        expectedIncomeRangeId: formValue.partnerPreference.expectedIncomeRangeId ?? undefined,
      },
      preferredCities: formValue.preferredCities
        ? String(formValue.preferredCities).split(/[,\n]/).map((s: string) => s.trim()).filter(Boolean)
        : undefined,
      interests: formValue.interests
        ? String(formValue.interests).split(/[,\n]/).map((s: string) => s.trim()).filter(Boolean)
        : undefined,
      expectedCasteIds: formValue.partnerPreference.expectedCasteIds
        ? String(formValue.partnerPreference.expectedCasteIds).split(',').map((s: string) => Number(s.trim())).filter((n: number) => Number.isFinite(n) && n > 0)
        : undefined,
      expectedEducationIds: formValue.partnerPreference.expectedEducationIds
        ? String(formValue.partnerPreference.expectedEducationIds).split(',').map((s: string) => Number(s.trim())).filter((n: number) => Number.isFinite(n) && n > 0)
        : undefined,
      expectedOccupationIds: formValue.partnerPreference.expectedOccupationIds
        ? String(formValue.partnerPreference.expectedOccupationIds).split(',').map((s: string) => Number(s.trim())).filter((n: number) => Number.isFinite(n) && n > 0)
        : undefined,
      profileHoroscope: {
        manglik: hd.manglik ?? false,
        rashiId: hd.rashiId ?? undefined,
        nakshatraId: hd.nakshatraId ?? undefined,
        charanId: hd.charanId ?? undefined,
        nadiId: hd.nadiId ?? undefined,
        ganId: hd.ganId ?? undefined,
        birthHour: hd.birthHour ?? undefined,
        birthMinute: hd.birthMinute ?? undefined,
        birthPeriod: hd.birthPeriod || undefined,
        devak: hd.devak || undefined,
        birthStateId: hd.birthStateId && hd.birthStateId !== 0 ? hd.birthStateId : undefined,
        birthStateOther: hd.birthStateOther || undefined,
        birthDistrictId: hd.birthDistrictId && hd.birthDistrictId !== 0 ? hd.birthDistrictId : undefined,
        birthDistrictOther: hd.birthDistrictOther || undefined,
      },
    };

    this.memberService.updateMyProfile(dto).pipe(
      finalize(() => { this.isSaving.set(false); this.cdr.detectChanges(); })
    ).subscribe({
      next: () => {
        this.successMessage.set(this.translate.instant('editProfile.success'));
        setTimeout(() => this.router.navigate(['/my-profile']), 1200);
      },
      error: (err) => {
        console.error('Update profile error:', err);
        if (err.status === 400 && err.error?.errors) {
          const fieldErrors: Record<string, string[]> = err.error.errors;
          const messages: string[] = [];
          for (const [field, msgs] of Object.entries(fieldErrors)) {
            const label = field.replace(/^[^.]+\./, '').replace(/([A-Z])/g, ' $1').trim();
            for (const msg of msgs) {
              messages.push(`${label}: ${msg}`);
            }
          }
          this.validationErrors.set(messages);
        } else {
          this.error.set(this.translate.instant('editProfile.errors.update'));
        }
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

  private num(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private normalizeMonth(raw: string | null | undefined): string {
    if (!raw) return '';
    const lower = raw.trim().toLowerCase();
    if (/^[a-z]{3}$/.test(lower)) return raw.trim().slice(0, 3);
    const n = Number(lower);
    if (Number.isFinite(n) && n >= 1 && n <= 12) {
      return this.months[n - 1];
    }
    const fullMap: Record<string, string> = {
      january: 'Jan', february: 'Feb', march: 'Mar', april: 'Apr',
      may: 'May', june: 'Jun', july: 'Jul', august: 'Aug',
      september: 'Sep', october: 'Oct', november: 'Nov', december: 'Dec',
    };
    return fullMap[lower] ?? '';
  }

  private toStringList(value: unknown): string {
    if (Array.isArray(value)) return value.filter(Boolean).join(', ');
    if (typeof value === 'string') return value;
    return '';
  }

  private toIntListString(value: unknown): string {
    if (Array.isArray(value)) return value.filter((n: unknown) => Number.isFinite(Number(n)) && Number(n) > 0).join(',');
    if (typeof value === 'string' && value.trim()) return value.trim();
    return '';
  }

  private computeAge(details: { dobYear?: number | null; dobDay?: number | null; dobMonth?: string | null }): number | undefined {
    const birthYear = Number(details.dobYear);
    if (!Number.isFinite(birthYear) || birthYear <= 0) return undefined;
    return new Date().getFullYear() - birthYear;
  }
}
