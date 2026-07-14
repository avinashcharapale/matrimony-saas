import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
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
    this.subs.push(
      this.horoscope.get('birthStateId')!.valueChanges.subscribe((value) => {
        const stateId = Number(value);
        if (!stateId || stateId === 0) {
          this.birthStateId = null;
          this.horoscope.get('birthStateOther')!.setValue('', { emitEvent: false });
          this.birthDistricts = [];
          this.horoscope.get('birthDistrictId')!.setValue(null, { emitEvent: false });
          this.horoscope.get('birthDistrictOther')!.setValue('', { emitEvent: false });
        } else {
          this.birthStateId = stateId;
          this.horoscope.get('birthStateOther')!.setValue('', { emitEvent: false });
          this.horoscope.get('birthDistrictId')!.setValue(null, { emitEvent: false });
          this.horoscope.get('birthDistrictOther')!.setValue('', { emitEvent: false });
          this.masterData.getDistricts(stateId).subscribe((districts) => {
            this.birthDistricts = districts;
            this.cdr.detectChanges();
          });
        }
      })
    );

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

  private restoreBirthStateFromDraft(): void {
    const savedStateId = this.horoscope.get('birthStateId')?.value;

    if (savedStateId && savedStateId !== 0) {
      this.birthStateId = savedStateId;
      this.masterData.getDistricts(savedStateId).subscribe((districts) => {
        this.birthDistricts = districts;
        this.cdr.detectChanges();
      });
    }
  }
}
