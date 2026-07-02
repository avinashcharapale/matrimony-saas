import { ChangeDetectorRef, Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

  async ngOnInit(): Promise<void> {
    try {
      const [rashis, nakshatras, charans, nadis, gans, states] = await Promise.all([
        this.registerMasterDataSvc.getRashis(),
        this.registerMasterDataSvc.getNakshatras(),
        this.registerMasterDataSvc.getCharans(),
        this.registerMasterDataSvc.getNadis(),
        this.registerMasterDataSvc.getGans(),
        this.registerMasterDataSvc.getStates(),
      ]);

      this.rashiOptions = rashis;
      this.nakshatraOptions = nakshatras;
      this.charanOptions = charans;
      this.nadiOptions = nadis;
      this.ganOptions = gans;
      this.birthStates = states;

      await this.restoreBirthStateFromDraft();
    } finally {
      this.cdr.detectChanges();
    }
  }

  async onBirthStateChange(stateId: number | null): Promise<void> {
    this.birthDistricts = [];
    this.vm.birthDistrict = '';
    if (stateId) {
      this.birthDistricts = await this.registerMasterDataSvc.getDistricts(stateId);
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

  private async restoreBirthStateFromDraft(): Promise<void> {
    const savedDistrictToken = (this.vm.birthDistrict ?? '').toString().trim().toUpperCase();

    if (savedDistrictToken) {
      for (const state of this.birthStates) {
        const districts = await this.registerMasterDataSvc.getDistricts(state.stateId);
        if (districts.some((district) => district.name.toUpperCase() === savedDistrictToken)) {
          this.birthStateId = state.stateId;
          this.birthDistricts = districts;
          return;
        }
      }
    }

    // Default for new draft when no district/state has been selected yet.
    const mh = this.birthStates.find((s) => s.code === 'MH');
    if (mh) {
      this.birthStateId = mh.stateId;
      this.birthDistricts = await this.registerMasterDataSvc.getDistricts(mh.stateId);
    }
  }
}
