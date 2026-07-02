import { ChangeDetectorRef, Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeoService, Taluka } from '../../../services/geo.service';
import { finalize } from 'rxjs/operators';
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

  ngOnInit(): void {
    this.registerMasterDataSvc.getStates().subscribe((states) => {
      this.nativeStates = states;
      this.restoreNativeLocationFromDraft();
      this.cdr.detectChanges();
    });
  }

  onNativeStateChange(stateId: number | null): void {
    this.nativeDistricts = [];
    this.nativeTalukas = [];
    this.vm.nativeDistrict = '';
    this.vm.nativeTaluka = '';
    this.nativeDistrictId = null;
    if (stateId) {
      this.registerMasterDataSvc.getDistricts(stateId).subscribe((districts) => {
        this.nativeDistricts = districts;
        this.cdr.detectChanges();
      });
      return;
    }
    this.cdr.detectChanges();
  }

  onNativeDistrictChange(districtId: number | null, preserveTaluka = false): void {
    this.nativeTalukas = [];
    if (!preserveTaluka) {
      this.vm.nativeTaluka = '';
    }
    const district = this.nativeDistricts.find((d) => d.districtId === districtId);
    this.vm.nativeDistrict = district?.name ?? '';
    if (districtId) {
      this.geoSvc.getTalukas(districtId).subscribe((talukas) => {
        this.nativeTalukas = talukas;
        if (preserveTaluka) {
          const savedTalukaToken = (this.vm.nativeTaluka ?? '').toString().trim().toUpperCase();
          if (!this.nativeTalukas.some((t) => t.name.toUpperCase() === savedTalukaToken)) {
            this.vm.nativeTaluka = '';
          }
        }
        this.cdr.detectChanges();
      });
      return;
    }
    this.cdr.detectChanges();
  }

  private restoreNativeLocationFromDraft(): void {
    const savedDistrictToken = (this.vm.nativeDistrict ?? '').toString().trim().toUpperCase();

    if (savedDistrictToken) {
      this.findNativeDistrict(savedDistrictToken, 0);
      return;
    }

    const mh = this.nativeStates.find((s) => s.code === 'MH');
    if (mh) {
      this.nativeStateId = mh.stateId;
      this.registerMasterDataSvc.getDistricts(mh.stateId)
        .pipe(finalize(() => this.cdr.detectChanges()))
        .subscribe((districts) => {
          this.nativeDistricts = districts;
        });
    }
  }

  private findNativeDistrict(savedDistrictToken: string, index: number): void {
    if (index >= this.nativeStates.length) {
      return;
    }

    const state = this.nativeStates[index];
    this.registerMasterDataSvc.getDistricts(state.stateId).subscribe((districts) => {
      const matchedDistrict = districts.find((d) => d.name.toUpperCase() === savedDistrictToken);
      if (matchedDistrict) {
        this.nativeStateId = state.stateId;
        this.nativeDistricts = districts;
        this.nativeDistrictId = matchedDistrict.districtId;
        this.vm.nativeDistrict = matchedDistrict.name;
        this.onNativeDistrictChange(matchedDistrict.districtId, true);
        return;
      }

      this.findNativeDistrict(savedDistrictToken, index + 1);
    });
  }
}
