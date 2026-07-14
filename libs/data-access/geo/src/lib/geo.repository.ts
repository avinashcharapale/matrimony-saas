import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MasterDataClient, GeoStateDto, GeoDistrictDto, GeoTalukaDto } from '@org/generated';

@Injectable({ providedIn: 'root' })
export class GeoRepository {
  private readonly masterData = inject(MasterDataClient);

  getStates(): Observable<GeoStateDto[]> {
    return this.masterData.getGeoStates();
  }

  getDistricts(stateId: number): Observable<GeoDistrictDto[]> {
    return this.masterData.getGeoDistricts(stateId);
  }

  getTalukas(districtId: number): Observable<GeoTalukaDto[]> {
    return this.masterData.getGeoTalukas(districtId);
  }
}
