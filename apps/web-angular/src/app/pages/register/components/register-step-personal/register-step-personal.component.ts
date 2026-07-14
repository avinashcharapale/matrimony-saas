import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Subscription, forkJoin } from 'rxjs';
import {
  RegisterMasterDataService,
  RegisterLookupOption,
} from '../../../../services/register-master-data.service';

@Component({
  selector: 'app-register-step-personal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register-step-personal.component.html',
  styleUrl: '../../register.css',
})
export class RegisterStepPersonalComponent implements OnInit, OnDestroy {
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) days!: number[];
  @Input({ required: true }) months!: string[];
  @Input({ required: true }) years!: number[];

  private readonly masterData = inject(RegisterMasterDataService);
  private readonly cdr = inject(ChangeDetectorRef);
  private subs: Subscription[] = [];

  genderOptions: RegisterLookupOption[] = [];
  religionOptions: RegisterLookupOption[] = [];
  casteOptions: RegisterLookupOption[] = [];
  subCastOptions: RegisterLookupOption[] = [];
  maritalStatusOptions: RegisterLookupOption[] = [];
  bloodGroupOptions: RegisterLookupOption[] = [];
  complexionOptions: RegisterLookupOption[] = [];
  dietOptions: RegisterLookupOption[] = [];
  personalityOptions: RegisterLookupOption[] = [];
  lookupsLoading = true;

  get personal(): FormGroup { return this.form.get('personalDetails') as FormGroup; }

  ngOnInit(): void {
    forkJoin({
      genders: this.masterData.getGenders(),
      religions: this.masterData.getReligions(),
      maritalStatuses: this.masterData.getMaritalStatuses(),
      bloodGroups: this.masterData.getBloodGroups(),
      complexions: this.masterData.getComplexions(),
      diets: this.masterData.getDiets(),
      personalities: this.masterData.getPersonalities(),
    }).subscribe({
      next: (r) => {
        this.genderOptions = r.genders;
        this.religionOptions = r.religions;
        this.maritalStatusOptions = r.maritalStatuses;
        this.bloodGroupOptions = r.bloodGroups;
        this.complexionOptions = r.complexions;
        this.dietOptions = r.diets;
        this.personalityOptions = r.personalities;
        const religionId = this.personal.get('religionId')?.value;
        if (religionId) this.loadCastes(religionId, true);
      },
      complete: () => { this.lookupsLoading = false; this.cdr.detectChanges(); },
      error: () => { this.lookupsLoading = false; this.cdr.detectChanges(); },
    });

    this.subs.push(
      this.personal.get('religionId')!.valueChanges.subscribe((religionId: number | null) => {
        this.loadCastes(religionId, false);
      }),
      this.personal.get('casteId')!.valueChanges.subscribe((casteId: number | null) => {
        this.loadSubCastes(casteId, false);
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private loadCastes(religionId: number | null, preserve: boolean): void {
    this.casteOptions = [];
    this.subCastOptions = [];
    if (!religionId) {
      this.personal.patchValue({ casteId: null, subCasteId: null });
      return;
    }
    this.masterData.getCastes(religionId).subscribe((castes) => {
      this.casteOptions = castes;
      if (!preserve) this.personal.patchValue({ casteId: null, subCasteId: null });
      const casteId = this.personal.get('casteId')?.value;
      if (casteId) this.loadSubCastes(casteId, preserve);
      this.cdr.detectChanges();
    });
  }

  private loadSubCastes(casteId: number | null, preserve: boolean): void {
    this.subCastOptions = [];
    if (!casteId) {
      this.personal.get('subCasteId')!.setValue(null);
      return;
    }
    this.masterData.getSubCastes(casteId).subscribe((subCastes) => {
      this.subCastOptions = subCastes;
      if (!preserve) this.personal.get('subCasteId')!.setValue(null);
      this.cdr.detectChanges();
    });
  }
}
