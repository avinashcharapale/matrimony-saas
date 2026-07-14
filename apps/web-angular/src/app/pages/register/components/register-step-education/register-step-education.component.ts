import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Subscription, forkJoin } from 'rxjs';
import {
  RegisterMasterDataService,
  RegisterLookupOption,
  RegisterStateOption,
  RegisterDistrictOption,
  RegisterCountryOption,
} from '../../../../services/register-master-data.service';

@Component({
  selector: 'app-register-step-education',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register-step-education.component.html',
  styleUrl: '../../register.css',
})
export class RegisterStepEducationComponent implements OnInit, OnDestroy {
  @Input({ required: true }) form!: FormGroup;

  private readonly masterData = inject(RegisterMasterDataService);
  private readonly cdr = inject(ChangeDetectorRef);
  private subs: Subscription[] = [];

  educationOptions: RegisterLookupOption[] = [];
  educationAreaOptions: RegisterLookupOption[] = [];
  occupationTypeOptions: RegisterLookupOption[] = [];
  incomePeriodOptions: RegisterLookupOption[] = [];
  workingStates: RegisterStateOption[] = [];
  workingDistricts: RegisterDistrictOption[] = [];
  workingStateId: number | null = null;
  isWorkingStateOther = false;
  isWorkingCountryOther = false;
  isWorkingCityOther = false;
  countryOptions: RegisterCountryOption[] = [];

  get career(): FormGroup { return this.form.get('careerDetails') as FormGroup; }

  ngOnInit(): void {
    this.subs.push(
      this.career.get('workingStateId')!.valueChanges.subscribe((value) => {
        const stateId = Number(value);
        this.isWorkingStateOther = stateId === 0;
        if (!stateId || stateId === 0) {
          this.workingStateId = null;
          this.career.get('workingStateOther')!.setValue('', { emitEvent: false });
          this.workingDistricts = [];
          this.career.get('workingCity')!.setValue('', { emitEvent: false });
        } else {
          this.workingStateId = stateId;
          this.career.get('workingStateOther')!.setValue('', { emitEvent: false });
          this.workingDistricts = [];
          this.career.get('workingCity')!.setValue('', { emitEvent: false });
          this.masterData.getDistricts(stateId).subscribe((districts) => {
            this.workingDistricts = districts;
            this.cdr.detectChanges();
          });
        }
      })
    );

    this.subs.push(
      this.career.get('workingCountryId')!.valueChanges.subscribe((value) => {
        this.isWorkingCountryOther = Number(value) === 0;
        this.career.get('workingCountryOther')!.setValue('', { emitEvent: false });
      })
    );

    this.subs.push(
      this.career.get('workingCity')!.valueChanges.subscribe((value) => {
        this.isWorkingCityOther = value === '__other__';
        if (value && value !== '__other__') {
          this.career.get('workingCityOther')?.setValue('', { emitEvent: false });
        }
      })
    );

    this.syncFlagsFromForm();

    forkJoin({
      educations: this.masterData.getEducations(),
      educationAreas: this.masterData.getEducationAreas(),
      occupations: this.masterData.getOccupations(),
      incomePeriods: this.masterData.getIncomePeriods(),
      states: this.masterData.getStates(),
      countries: this.masterData.getCountries(),
    }).subscribe({
      next: (r) => {
        this.educationOptions = r.educations;
        this.educationAreaOptions = r.educationAreas;
        this.occupationTypeOptions = r.occupations;
        this.incomePeriodOptions = r.incomePeriods;
        this.workingStates = r.states;
        this.countryOptions = r.countries;
        this.restoreWorkingStateFromDraft();
      },
      complete: () => this.cdr.detectChanges(),
      error: () => this.cdr.detectChanges(),
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private syncFlagsFromForm(): void {
    this.isWorkingCountryOther = Number(this.career.get('workingCountryId')?.value) === 0;
    const stateId = Number(this.career.get('workingStateId')?.value);
    this.isWorkingStateOther = stateId === 0;
    this.isWorkingCityOther = this.career.get('workingCity')?.value === '__other__';
  }

  private restoreWorkingStateFromDraft(): void {
    const savedStateId = this.career.get('workingStateId')?.value;

    if (savedStateId && savedStateId !== 0) {
      this.workingStateId = savedStateId;
      this.masterData.getDistricts(savedStateId).subscribe((districts) => {
        this.workingDistricts = districts;
        this.cdr.detectChanges();
      });
      return;
    }

    if (savedStateId === 0) {
      return;
    }

    const saved = (this.career.get('workingCity')?.value ?? '').toString().trim().toUpperCase();
    if (!saved) return;
    this.findDistrictState(saved, 0);
  }

  private findDistrictState(token: string, index: number): void {
    if (index >= this.workingStates.length) return;
    const state = this.workingStates[index];
    this.masterData.getDistricts(state.stateId).subscribe((districts) => {
      if (districts.some((d) => d.name?.toUpperCase() === token)) {
        this.workingStateId = state.stateId;
        this.career.get('workingStateId')!.setValue(state.stateId);
        this.workingDistricts = districts;
        this.cdr.detectChanges();
        return;
      }
      this.findDistrictState(token, index + 1);
    });
  }
}
