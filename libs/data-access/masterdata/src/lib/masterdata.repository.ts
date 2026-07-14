import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MasterDataClient, MasterDataOptionDto, MasterDataItemDto, GeoStateDto, GeoDistrictDto, GeoTalukaDto } from '@org/generated';

export interface MasterDataItem {
  masterDataId: number;
  category: string;
  valueCode: string;
  sortOrder: number;
  label: string;
}

export interface GeoState {
  stateId: number;
  countryId: number;
  code: string;
  name: string;
  nameMr: string | null;
}

export interface GeoDistrict {
  districtId: number;
  stateId: number;
  name: string;
  nameMr: string | null;
}

export interface GeoTaluka {
  talukaId: number;
  districtId: number;
  name: string;
  nameMr: string | null;
}

@Injectable({ providedIn: 'root' })
export class MasterDataRepository {
  private readonly masterData = inject(MasterDataClient);

  getGenders(): Observable<MasterDataOptionDto[]> {
    return this.masterData.getGenders();
  }

  getReligions(): Observable<MasterDataOptionDto[]> {
    return this.masterData.getReligions();
  }

  getCastes(religionId: number): Observable<MasterDataOptionDto[]> {
    return this.masterData.getCastes(religionId);
  }

  getSubCastes(casteId: number): Observable<MasterDataOptionDto[]> {
    return this.masterData.getSubCastes(casteId);
  }

  getMaritalStatuses(): Observable<MasterDataOptionDto[]> {
    return this.masterData.getMaritalStatuses();
  }

  getBloodGroups(): Observable<MasterDataOptionDto[]> {
    return this.masterData.getBloodGroups();
  }

  getComplexions(): Observable<MasterDataOptionDto[]> {
    return this.masterData.getComplexions();
  }

  getDiets(): Observable<MasterDataOptionDto[]> {
    return this.masterData.getDiets();
  }

  getPersonalities(): Observable<MasterDataOptionDto[]> {
    return this.masterData.getPersonalities();
  }

  getRashis(): Observable<MasterDataOptionDto[]> {
    return this.masterData.getRashis();
  }

  getNakshatras(): Observable<MasterDataOptionDto[]> {
    return this.masterData.getNakshatras();
  }

  getCharans(): Observable<MasterDataOptionDto[]> {
    return this.masterData.getCharans();
  }

  getNadis(): Observable<MasterDataOptionDto[]> {
    return this.masterData.getNadis();
  }

  getGans(): Observable<MasterDataOptionDto[]> {
    return this.masterData.getGans();
  }

  getEducations(): Observable<MasterDataOptionDto[]> {
    return this.masterData.getEducations();
  }

  getEducationAreas(): Observable<MasterDataOptionDto[]> {
    return this.masterData.getEducationAreas();
  }

  getOccupations(): Observable<MasterDataOptionDto[]> {
    return this.masterData.getOccupations();
  }

  getIncomePeriods(): Observable<MasterDataOptionDto[]> {
    return this.masterData.getIncomePeriods();
  }

  getGeoStates(): Observable<GeoState[]> {
    return this.masterData.getGeoStates() as unknown as Observable<GeoState[]>;
  }

  getGeoDistricts(stateId: number): Observable<GeoDistrict[]> {
    return this.masterData.getGeoDistricts(stateId) as unknown as Observable<GeoDistrict[]>;
  }

  getGeoTalukas(districtId: number): Observable<GeoTaluka[]> {
    return this.masterData.getGeoTalukas(districtId) as unknown as Observable<GeoTaluka[]>;
  }

  getMasterOptions(category: string, lang = 'en'): Observable<MasterDataItem[]> {
    return this.masterData.getMasterOptions(category, lang) as unknown as Observable<MasterDataItem[]>;
  }
}
