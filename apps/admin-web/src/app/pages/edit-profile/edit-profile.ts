import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProfileClient, MasterDataClient, MasterDataOptionDto, ProfileDetailDto, CreateProfileDto } from '@org/generated';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { switchMap, finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface OptionList {
  genders: MasterDataOptionDto[];
  religions: MasterDataOptionDto[];
  maritalStatuses: MasterDataOptionDto[];
  educationAreas: MasterDataOptionDto[];
  educations: MasterDataOptionDto[];
  occupations: MasterDataOptionDto[];
  incomePeriods: MasterDataOptionDto[];
  bloodGroups: MasterDataOptionDto[];
  complexions: MasterDataOptionDto[];
  diets: MasterDataOptionDto[];
  personalities: MasterDataOptionDto[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  template: `
    <div class="edit-page">
      <div class="edit-header">
        <a routerLink="/profiles" class="back-link">
          <mat-icon>arrow_back</mat-icon>
          <span>Back to Profiles</span>
        </a>
        <h1>Edit Profile {{ headerText() }}</h1>
      </div>

      @if (loading()) {
        <div class="loading-state">Loading profile...</div>
      } @else {
        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="edit-form">
          <section class="form-section">
            <h3>Basic</h3>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="fullName" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Bio</mat-label>
                <textarea matInput formControlName="bio" rows="2"></textarea>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Location Text</mat-label>
                <input matInput formControlName="locationText" />
              </mat-form-field>
            </div>
          </section>

          <section class="form-section">
            <h3>Personal Details</h3>
            <div class="form-grid" formGroupName="personalDetails">
              <mat-form-field appearance="outline">
                <mat-label>Birth Day</mat-label>
                <input matInput type="number" min="1" max="31" formControlName="dobDay" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Birth Month</mat-label>
                <mat-select formControlName="dobMonth">
                  @for (m of months; track m) {
                    <mat-option [value]="m">{{ m }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Birth Year</mat-label>
                <input matInput type="number" min="1930" max="2026" formControlName="dobYear" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Gender</mat-label>
                <mat-select formControlName="genderId">
                  @for (o of options().genders; track o.id) {
                    <mat-option [value]="o.id">{{ o.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Religion</mat-label>
                <mat-select formControlName="religionId" (selectionChange)="onReligionChange()">
                  @for (o of options().religions; track o.id) {
                    <mat-option [value]="o.id">{{ o.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Caste</mat-label>
                <mat-select formControlName="casteId" (selectionChange)="onCasteChange()">
                  <mat-option [value]="null">None</mat-option>
                  @for (o of castes(); track o.id) {
                    <mat-option [value]="o.id">{{ o.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Sub Caste</mat-label>
                <mat-select formControlName="subCasteId">
                  <mat-option [value]="null">None</mat-option>
                  @for (o of subCastes(); track o.id) {
                    <mat-option [value]="o.id">{{ o.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Marital Status</mat-label>
                <mat-select formControlName="maritalStatusId">
                  @for (o of options().maritalStatuses; track o.id) {
                    <mat-option [value]="o.id">{{ o.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Height (ft)</mat-label>
                <input matInput type="number" min="3" max="7" formControlName="heightFt" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Height (in)</mat-label>
                <input matInput type="number" min="0" max="11" formControlName="heightIn" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Weight (kg)</mat-label>
                <input matInput type="number" formControlName="weightKg" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Blood Group</mat-label>
                <mat-select formControlName="bloodGroupId">
                  <mat-option [value]="null">None</mat-option>
                  @for (o of options().bloodGroups; track o.id) {
                    <mat-option [value]="o.id">{{ o.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Complexion</mat-label>
                <mat-select formControlName="complexionId">
                  <mat-option [value]="null">None</mat-option>
                  @for (o of options().complexions; track o.id) {
                    <mat-option [value]="o.id">{{ o.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Diet</mat-label>
                <mat-select formControlName="dietId">
                  <mat-option [value]="null">None</mat-option>
                  @for (o of options().diets; track o.id) {
                    <mat-option [value]="o.id">{{ o.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Personality</mat-label>
                <mat-select formControlName="personalityId">
                  <mat-option [value]="null">None</mat-option>
                  @for (o of options().personalities; track o.id) {
                    <mat-option [value]="o.id">{{ o.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          </section>

          <section class="form-section">
            <h3>Career & Education</h3>
            <div class="form-grid" formGroupName="careerDetails">
              <mat-form-field appearance="outline">
                <mat-label>Education Area</mat-label>
                <mat-select formControlName="educationAreaId">
                  <mat-option [value]="null">None</mat-option>
                  @for (o of options().educationAreas; track o.id) {
                    <mat-option [value]="o.id">{{ o.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Education</mat-label>
                <mat-select formControlName="educationId">
                  <mat-option [value]="null">None</mat-option>
                  @for (o of options().educations; track o.id) {
                    <mat-option [value]="o.id">{{ o.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Occupation</mat-label>
                <mat-select formControlName="occupationId">
                  <mat-option [value]="null">None</mat-option>
                  @for (o of options().occupations; track o.id) {
                    <mat-option [value]="o.id">{{ o.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Occupation Details</mat-label>
                <input matInput formControlName="occupationDetails" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Working City</mat-label>
                <input matInput formControlName="workingCity" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Income Amount</mat-label>
                <input matInput type="number" formControlName="incomeAmount" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Income Period</mat-label>
                <mat-select formControlName="incomePeriodId">
                  <mat-option [value]="null">None</mat-option>
                  @for (o of options().incomePeriods; track o.id) {
                    <mat-option [value]="o.id">{{ o.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          </section>

          <section class="form-section">
            <h3>Contact</h3>
            <div class="form-grid" formGroupName="contactDetails">
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="contactEmail" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Residence Address</mat-label>
                <textarea matInput formControlName="residenceAddress" rows="2"></textarea>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>SMS Mobile</mat-label>
                <input matInput formControlName="smsMobile" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Mobile (Secondary)</mat-label>
                <input matInput formControlName="mobile2" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Phone (Primary)</mat-label>
                <input matInput formControlName="phone1" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Phone (Secondary)</mat-label>
                <input matInput formControlName="phone2" />
              </mat-form-field>
            </div>
          </section>

          <section class="form-section">
            <h3>Family Background</h3>
            <div class="form-grid" formGroupName="familyDetails">
              <mat-form-field appearance="outline">
                <mat-label>Parents Full Name</mat-label>
                <input matInput formControlName="parentsFullName" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Parents Occupation</mat-label>
                <input matInput formControlName="parentsOccupation" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Parents Resident City</mat-label>
                <input matInput formControlName="parentsResidentCity" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Family Wealth</mat-label>
                <input matInput formControlName="familyWealth" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Mama Surname/Place</mat-label>
                <input matInput formControlName="mamaSurnamePlace" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Brothers</mat-label>
                <input matInput type="number" min="0" formControlName="brothers" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Married Brothers</mat-label>
                <input matInput type="number" min="0" formControlName="marriedBrothers" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Sisters</mat-label>
                <input matInput type="number" min="0" formControlName="sisters" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Married Sisters</mat-label>
                <input matInput type="number" min="0" formControlName="marriedSisters" />
              </mat-form-field>
            </div>
          </section>

          <section class="form-section">
            <h3>Partner Preferences</h3>
            <div class="form-grid" formGroupName="partnerPreference">
              <mat-checkbox formControlName="expectedManglik">Expected Manglik</mat-checkbox>
              <mat-checkbox formControlName="divorcee">Divorcee OK</mat-checkbox>
              <mat-checkbox formControlName="expectedCasteNoBar">Caste No Bar</mat-checkbox>
              <mat-checkbox formControlName="expectedEducationNoBar">Education No Bar</mat-checkbox>
              <mat-checkbox formControlName="expectedOccupationNoBar">Occupation No Bar</mat-checkbox>
              <mat-form-field appearance="outline">
                <mat-label>Max Age Difference</mat-label>
                <input matInput type="number" min="0" formControlName="maxAgeDifference" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Expected Height (ft)</mat-label>
                <input matInput type="number" min="3" max="7" formControlName="expectedHeightFt" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Expected Height (in)</mat-label>
                <input matInput type="number" min="0" max="11" formControlName="expectedHeightIn" />
              </mat-form-field>
            </div>
          </section>

          <section class="form-section">
            <h3>Tags</h3>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Preferred Cities (comma separated)</mat-label>
                <input matInput formControlName="preferredCities" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Interests (comma separated)</mat-label>
                <input matInput formControlName="interests" />
              </mat-form-field>
            </div>
          </section>

          @if (error()) {
            <div class="form-error">{{ error() }}</div>
          }
          @if (validationErrors().length) {
            <div class="form-error">
              @for (msg of validationErrors(); track msg) {
                <div>{{ msg }}</div>
              }
            </div>
          }
          @if (success()) {
            <div class="form-success">{{ success() }}</div>
          }

          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="saving()">
              {{ saving() ? 'Saving...' : 'Save Profile' }}
            </button>
            <a mat-stroked-button routerLink="/profiles">Cancel</a>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .edit-page { max-width: 1000px; margin: 0 auto; padding: 1.5rem; }
    .edit-header { margin-bottom: 1.5rem; }
    .edit-header h1 { font-size: 1.5rem; color: #2c003e; margin: 0.5rem 0 0; }
    .back-link { display: inline-flex; align-items: center; gap: 4px; color: #7b1fa2; text-decoration: none; font-size: 0.875rem; font-weight: 500; }
    .back-link:hover { text-decoration: underline; }
    .loading-state { padding: 3rem; text-align: center; color: #888; }

    .form-section {
      background: #fafafa; border: 1px solid #e8e0f0; border-radius: 8px;
      padding: 16px; margin-bottom: 16px;
    }
    .form-section h3 {
      margin: 0 0 14px; font-size: 13px; font-weight: 600; color: #5c3d7a;
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .form-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 12px; align-items: start;
    }
    .form-grid mat-checkbox { align-self: center; }

    .form-error {
      background: #fdecea; color: #b3261e; border: 1px solid #f5c2c0;
      border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; font-size: 13px;
    }
    .form-success {
      background: #e8f5e9; color: #2e7d32; border: 1px solid #b7dfb9;
      border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; font-size: 13px;
    }
    .form-actions { display: flex; gap: 10px; }
  `],
})
export class EditProfile implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly profileClient = inject(ProfileClient);
  private readonly masterData = inject(MasterDataClient);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly validationErrors = signal<string[]>([]);
  readonly success = signal<string | null>(null);
  readonly profile = signal<ProfileDetailDto | null>(null);
  readonly options = signal<OptionList>({
    genders: [],
    religions: [],
    maritalStatuses: [],
    educationAreas: [],
    educations: [],
    occupations: [],
    incomePeriods: [],
    bloodGroups: [],
    complexions: [],
    diets: [],
    personalities: [],
  });
  readonly castes = signal<MasterDataOptionDto[]>([]);
  readonly subCastes = signal<MasterDataOptionDto[]>([]);

  readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  readonly headerText = computed(() => {
    const p = this.profile();
    if (!p) return '';
    return p.profileCode ? `(${p.profileCode})` : '';
  });

  profileForm = new FormGroup({
    fullName: new FormControl<string>(''),
    bio: new FormControl<string>(''),
    locationText: new FormControl<string>(''),
    preferredCities: new FormControl<string>(''),
    interests: new FormControl<string>(''),
    personalDetails: new FormGroup({
      dobDay: new FormControl<number | null>(null),
      dobMonth: new FormControl<string>(''),
      dobYear: new FormControl<number | null>(null),
      genderId: new FormControl<number | null>(null),
      religionId: new FormControl<number | null>(null),
      casteId: new FormControl<number | null>(null),
      subCasteId: new FormControl<number | null>(null),
      maritalStatusId: new FormControl<number | null>(null),
      heightFt: new FormControl<number | null>(null),
      heightIn: new FormControl<number | null>(null),
      weightKg: new FormControl<number | null>(null),
      bloodGroupId: new FormControl<number | null>(null),
      complexionId: new FormControl<number | null>(null),
      dietId: new FormControl<number | null>(null),
      personalityId: new FormControl<number | null>(null),
    }),
    careerDetails: new FormGroup({
      educationAreaId: new FormControl<number | null>(null),
      educationId: new FormControl<number | null>(null),
      occupationId: new FormControl<number | null>(null),
      occupationDetails: new FormControl<string>(''),
      workingCity: new FormControl<string>(''),
      incomeAmount: new FormControl<number | null>(null),
      incomePeriodId: new FormControl<number | null>(null),
    }),
    contactDetails: new FormGroup({
      contactEmail: new FormControl<string>(''),
      residenceAddress: new FormControl<string>(''),
      smsMobile: new FormControl<string>(''),
      mobile2: new FormControl<string>(''),
      phone1: new FormControl<string>(''),
      phone2: new FormControl<string>(''),
    }),
    familyDetails: new FormGroup({
      parentsFullName: new FormControl<string>(''),
      parentsOccupation: new FormControl<string>(''),
      parentsResidentCity: new FormControl<string>(''),
      familyWealth: new FormControl<string>(''),
      mamaSurnamePlace: new FormControl<string>(''),
      brothers: new FormControl<number | null>(null),
      marriedBrothers: new FormControl<number | null>(null),
      sisters: new FormControl<number | null>(null),
      marriedSisters: new FormControl<number | null>(null),
    }),
    partnerPreference: new FormGroup({
      expectedManglik: new FormControl<boolean>(false),
      divorcee: new FormControl<boolean>(false),
      expectedCasteNoBar: new FormControl<boolean>(false),
      expectedEducationNoBar: new FormControl<boolean>(false),
      expectedOccupationNoBar: new FormControl<boolean>(false),
      maxAgeDifference: new FormControl<number | null>(null),
      expectedHeightFt: new FormControl<number | null>(null),
      expectedHeightIn: new FormControl<number | null>(null),
    }),
  });

  ngOnInit(): void {
    this.loadLookups();
    this.route.paramMap.pipe(
      switchMap((params) => {
        const id = Number(params.get('id'));
        return this.profileClient.getById(id);
      }),
    ).subscribe({
      next: (detail) => {
        this.profile.set(detail);
        this.populateForm(detail);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onReligionChange(): void {
    this.castes.set([]);
    this.subCastes.set([]);
    this.personal.patchValue({ casteId: null, subCasteId: null }, { emitEvent: false });
    const religionId = this.personal.get('religionId')?.value;
    if (religionId) {
      this.masterData.getCastes(religionId).subscribe((c) => this.castes.set(c));
    }
  }

  onCasteChange(): void {
    this.subCastes.set([]);
    this.personal.patchValue({ subCasteId: null }, { emitEvent: false });
    const casteId = this.personal.get('casteId')?.value;
    if (casteId) {
      this.masterData.getSubCastes(casteId).subscribe((s) => this.subCastes.set(s));
    }
  }

  private loadLookups(): void {
    const g = this.masterData.getGenders();
    const r = this.masterData.getReligions();
    const m = this.masterData.getMaritalStatuses();
    const ea = this.masterData.getEducationAreas();
    const e = this.masterData.getEducations();
    const o = this.masterData.getOccupations();
    const ip = this.masterData.getIncomePeriods();
    const bg = this.masterData.getBloodGroups();
    const cx = this.masterData.getComplexions();
    const d = this.masterData.getDiets();
    const p = this.masterData.getPersonalities();

    const merge = (key: keyof OptionList, obs: Observable<MasterDataOptionDto[]>) =>
      obs.subscribe((list) => this.options.update((cur) => ({ ...cur, [key]: list })));

    merge('genders', g);
    merge('religions', r);
    merge('maritalStatuses', m);
    merge('educationAreas', ea);
    merge('educations', e);
    merge('occupations', o);
    merge('incomePeriods', ip);
    merge('bloodGroups', bg);
    merge('complexions', cx);
    merge('diets', d);
    merge('personalities', p);
  }

  private populateForm(p: ProfileDetailDto): void {
    const personal = p.personalDetails;
    const career = p.career;
    const contact = p.contact;
    const family = p.familyInfo;
    const partner = p.partnerPreference;

    this.profileForm.patchValue({
      fullName: p.fullName ?? '',
      bio: p.bio ?? '',
      locationText: p.locationText ?? '',
      preferredCities: (p.preferredCities ?? []).join(', '),
      interests: (p.interests ?? []).join(', '),
      personalDetails: {
        dobDay: personal?.dobDay ?? null,
        dobMonth: personal?.dobMonth ?? '',
        dobYear: personal?.dobYear ?? null,
        genderId: personal?.genderId ?? null,
        religionId: personal?.religionId ?? null,
        casteId: personal?.casteId ?? null,
        subCasteId: personal?.subCasteId ?? null,
        maritalStatusId: personal?.maritalStatusId ?? null,
        heightFt: personal?.heightFt ?? null,
        heightIn: personal?.heightIn ?? null,
        weightKg: personal?.weightKg ?? null,
        bloodGroupId: personal?.bloodGroupId ?? null,
        complexionId: personal?.complexionId ?? null,
        dietId: personal?.dietId ?? null,
        personalityId: personal?.personalityId ?? null,
      },
      careerDetails: {
        educationAreaId: career?.educationAreaId ?? null,
        educationId: career?.educationId ?? null,
        occupationId: career?.occupationId ?? null,
        occupationDetails: career?.occupationDetails ?? '',
        workingCity: career?.workingCity ?? '',
        incomeAmount: career?.incomeAmount ?? null,
        incomePeriodId: career?.incomePeriodId ?? null,
      },
      contactDetails: {
        contactEmail: contact?.contactEmail ?? '',
        residenceAddress: contact?.residenceAddress ?? '',
        smsMobile: this.getPhone('sms_mobile'),
        mobile2: this.getPhone('mobile_secondary'),
        phone1: this.getPhone('phone_primary'),
        phone2: this.getPhone('phone_secondary'),
      },
      familyDetails: {
        parentsFullName: family?.parentsFullName ?? '',
        parentsOccupation: family?.parentsOccupation ?? '',
        parentsResidentCity: family?.parentsResidentCity ?? '',
        familyWealth: family?.familyWealth ?? '',
        mamaSurnamePlace: family?.mamaSurnamePlace ?? '',
        brothers: family?.brothers ?? null,
        marriedBrothers: family?.marriedBrothers ?? null,
        sisters: family?.sisters ?? null,
        marriedSisters: family?.marriedSisters ?? null,
      },
      partnerPreference: {
        expectedManglik: partner?.expectedManglik ?? false,
        divorcee: partner?.divorcee ?? false,
        expectedCasteNoBar: partner?.expectedCasteNoBar ?? false,
        expectedEducationNoBar: partner?.expectedEducationNoBar ?? false,
        expectedOccupationNoBar: partner?.expectedOccupationNoBar ?? false,
        maxAgeDifference: partner?.maxAgeDifference ?? null,
        expectedHeightFt: partner?.expectedHeightFt ?? null,
        expectedHeightIn: partner?.expectedHeightIn ?? null,
      },
    });

    const religionId = personal?.religionId;
    const casteId = personal?.casteId;
    if (religionId) {
      this.masterData.getCastes(religionId).subscribe((c) => {
        this.castes.set(c);
        if (casteId) {
          this.masterData.getSubCastes(casteId).subscribe((s) => this.subCastes.set(s));
        }
      });
    }
  }

  private getPhone(phoneType: string): string {
    const p = this.profile();
    return p?.phoneNumbers?.find((n) => n.phoneType === phoneType)?.phoneNumber ?? '';
  }

  get personal() { return this.profileForm.get('personalDetails') as FormGroup; }

  onSubmit(): void {
    if (this.saving()) return;
    this.error.set(null);
    this.validationErrors.set([]);
    this.success.set(null);

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) return;

    const v = this.profileForm.getRawValue();
    const p = v.personalDetails;
    const c = v.careerDetails;
    const co = v.contactDetails;
    const f = v.familyDetails;
    const pr = v.partnerPreference;

    const dto: CreateProfileDto = {
      fullName: v.fullName || undefined,
      bio: v.bio || undefined,
      locationText: v.locationText || undefined,
      personalDetails: {
        dobDay: p.dobDay ?? undefined,
        dobMonth: p.dobMonth || undefined,
        dobYear: p.dobYear ?? undefined,
        genderId: p.genderId ?? undefined,
        religionId: p.religionId ?? undefined,
        casteId: p.casteId ?? undefined,
        subCasteId: p.subCasteId ?? undefined,
        maritalStatusId: p.maritalStatusId ?? undefined,
        heightFt: p.heightFt ?? undefined,
        heightIn: p.heightIn ?? undefined,
        weightKg: p.weightKg ?? undefined,
        bloodGroupId: p.bloodGroupId ?? undefined,
        complexionId: p.complexionId ?? undefined,
        dietId: p.dietId ?? undefined,
        personalityId: p.personalityId ?? undefined,
      },
      careerDetails: {
        educationAreaId: c.educationAreaId ?? undefined,
        educationId: c.educationId ?? undefined,
        occupationId: c.occupationId ?? undefined,
        occupationDetails: c.occupationDetails || undefined,
        workingCity: c.workingCity || undefined,
        incomeAmount: c.incomeAmount ?? undefined,
        incomePeriodId: c.incomePeriodId ?? undefined,
      },
      contactDetails: {
        contactEmail: co.contactEmail || undefined,
        residenceAddress: co.residenceAddress || undefined,
      },
      phoneNumbers: (() => {
        const phones: Array<{ phoneType: string; phoneNumber: string }> = [];
        if (co.smsMobile) phones.push({ phoneType: 'sms_mobile', phoneNumber: co.smsMobile });
        if (co.mobile2) phones.push({ phoneType: 'mobile_secondary', phoneNumber: co.mobile2 });
        if (co.phone1) phones.push({ phoneType: 'phone_primary', phoneNumber: co.phone1 });
        if (co.phone2) phones.push({ phoneType: 'phone_secondary', phoneNumber: co.phone2 });
        return phones.length > 0 ? phones : undefined;
      })(),
      familyDetails: {
        parentsFullName: f.parentsFullName || undefined,
        parentsOccupation: f.parentsOccupation || undefined,
        parentsResidentCity: f.parentsResidentCity || undefined,
        familyWealth: f.familyWealth || undefined,
        mamaSurnamePlace: f.mamaSurnamePlace || undefined,
        brothers: f.brothers ?? undefined,
        marriedBrothers: f.marriedBrothers ?? undefined,
        sisters: f.sisters ?? undefined,
        marriedSisters: f.marriedSisters ?? undefined,
      },
      partnerPreference: {
        expectedManglik: pr.expectedManglik ?? false,
        divorcee: pr.divorcee ?? false,
        expectedCasteNoBar: pr.expectedCasteNoBar ?? false,
        expectedEducationNoBar: pr.expectedEducationNoBar ?? false,
        expectedOccupationNoBar: pr.expectedOccupationNoBar ?? false,
        maxAgeDifference: pr.maxAgeDifference ?? undefined,
        expectedHeightFt: pr.expectedHeightFt ?? undefined,
        expectedHeightIn: pr.expectedHeightIn ?? undefined,
      },
      preferredCities: v.preferredCities
        ? v.preferredCities.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined,
      interests: v.interests
        ? v.interests.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined,
    };

    this.saving.set(true);
    this.profileClient.update(id, dto).pipe(
      finalize(() => this.saving.set(false)),
    ).subscribe({
      next: () => {
        this.success.set('Profile updated successfully.');
        this.profileClient.getById(id).subscribe((d) => {
          this.profile.set(d);
          this.populateForm(d);
        });
      },
      error: (err) => {
        if (err.status === 400 && err.error?.errors) {
          const messages: string[] = [];
          for (const [field, msgs] of Object.entries(err.error.errors as Record<string, string[]>)) {
            for (const msg of msgs) {
              messages.push(`${field.replace(/^[^.]+\./, '')}: ${msg}`);
            }
          }
          this.validationErrors.set(messages);
        } else {
          this.error.set('Failed to update profile. Please try again.');
        }
      },
    });
  }
}
