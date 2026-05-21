import { Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MasterDataService, MasterDataItem } from '../../../services/master-data.service';
import { GeoService, State, District } from '../../../services/geo.service';

@Component({
  selector: 'app-register-step-education',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register-step-education.component.html',
  styleUrl: '../register.css',
})
export class RegisterStepEducationComponent implements OnInit {
  @Input({ required: true }) vm!: any;

  private masterDataSvc = inject(MasterDataService);
  private geoSvc = inject(GeoService);

  educationAreaOptions: MasterDataItem[] = [];
  occupationTypeOptions: MasterDataItem[] = [];
  workingStates: State[] = [];
  workingDistricts: District[] = [];
  workingStateId: number | null = null;

  async ngOnInit(): Promise<void> {
    const data = await this.masterDataSvc.getMultiple(['education_area', 'occupation_type']);
    this.educationAreaOptions = data['education_area'] ?? [];
    this.occupationTypeOptions = data['occupation_type'] ?? [];
    this.workingStates = await this.geoSvc.getStates();
  }

  async onWorkingStateChange(stateId: number | null): Promise<void> {
    this.workingDistricts = [];
    this.vm.workingCityCountry = '';
    if (stateId) {
      this.workingDistricts = await this.geoSvc.getDistricts(stateId);
    }
  }
}
