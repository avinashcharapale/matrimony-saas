import { Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeoService, State, District } from '../../../services/geo.service';
import { MasterDataService, MasterDataItem } from '../../../services/master-data.service';

@Component({
  selector: 'app-register-step-horoscope',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register-step-horoscope.component.html',
  styleUrl: '../register.css',
})
export class RegisterStepHoroscopeComponent implements OnInit {
  @Input({ required: true }) vm!: any;

  private geoSvc = inject(GeoService);
  private masterDataSvc = inject(MasterDataService);

  birthStates: State[] = [];
  birthDistricts: District[] = [];
  birthStateId: number | null = null;
  rashiOptions: MasterDataItem[] = [];
  nakshatraOptions: MasterDataItem[] = [];

  async ngOnInit(): Promise<void> {
    const lookupData = await this.masterDataSvc.getMultiple(['rashi', 'nakshatra']);
    this.rashiOptions = lookupData['rashi'] ?? [];
    this.nakshatraOptions = lookupData['nakshatra'] ?? [];

    this.birthStates = await this.geoSvc.getStates();
    // Pre-select Maharashtra and load its districts by default
    const mh = this.birthStates.find((s) => s.code === 'MH');
    if (mh) {
      this.birthStateId = mh.stateId;
      this.birthDistricts = await this.geoSvc.getDistricts(mh.stateId);
    }
  }

  async onBirthStateChange(stateId: number | null): Promise<void> {
    this.birthDistricts = [];
    this.vm.birthDistrict = '';
    if (stateId) {
      this.birthDistricts = await this.geoSvc.getDistricts(stateId);
    }
  }
}
