import { ChangeDetectorRef, Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeoService, Taluka } from '../../../services/geo.service';
import {
  RegisterMasterDataService,
  RegisterStateOption,
  RegisterDistrictOption,
} from '../../../services/register-master-data.service';

@Component({
  selector: 'app-register-step-family',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register-step-family.component.html',
  styleUrl: '../register.css',
})
export class RegisterStepFamilyComponent implements OnInit {
  @Input({ required: true }) vm!: any;

  private readonly geoSvc = inject(GeoService);
  private readonly registerMasterDataSvc = inject(RegisterMasterDataService);
  private readonly cdr = inject(ChangeDetectorRef);

  nativeStates: RegisterStateOption[] = [];
  nativeDistricts: RegisterDistrictOption[] = [];
  nativeTalukas: Taluka[] = [];
  nativeStateId: number | null = null;
  nativeDistrictId: number | null = null;

  async ngOnInit(): Promise<void> {
    try {
      this.nativeStates = await this.registerMasterDataSvc.getStates();
      await this.restoreNativeLocationFromDraft();
    } finally {
      this.cdr.detectChanges();
    }
  }

  async onNativeStateChange(stateId: number | null): Promise<void> {
    this.nativeDistricts = [];
    this.nativeTalukas = [];
    this.vm.nativeDistrict = '';
    this.vm.nativeTaluka = '';
    this.nativeDistrictId = null;
    if (stateId) {
      this.nativeDistricts = await this.registerMasterDataSvc.getDistricts(stateId);
    }
    this.cdr.detectChanges();
  }

  async onNativeDistrictChange(districtId: number | null, preserveTaluka = false): Promise<void> {
    this.nativeTalukas = [];
    if (!preserveTaluka) {
      this.vm.nativeTaluka = '';
    }
    const district = this.nativeDistricts.find((d) => d.districtId === districtId);
    this.vm.nativeDistrict = district?.name ?? '';
    if (districtId) {
      this.nativeTalukas = await this.geoSvc.getTalukas(districtId);
      if (preserveTaluka) {
        const savedTalukaToken = (this.vm.nativeTaluka ?? '').toString().trim().toUpperCase();
        if (!this.nativeTalukas.some((t) => t.name.toUpperCase() === savedTalukaToken)) {
          this.vm.nativeTaluka = '';
        }
      }
    }
    this.cdr.detectChanges();
  }

  private async restoreNativeLocationFromDraft(): Promise<void> {
    const savedDistrictToken = (this.vm.nativeDistrict ?? '').toString().trim().toUpperCase();

    if (savedDistrictToken) {
      for (const state of this.nativeStates) {
        const districts = await this.registerMasterDataSvc.getDistricts(state.stateId);
        const matchedDistrict = districts.find((d) => d.name.toUpperCase() === savedDistrictToken);
        if (matchedDistrict) {
          this.nativeStateId = state.stateId;
          this.nativeDistricts = districts;
          this.nativeDistrictId = matchedDistrict.districtId;
          this.vm.nativeDistrict = matchedDistrict.name;
          await this.onNativeDistrictChange(matchedDistrict.districtId, true);
          return;
        }
      }
    }

    const mh = this.nativeStates.find((s) => s.code === 'MH');
    if (mh) {
      this.nativeStateId = mh.stateId;
      this.nativeDistricts = await this.registerMasterDataSvc.getDistricts(mh.stateId);
    }
  }
}
