import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import {
  RegisterMasterDataService,
  RegisterStateOption,
  RegisterDistrictOption,
  RegisterTalukaOption,
} from '../../../../services/register-master-data.service';

@Component({
  selector: 'app-register-step-family',
  standalone: true,
  imports: [ReactiveFormsModule],
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
  nativeStateId: number | null = null;
  nativeDistrictId: number | null = null;

  get family(): FormGroup { return this.form.get('familyDetails') as FormGroup; }
  get relativesSurnamesCtrl(): FormControl { return this.form.get('relativesSurnames') as FormControl; }

  ngOnInit(): void {
    this.masterData.getStates().subscribe((states) => {
      this.nativeStates = states;
      this.restoreNativeLocationFromDraft();
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  onNativeStateChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value ? Number(select.value) : null;
    this.nativeStateId = value;
    this.nativeDistricts = [];
    this.nativeTalukas = [];
    this.nativeDistrictId = null;
    this.family.patchValue({ nativeDistrict: '', nativeTaluka: '' });
    if (value) {
      this.masterData.getDistricts(value).subscribe((districts) => {
        this.nativeDistricts = districts;
        this.cdr.detectChanges();
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  onNativeDistrictChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const districtId = select.value ? Number(select.value) : null;
    this.nativeTalukas = [];
    this.family.get('nativeTaluka')!.setValue('');
    const district = this.nativeDistricts.find((d) => d.districtId === districtId);
    this.family.get('nativeDistrict')!.setValue(district?.name ?? '');
    this.nativeDistrictId = districtId;
    if (districtId) {
      this.masterData.getTalukas(districtId).subscribe((talukas) => {
        this.nativeTalukas = talukas;
        this.cdr.detectChanges();
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  private restoreNativeLocationFromDraft(): void {
    const saved = (this.family.get('nativeDistrict')?.value ?? '').toString().trim().toUpperCase();
    if (saved) {
      this.findNativeDistrict(saved, 0);
      return;
    }
    const mh = this.nativeStates.find((s) => s.code === 'MH');
    if (mh) {
      this.nativeStateId = mh.stateId;
      this.masterData.getDistricts(mh.stateId)
        .pipe(finalize(() => this.cdr.detectChanges()))
        .subscribe((districts) => { this.nativeDistricts = districts; });
    }
  }

  private findNativeDistrict(token: string, index: number): void {
    if (index >= this.nativeStates.length) return;
    const state = this.nativeStates[index];
    this.masterData.getDistricts(state.stateId).subscribe((districts) => {
      const matched = districts.find((d) => d.name?.toUpperCase() === token);
      if (matched) {
        this.nativeStateId = state.stateId;
        this.nativeDistricts = districts;
        this.nativeDistrictId = matched.districtId;
        this.family.get('nativeDistrict')!.setValue(matched.name!);
        this.loadTalukasPreserve(matched.districtId!);
        return;
      }
      this.findNativeDistrict(token, index + 1);
    });
  }

  private loadTalukasPreserve(districtId: number): void {
    this.masterData.getTalukas(districtId).subscribe((talukas) => {
      this.nativeTalukas = talukas;
      const saved = (this.family.get('nativeTaluka')?.value ?? '').toString().trim().toUpperCase();
      if (!this.nativeTalukas.some((t) => t.name?.toUpperCase() === saved)) {
        this.family.get('nativeTaluka')!.setValue('');
      }
      this.cdr.detectChanges();
    });
  }
}
