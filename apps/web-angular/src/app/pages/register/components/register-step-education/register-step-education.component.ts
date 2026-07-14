import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Subscription, forkJoin } from 'rxjs';
import {
  RegisterMasterDataService,
  RegisterLookupOption,
  RegisterStateOption,
  RegisterDistrictOption,
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

  get career(): FormGroup { return this.form.get('careerDetails') as FormGroup; }

  ngOnInit(): void {
    forkJoin({
      educations: this.masterData.getEducations(),
      educationAreas: this.masterData.getEducationAreas(),
      occupations: this.masterData.getOccupations(),
      incomePeriods: this.masterData.getIncomePeriods(),
      states: this.masterData.getStates(),
    }).subscribe({
      next: (r) => {
        this.educationOptions = r.educations;
        this.educationAreaOptions = r.educationAreas;
        this.occupationTypeOptions = r.occupations;
        this.incomePeriodOptions = r.incomePeriods;
        this.workingStates = r.states;
        this.restoreWorkingStateFromDraft();
      },
      complete: () => this.cdr.detectChanges(),
      error: () => this.cdr.detectChanges(),
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  onWorkingStateChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value ? Number(select.value) : null;
    this.workingStateId = value;
    this.workingDistricts = [];
    this.career.get('workingCityCountry')!.setValue('');
    if (value) {
      this.masterData.getDistricts(value).subscribe((districts) => {
        this.workingDistricts = districts;
        this.cdr.detectChanges();
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  private restoreWorkingStateFromDraft(): void {
    const saved = (this.career.get('workingCityCountry')?.value ?? '').toString().trim().toUpperCase();
    if (!saved) return;
    this.findDistrictState(saved, 0);
  }

  private findDistrictState(token: string, index: number): void {
    if (index >= this.workingStates.length) return;
    const state = this.workingStates[index];
    this.masterData.getDistricts(state.stateId).subscribe((districts) => {
      if (districts.some((d) => d.name?.toUpperCase() === token)) {
        this.workingStateId = state.stateId;
        this.workingDistricts = districts;
        this.cdr.detectChanges();
        return;
      }
      this.findDistrictState(token, index + 1);
    });
  }
}
