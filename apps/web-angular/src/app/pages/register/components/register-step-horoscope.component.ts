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
  selector: 'app-register-step-horoscope',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register-step-horoscope.component.html',
  styleUrl: '../register.css',
})
export class RegisterStepHoroscopeComponent implements OnInit {
  @Input({ required: true }) vm!: any;

  private readonly registerMasterDataSvc = inject(RegisterMasterDataService);
  private readonly cdr = inject(ChangeDetectorRef);

  birthStates: RegisterStateOption[] = [];
  birthDistricts: RegisterDistrictOption[] = [];
  birthStateId: number | null = null;
  rashiOptions: RegisterLookupOption[] = [];
  nakshatraOptions: RegisterLookupOption[] = [];
  charanOptions: RegisterLookupOption[] = [];
  nadiOptions: RegisterLookupOption[] = [];
  ganOptions: RegisterLookupOption[] = [];

  ngOnInit(): void {
    forkJoin({
      rashis: this.registerMasterDataSvc.getRashis(),
      nakshatras: this.registerMasterDataSvc.getNakshatras(),
      charans: this.registerMasterDataSvc.getCharans(),
      nadis: this.registerMasterDataSvc.getNadis(),
      gans: this.registerMasterDataSvc.getGans(),
      states: this.registerMasterDataSvc.getStates(),
    }).subscribe({
      next: ({ rashis, nakshatras, charans, nadis, gans, states }) => {
        this.rashiOptions = rashis;
        this.nakshatraOptions = nakshatras;
        this.charanOptions = charans;
        this.nadiOptions = nadis;
        this.ganOptions = gans;
        this.birthStates = states;
        this.restoreBirthStateFromDraft();
      },
      complete: () => this.cdr.detectChanges(),
      error: () => this.cdr.detectChanges(),
    });
  }

  onBirthStateChange(stateId: number | null): void {
    this.birthDistricts = [];
    this.vm.birthDistrict = '';
    if (stateId) {
      this.registerMasterDataSvc.getDistricts(stateId).subscribe((districts) => {
        this.birthDistricts = districts;
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

  private restoreBirthStateFromDraft(): void {
    const savedDistrictToken = (this.vm.birthDistrict ?? '').toString().trim().toUpperCase();

    if (savedDistrictToken) {
      this.findBirthStateForDistrict(savedDistrictToken, 0);
      return;
    }

    // Default for new draft when no district/state has been selected yet.
    const mh = this.birthStates.find((s) => s.code === 'MH');
    if (mh) {
      this.birthStateId = mh.stateId;
      this.registerMasterDataSvc.getDistricts(mh.stateId).subscribe((districts) => {
        this.birthDistricts = districts;
        this.cdr.detectChanges();
      });
    }
  }

  private findBirthStateForDistrict(savedDistrictToken: string, index: number): void {
    if (index >= this.birthStates.length) {
      return;
    }

    const state = this.birthStates[index];
    this.registerMasterDataSvc.getDistricts(state.stateId).subscribe((districts) => {
      if (districts.some((district) => district.name.toUpperCase() === savedDistrictToken)) {
        this.birthStateId = state.stateId;
        this.birthDistricts = districts;
        this.cdr.detectChanges();
        return;
      }

      this.findBirthStateForDistrict(savedDistrictToken, index + 1);
    });
  }
}
