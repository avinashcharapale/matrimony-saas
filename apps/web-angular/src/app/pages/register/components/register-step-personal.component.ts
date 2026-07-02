import { ChangeDetectorRef, Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  RegisterMasterDataService,
  RegisterLookupOption,
} from '../../../services/register-master-data.service';

@Component({
  selector: 'app-register-step-personal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register-step-personal.component.html',
  styleUrl: '../register.css',
})
export class RegisterStepPersonalComponent implements OnInit {
  @Input({ required: true }) vm!: any;

  private readonly registerMasterDataSvc = inject(RegisterMasterDataService);
  private readonly cdr = inject(ChangeDetectorRef);

  genderOptions: RegisterLookupOption[] = [];
  religionOptions: RegisterLookupOption[] = [];
  casteOptions: RegisterLookupOption[] = [];
  subCastOptions: RegisterLookupOption[] = [];
  maritalStatusOptions: RegisterLookupOption[] = [];
  bloodGroupOptions: RegisterLookupOption[] = [];
  complexionOptions: RegisterLookupOption[] = [];
  dietOptions: RegisterLookupOption[] = [];
  personalityOptions: RegisterLookupOption[] = [];

  selectedGenderId: number | null = null;
  selectedReligionId: number | null = null;
  selectedCasteId: number | null = null;
  selectedSubCasteId: number | null = null;
  selectedMaritalStatusId: number | null = null;
  selectedBloodGroupId: number | null = null;
  selectedComplexionId: number | null = null;
  selectedDietId: number | null = null;
  selectedPersonalityId: number | null = null;
  lookupsLoading = true;

  ngOnInit(): void {
    forkJoin({
      genders: this.registerMasterDataSvc.getGenders(),
      religions: this.registerMasterDataSvc.getReligions(),
      maritalStatuses: this.registerMasterDataSvc.getMaritalStatuses(),
      bloodGroups: this.registerMasterDataSvc.getBloodGroups(),
      complexions: this.registerMasterDataSvc.getComplexions(),
      diets: this.registerMasterDataSvc.getDiets(),
      personalities: this.registerMasterDataSvc.getPersonalities(),
    }).subscribe({
      next: ({ genders, religions, maritalStatuses, bloodGroups, complexions, diets, personalities }) => {
        this.genderOptions = genders;
        this.religionOptions = religions;
        this.maritalStatusOptions = maritalStatuses;
        this.bloodGroupOptions = bloodGroups;
        this.complexionOptions = complexions;
        this.dietOptions = diets;
        this.personalityOptions = personalities;

        this.selectedGenderId = this.findIdByVmValue(this.genderOptions, this.vm.gender);
        this.selectedMaritalStatusId = this.findIdByVmValue(this.maritalStatusOptions, this.vm.maritalStatus);
        this.selectedBloodGroupId = this.findIdByVmValue(this.bloodGroupOptions, this.vm.bloodGroup);
        this.selectedComplexionId = this.findIdByVmValue(this.complexionOptions, this.vm.complexion);
        this.selectedDietId = this.findIdByVmValue(this.dietOptions, this.vm.diet);
        this.selectedPersonalityId = this.findIdByVmValue(this.personalityOptions, this.vm.personality);
        this.selectedReligionId = this.findIdByVmValue(this.religionOptions, this.vm.religion);
        if (this.selectedReligionId) {
          this.loadCastes(this.selectedReligionId, true);
        }
      },
      complete: () => {
        this.lookupsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.lookupsLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onReligionChange(religionId: number | null): void {
    this.selectedReligionId = religionId;
    this.setVmFieldFromSelection(this.religionOptions, religionId, 'religion');
    this.loadCastes(religionId, false);
  }

  onCasteChange(casteId: number | null): void {
    this.selectedCasteId = casteId;
    this.setVmFieldFromSelection(this.casteOptions, casteId, 'caste');
    this.loadSubCastes(casteId, false);
  }

  onSubCasteChange(subCasteId: number | null): void {
    this.selectedSubCasteId = subCasteId;
    this.setVmFieldFromSelection(this.subCastOptions, subCasteId, 'subCast');
  }

  onMaritalStatusChange(id: number | null): void {
    this.selectedMaritalStatusId = id;
    this.setVmFieldFromSelection(this.maritalStatusOptions, id, 'maritalStatus');
  }

  onBloodGroupChange(id: number | null): void {
    this.selectedBloodGroupId = id;
    this.setVmFieldFromSelection(this.bloodGroupOptions, id, 'bloodGroup');
  }

  onComplexionChange(id: number | null): void {
    this.selectedComplexionId = id;
    this.setVmFieldFromSelection(this.complexionOptions, id, 'complexion');
  }

  onDietChange(id: number | null): void {
    this.selectedDietId = id;
    this.setVmFieldFromSelection(this.dietOptions, id, 'diet');
  }

  onPersonalityChange(id: number | null): void {
    this.selectedPersonalityId = id;
    this.setVmFieldFromSelection(this.personalityOptions, id, 'personality');
  }

  private loadCastes(religionId: number | null, preserveSelection: boolean): void {
    this.casteOptions = [];
    this.subCastOptions = [];
    this.selectedCasteId = null;
    this.selectedSubCasteId = null;

    if (!religionId) {
      this.vm.caste = '';
      this.vm.subCast = '';
      return;
    }

    this.registerMasterDataSvc.getCastes(religionId).subscribe((castes) => {
      this.casteOptions = castes;

      if (preserveSelection) {
        this.selectedCasteId = this.findIdByVmValue(this.casteOptions, this.vm.caste);
      } else {
        this.vm.caste = '';
        this.vm.subCast = '';
      }

      if (this.selectedCasteId) {
        this.setVmFieldFromSelection(this.casteOptions, this.selectedCasteId, 'caste');
        this.loadSubCastes(this.selectedCasteId, preserveSelection);
      }

      this.cdr.detectChanges();
    });
  }

  private loadSubCastes(casteId: number | null, preserveSelection: boolean): void {
    this.subCastOptions = [];
    if (!casteId) {
      this.vm.subCast = '';
      this.selectedSubCasteId = null;
      return;
    }

    this.registerMasterDataSvc.getSubCastes(casteId).subscribe((subCastes) => {
      this.subCastOptions = subCastes;

      if (preserveSelection) {
        this.selectedSubCasteId = this.findIdByVmValue(this.subCastOptions, this.vm.subCast);
      } else {
        this.vm.subCast = '';
        this.selectedSubCasteId = null;
      }

      if (this.selectedSubCasteId) {
        this.setVmFieldFromSelection(this.subCastOptions, this.selectedSubCasteId, 'subCast');
      }

      this.cdr.detectChanges();
    });
  }

  private setVmFieldFromSelection(
    options: RegisterLookupOption[],
    selectedId: number | null,
    vmField: string
  ): void {
    if (!selectedId) {
      this.vm[vmField] = '';
      return;
    }

    const selected = options.find((option) => option.id === selectedId);
    this.vm[vmField] = selected?.value ?? selected?.label ?? '';
  }

  onGenderChange(genderId: number | null): void {
    this.selectedGenderId = genderId;
    this.setVmFieldFromSelection(this.genderOptions, genderId, 'gender');
  }

  findIdByVmValue(
    options: RegisterLookupOption[],
    vmValue: string | null | undefined
  ): number | null {
    const token = (vmValue ?? '').toString().trim().toUpperCase();
    if (!token) {
      return null;
    }
    const found = options.find(
      (option) => option.value.toUpperCase() === token || option.label.toUpperCase() === token
    );
    return found?.id ?? null;
  }
}
