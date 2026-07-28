import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ProfileClient,
  ProfileListItemDto,
  ProfileListItemDtoPagedResult,
  ProfileDetailDto,
} from '@org/generated';

export interface ProfileSearchParams {
  ageFrom?: number;
  ageTo?: number;
  religionId?: number;
  casteId?: number;
  maritalStatusId?: number;
  city?: string;
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileRepository {
  private readonly profile = inject(ProfileClient);

  searchPublicProfiles(
    params: ProfileSearchParams,
  ): Observable<ProfileListItemDtoPagedResult> {
    return this.profile.searchPublicProfiles(params);
  }

  getProfilesByTenant(): Observable<ProfileListItemDto[]> {
    return this.profile.getProfilesByTenant();
  }

  getPublicProfileById(id: number): Observable<ProfileDetailDto> {
    return this.profile.getPublicProfileById(id);
  }

  getProfileById(id: number): Observable<ProfileDetailDto> {
    return this.profile.getById(id);
  }
}
