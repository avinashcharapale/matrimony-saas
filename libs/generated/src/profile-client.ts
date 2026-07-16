import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  MasterDataOptionDto,
  MasterDataItemDto,
  ProfileDetailDto,
  ProfileListItemDto,
  ProfileListItemDtoPagedResult,
  CreateProfileDto,
  GeoStateDto,
  GeoDistrictDto,
  GeoTalukaDto,
} from './dtos';

@Injectable({ providedIn: 'root' })
export class MasterDataClient {
  private readonly http = inject(HttpClient);

  getGenders(): Observable<MasterDataOptionDto[]> {
    return this.http.get<MasterDataOptionDto[]>('/profile/master-data/genders');
  }

  getReligions(): Observable<MasterDataOptionDto[]> {
    return this.http.get<MasterDataOptionDto[]>('/profile/master-data/religions');
  }

  getCastes(religionId?: number): Observable<MasterDataOptionDto[]> {
    let params = new HttpParams();
    if (religionId !== undefined) {
      params = params.set('religionId', religionId);
    }
    return this.http.get<MasterDataOptionDto[]>('/profile/master-data/castes', { params });
  }

  getSubCastes(casteId?: number): Observable<MasterDataOptionDto[]> {
    let params = new HttpParams();
    if (casteId !== undefined) {
      params = params.set('casteId', casteId);
    }
    return this.http.get<MasterDataOptionDto[]>('/profile/master-data/sub-castes', { params });
  }

  getMaritalStatuses(): Observable<MasterDataOptionDto[]> {
    return this.http.get<MasterDataOptionDto[]>('/profile/master-data/marital-statuses');
  }

  getBloodGroups(): Observable<MasterDataOptionDto[]> {
    return this.http.get<MasterDataOptionDto[]>('/profile/master-data/blood-groups');
  }

  getComplexions(): Observable<MasterDataOptionDto[]> {
    return this.http.get<MasterDataOptionDto[]>('/profile/master-data/complexions');
  }

  getDiets(): Observable<MasterDataOptionDto[]> {
    return this.http.get<MasterDataOptionDto[]>('/profile/master-data/diets');
  }

  getPersonalities(): Observable<MasterDataOptionDto[]> {
    return this.http.get<MasterDataOptionDto[]>('/profile/master-data/personalities');
  }

  getRashis(): Observable<MasterDataOptionDto[]> {
    return this.http.get<MasterDataOptionDto[]>('/profile/master-data/rashis');
  }

  getNakshatras(): Observable<MasterDataOptionDto[]> {
    return this.http.get<MasterDataOptionDto[]>('/profile/master-data/nakshatras');
  }

  getCharans(): Observable<MasterDataOptionDto[]> {
    return this.http.get<MasterDataOptionDto[]>('/profile/master-data/charans');
  }

  getNadis(): Observable<MasterDataOptionDto[]> {
    return this.http.get<MasterDataOptionDto[]>('/profile/master-data/nadis');
  }

  getGans(): Observable<MasterDataOptionDto[]> {
    return this.http.get<MasterDataOptionDto[]>('/profile/master-data/gans');
  }

  getEducations(): Observable<MasterDataOptionDto[]> {
    return this.http.get<MasterDataOptionDto[]>('/profile/master-data/educations');
  }

  getEducationAreas(): Observable<MasterDataOptionDto[]> {
    return this.http.get<MasterDataOptionDto[]>('/profile/master-data/education-areas');
  }

  getOccupations(): Observable<MasterDataOptionDto[]> {
    return this.http.get<MasterDataOptionDto[]>('/profile/master-data/occupations');
  }

  getIncomePeriods(): Observable<MasterDataOptionDto[]> {
    return this.http.get<MasterDataOptionDto[]>('/profile/master-data/income-periods');
  }

  getStates(countryId?: number): Observable<MasterDataOptionDto[]> {
    let params = new HttpParams();
    if (countryId !== undefined) {
      params = params.set('countryId', countryId);
    }
    return this.http.get<MasterDataOptionDto[]>('/profile/master-data/states', { params });
  }

  getDistricts(stateId?: number): Observable<MasterDataOptionDto[]> {
    let params = new HttpParams();
    if (stateId !== undefined) {
      params = params.set('stateId', stateId);
    }
    return this.http.get<MasterDataOptionDto[]>('/profile/master-data/districts', { params });
  }

  getTalukas(districtId?: number): Observable<MasterDataOptionDto[]> {
    let params = new HttpParams();
    if (districtId !== undefined) {
      params = params.set('districtId', districtId);
    }
    return this.http.get<MasterDataOptionDto[]>('/profile/master-data/talukas', { params });
  }

