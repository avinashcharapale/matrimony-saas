import { ChangeDetectorRef, Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

  async ngOnInit(): Promise<void> {
    try {
      const [educations, educationAreas, occupations, incomePeriods, states] = await Promise.all([
        this.registerMasterDataSvc.getEducations(),
        this.registerMasterDataSvc.getEducationAreas(),
        this.registerMasterDataSvc.getOccupations(),
        this.registerMasterDataSvc.getIncomePeriods(),
        this.registerMasterDataSvc.getStates(),
      ]);

      this.educationOptions = educations;
      this.educationAreaOptions = educationAreas;
      this.occupationTypeOptions = occupations;
      this.incomePeriodOptions = incomePeriods;
      this.workingStates = states;

      await this.restoreWorkingStateFromDraft();
    } finally {
      this.cdr.detectChanges();
    }
  }

  async onWorkingStateChange(stateId: number | null): Promise<void> {
    this.workingDistricts = [];
    this.vm.workingCityCountry = '';
    if (stateId) {
      this.workingDistricts = await this.registerMasterDataSvc.getDistricts(stateId);
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

  private async restoreWorkingStateFromDraft(): Promise<void> {
    const savedDistrictToken = (this.vm.workingCityCountry ?? '').toString().trim().toUpperCase();
    if (!savedDistrictToken) {
      return;
    }

    for (const state of this.workingStates) {
      const districts = await this.registerMasterDataSvc.getDistricts(state.stateId);
      if (districts.some((district) => district.name.toUpperCase() === savedDistrictToken)) {
        this.workingStateId = state.stateId;
        this.workingDistricts = districts;
        return;
      }
    }
  }
}
