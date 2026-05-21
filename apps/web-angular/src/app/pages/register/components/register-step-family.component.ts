import { Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeoService, State, District, Taluka } from '../../../services/geo.service';

@Component({
  selector: 'app-register-step-family',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register-step-family.component.html',
  styleUrl: '../register.css',
})
export class RegisterStepFamilyComponent implements OnInit {
  @Input({ required: true }) vm!: any;

  private geoSvc = inject(GeoService);

  nativeStates: State[] = [];
  nativeDistricts: District[] = [];
  nativeTalukas: Taluka[] = [];
  nativeStateId: number | null = null;
  nativeDistrictId: number | null = null;

  async ngOnInit(): Promise<void> {
    this.nativeStates = await this.geoSvc.getStates();
    const mh = this.nativeStates.find((s) => s.code === 'MH');
    if (mh) {
      this.nativeStateId = mh.stateId;
      this.nativeDistricts = await this.geoSvc.getDistricts(mh.stateId);
    }
  }

  async onNativeStateChange(stateId: number | null): Promise<void> {
    this.nativeDistricts = [];
    this.nativeTalukas = [];
    this.vm.nativeDistrict = '';
    this.vm.nativeTaluka = '';
    this.nativeDistrictId = null;
    if (stateId) {
      this.nativeDistricts = await this.geoSvc.getDistricts(stateId);
    }
  }

  async onNativeDistrictChange(districtId: number | null): Promise<void> {
    this.nativeTalukas = [];
    this.vm.nativeTaluka = '';
    const district = this.nativeDistricts.find((d) => d.districtId === districtId);
    this.vm.nativeDistrict = district?.name ?? '';
    if (districtId) {
      this.nativeTalukas = await this.geoSvc.getTalukas(districtId);
    }
  }
}