  getGeoStates(): Observable<GeoStateDto[]> {
    return this.http.get<GeoStateDto[]>('/profile/master-data/geo/states');
  }

  getGeoDistricts(stateId: number): Observable<GeoDistrictDto[]> {
    const params = new HttpParams().set('stateId', stateId);
    return this.http.get<GeoDistrictDto[]>('/profile/master-data/geo/districts', { params });
  }

  getGeoTalukas(districtId: number): Observable<GeoTalukaDto[]> {
    const params = new HttpParams().set('districtId', districtId);
    return this.http.get<GeoTalukaDto[]>('/profile/master-data/geo/talukas', { params });
  }

  getMasterOptions(category: string, lang = 'en'): Observable<MasterDataItemDto[]> {
    const params = new HttpParams().set('category', category).set('lang', lang);
    return this.http.get<MasterDataItemDto[]>('/profile/master', { params });
  }
}

@Injectable({ providedIn: 'root' })
export class ProfileClient {
  private readonly http = inject(HttpClient);

  searchPublic(params: {
    tenantId?: number;
    genderId?: number;
    ageFrom?: number;
    ageTo?: number;
    religionId?: number;
    casteId?: number;
    maritalStatusId?: number;
    city?: string;
    stateId?: number;
    countryId?: number;
    heightFromFt?: number;
    heightToFt?: number;
    annualIncomeFrom?: number;
    annualIncomeTo?: number;
    isVerified?: boolean;
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    sortBy?: string;
    sortDescending?: boolean;
  }): Observable<ProfileListItemDtoPagedResult> {
    let httpParams = new HttpParams();
    const entries = Object.entries(params) as [string, string | number | boolean | undefined][];
    for (const [key, value] of entries) {
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return this.http.get<ProfileListItemDtoPagedResult>('/profile/UserProfiles/public/search', { params: httpParams });
  }

  searchPublicProfiles(params: {
    tenantId?: number;
    genderId?: number;
    ageFrom?: number;
    ageTo?: number;
    religionId?: number;
    casteId?: number;
    maritalStatusId?: number;
    city?: string;
    stateId?: number;
    countryId?: number;
    heightFromFt?: number;
    heightToFt?: number;
    annualIncomeFrom?: number;
    annualIncomeTo?: number;
    isVerified?: boolean;
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    sortBy?: string;
    sortDescending?: boolean;
  }): Observable<ProfileListItemDtoPagedResult> {
    return this.searchPublic(params);
  }

  getPublicById(id: number): Observable<ProfileDetailDto> {
    return this.http.get<ProfileDetailDto>(`/profile/UserProfiles/public/${id}`);
  }

  getPublicProfileById(id: number): Observable<ProfileDetailDto> {
    return this.getPublicById(id);
  }

  getById(id: number): Observable<ProfileDetailDto> {
    return this.http.get<ProfileDetailDto>(`/profile/UserProfiles/${id}`);
  }

  getMyProfile(): Observable<ProfileDetailDto> {
    return this.http.get<ProfileDetailDto>('/profile/UserProfiles/my');
  }

  update(id: number, body: CreateProfileDto): Observable<void> {
    return this.http.put<void>(`/profile/UserProfiles/${id}`, body);
  }

  updateMyProfile(body: CreateProfileDto): Observable<void> {
    return this.http.put<void>('/profile/UserProfiles/my', body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/profile/UserProfiles/${id}`);
  }

  getByTenant(): Observable<ProfileListItemDto[]> {
    return this.http.get<ProfileListItemDto[]>('/profile/UserProfiles');
  }

  getProfilesByTenant(): Observable<ProfileListItemDto[]> {
    return this.getByTenant();
  }

  create(body: CreateProfileDto, photos: File[]): Observable<void> {
    const formData = new FormData();
    formData.append('ProfileJson', JSON.stringify(body));
    photos.forEach((file) => formData.append('Photos', file));
    return this.http.post<void>('/profile/UserProfiles', formData);
  }

  uploadPhoto(slot: number, file: File): Observable<{ photoId: number; photoSlot: number; fileUrl: string; fileName: string }> {
    const formData = new FormData();
    formData.append('File', file);
    formData.append('Slot', String(slot));
    return this.http.post<{ photoId: number; photoSlot: number; fileUrl: string; fileName: string }>(
      '/profile/UserProfiles/my/photos',
      formData,
    );
  }

  deletePhoto(slot: number): Observable<void> {
    return this.http.delete<void>(`/profile/UserProfiles/my/photos/${slot}`);
  }
}
