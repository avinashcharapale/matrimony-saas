import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import {
  RegisterMasterDataService,
  RegisterStateOption,
  RegisterDistrictOption,
  RegisterTalukaOption,
} from '../../../../services/register-master-data.service';

@Component({
  selector: 'app-register-step-family',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: './register-step-family.component.html',
  styleUrl: '../../register.css',
})
export class RegisterStepFamilyComponent implements OnInit, OnDestroy {
  @Input({ required: true }) form!: FormGroup;

  private readonly masterData = inject(RegisterMasterDataService);
  private readonly cdr = inject(ChangeDetectorRef);
  private subs: Subscription[] = [];

  nativeStates: RegisterStateOption[] = [];
  nativeDistricts: RegisterDistrictOption[] = [];
  nativeTalukas: RegisterTalukaOption[] = [];

  get family(): FormGroup { return this.form.get('familyDetails') as FormGroup; }
  get relativesSurnamesCtrl(): FormControl { return this.form.get('relativesSurnames') as FormControl; }

  ngOnInit(): void {
    this.subs.push(
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
      })
    );

    this.masterData.getStates().subscribe((states) => {
      this.nativeStates = states;
      this.restoreNativeLocationFromDraft();
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private restoreNativeLocationFromDraft(): void {
    const savedStateId = this.family.get('nativeStateId')?.value;

    if (savedStateId && savedStateId !== 0) {
      this.masterData.getDistricts(savedStateId).subscribe((districts) => {
        this.nativeDistricts = districts;
        this.cdr.detectChanges();
      });
    }
  }
}
