import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Subscription, forkJoin } from 'rxjs';
import {
  RegisterMasterDataService,
  RegisterLookupOption,
  RegisterStateOption,
  RegisterDistrictOption,
} from '../../../../services/register-master-data.service';

@Component({
  selector: 'app-register-step-horoscope',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register-step-horoscope.component.html',
  styleUrl: '../../register.css',
})
export class RegisterStepHoroscopeComponent implements OnInit, OnDestroy {
  @Input({ required: true }) form!: FormGroup;

  private readonly masterData = inject(RegisterMasterDataService);
  private readonly cdr = inject(ChangeDetectorRef);
  private subs: Subscription[] = [];

  birthStates: RegisterStateOption[] = [];
  birthDistricts: RegisterDistrictOption[] = [];
  birthStateId: number | null = null;
  rashiOptions: RegisterLookupOption[] = [];
  nakshatraOptions: RegisterLookupOption[] = [];
  charanOptions: RegisterLookupOption[] = [];
  nadiOptions: RegisterLookupOption[] = [];
  ganOptions: RegisterLookupOption[] = [];

  get horoscope(): FormGroup { return this.form.get('profileHoroscope') as FormGroup; }

  ngOnInit(): void {
    forkJoin({
      rashis: this.masterData.getRashis(),
      nakshatras: this.masterData.getNakshatras(),
      charans: this.masterData.getCharans(),
      nadis: this.masterData.getNadis(),
      gans: this.masterData.getGans(),
      states: this.masterData.getStates(),
    }).subscribe({
      next: (r) => {
        this.rashiOptions = r.rashis;
        this.nakshatraOptions = r.nakshatras;
        this.charanOptions = r.charans;
        this.nadiOptions = r.nadis;
        this.ganOptions = r.gans;
        this.birthStates = r.states;
        this.restoreBirthStateFromDraft();
      },
      complete: () => this.cdr.detectChanges(),
      error: () => this.cdr.detectChanges(),
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  onBirthStateChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value ? Number(select.value) : null;
    this.birthStateId = value;
    this.birthDistricts = [];
    this.horoscope.get('birthDistrict')!.setValue('');
    if (value) {
      this.masterData.getDistricts(value).subscribe((districts) => {
        this.birthDistricts = districts;
        this.cdr.detectChanges();
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  onBirthDistrictChange(districtName: string): void {
    this.horoscope.get('birthDistrict')!.setValue(districtName);
  }

  private restoreBirthStateFromDraft(): void {
    const saved = (this.horoscope.get('birthDistrict')?.value ?? '').toString().trim().toUpperCase();
    if (saved) {
      this.findBirthStateForDistrict(saved, 0);
      return;
    }
    const mh = this.birthStates.find((s) => s.code === 'MH');
    if (mh) {
      this.birthStateId = mh.stateId;
      this.masterData.getDistricts(mh.stateId).subscribe((districts) => {
        this.birthDistricts = districts;
        this.cdr.detectChanges();
      });
    }
  }

  private findBirthStateForDistrict(token: string, index: number): void {
    if (index >= this.birthStates.length) return;
    const state = this.birthStates[index];
    this.masterData.getDistricts(state.stateId).subscribe((districts) => {
      if (districts.some((d) => d.name?.toUpperCase() === token)) {
        this.birthStateId = state.stateId;
        this.birthDistricts = districts;
        this.cdr.detectChanges();
        return;
      }
      this.findBirthStateForDistrict(token, index + 1);
    });
  }
}
