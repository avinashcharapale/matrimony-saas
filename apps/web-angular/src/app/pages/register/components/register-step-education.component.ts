import { ChangeDetectorRef, Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  RegisterMasterDataService,
  RegisterLookupOption,
  RegisterStateOption,
  RegisterDistrictOption,
} from '../../../services/register-master-data.service';

@Component({
  selector: 'app-register-step-education',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register-step-education.component.html',
  styleUrl: '../register.css',
})
export class RegisterStepEducationComponent implements OnInit {
  @Input({ required: true }) vm!: any;

  private readonly registerMasterDataSvc = inject(RegisterMasterDataService);
  private readonly cdr = inject(ChangeDetectorRef);

  educationOptions: RegisterLookupOption[] = [];
  educationAreaOptions: RegisterLookupOption[] = [];
  occupationTypeOptions: RegisterLookupOption[] = [];
  incomePeriodOptions: RegisterLookupOption[] = [];
  workingStates: RegisterStateOption[] = [];
  workingDistricts: RegisterDistrictOption[] = [];
  workingStateId: number | null = null;

  ngOnInit(): void {
    forkJoin({
      educations: this.registerMasterDataSvc.getEducations(),
      educationAreas: this.registerMasterDataSvc.getEducationAreas(),
      occupations: this.registerMasterDataSvc.getOccupations(),
      incomePeriods: this.registerMasterDataSvc.getIncomePeriods(),
      states: this.registerMasterDataSvc.getStates(),
    }).subscribe({
      next: ({ educations, educationAreas, occupations, incomePeriods, states }) => {
        this.educationOptions = educations;
        this.educationAreaOptions = educationAreas;
        this.occupationTypeOptions = occupations;
        this.incomePeriodOptions = incomePeriods;
        this.workingStates = states;
        this.restoreWorkingStateFromDraft();
      },
      complete: () => this.cdr.detectChanges(),
      error: () => this.cdr.detectChanges(),
    });
  }

  onWorkingStateChange(stateId: number | null): void {
    this.workingDistricts = [];
    this.vm.workingCityCountry = '';
    if (stateId) {
      this.registerMasterDataSvc.getDistricts(stateId).subscribe((districts) => {
        this.workingDistricts = districts;
        this.cdr.detectChanges();
      });
      return;
    }
    this.cdr.detectChanges();
  }

  onOptionChange(options: RegisterLookupOption[], selectedId: number | null, vmField: string): void {
    if (!selectedId) {
      this.vm[vmField] = '';
      return;
    }

    const selected = options.find((option) => option.id === selectedId);
    this.vm[vmField] = selected?.value ?? selected?.label ?? '';
  }

  findIdByVmValue(options: RegisterLookupOption[], vmValue: string | null | undefined): number | null {
    const token = (vmValue ?? '').toString().trim().toUpperCase();
    if (!token) {
      return null;
    }
    const found = options.find(
      (option) => option.value.toUpperCase() === token || option.label.toUpperCase() === token
    );
    return found?.id ?? null;
  }

  private restoreWorkingStateFromDraft(): void {
    const savedDistrictToken = (this.vm.workingCityCountry ?? '').toString().trim().toUpperCase();
    if (!savedDistrictToken) {
      return;
    }

    this.findDistrictState(savedDistrictToken, 0);
  }

  private findDistrictState(savedDistrictToken: string, index: number): void {
    if (index >= this.workingStates.length) {
      return;
    }

    const state = this.workingStates[index];
    this.registerMasterDataSvc.getDistricts(state.stateId).subscribe((districts) => {
      if (districts.some((district) => district.name.toUpperCase() === savedDistrictToken)) {
        this.workingStateId = state.stateId;
        this.workingDistricts = districts;
        this.cdr.detectChanges();
        return;
      }

      this.findDistrictState(savedDistrictToken, index + 1);
    });
  }
}
