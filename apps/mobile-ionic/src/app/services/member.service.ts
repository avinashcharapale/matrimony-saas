import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MemberRecord } from '@org/models';
import { CreateProfileDto, ProfileDetailDto } from '@org/generated';
import { AuthStore } from '@org/data-access-auth';
import {
  MemberFacade,
  ProfileRepository,
  mapDtoToRegistrationMemberRecord,
} from '@org/data-access-profile';
import type {
  ProfileDetail,
  ProfileListResponse,
  SearchFilters,
} from '@org/data-access-profile';

export type { MemberRecord, RegisterFormDetails } from '@org/models';
export type {
  ProfileDetail,
  ProfileListResponse,
  ProfileSearchResult,
  RegisterMemberResult,
  SearchFilters,
} from '@org/data-access-profile';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private readonly profileRepository = inject(ProfileRepository);
  private readonly memberFacade = inject(MemberFacade);
  private readonly authStore = inject(AuthStore);

  searchProfiles(filters: SearchFilters): Observable<MemberRecord[]> {
    if (!this.authStore.isAuthenticated()) {
      return of([]);
    }

    return this.memberFacade.searchProfileRecords(filters);
  }

  getProfileByIdFromApi(profileId: number, authenticated = false): Observable<MemberRecord | null> {
    const request$ = authenticated
      ? this.profileRepository.getProfileById(profileId)
      : this.profileRepository.getPublicProfileById(profileId);

    return request$.pipe(
      map((dto) => mapDtoToRegistrationMemberRecord(dto)),
      catchError(() => of(null)),
    );
  }

  getProfileById(profileId: number, authenticated = false): Observable<ProfileDetail> {
    return this.memberFacade.getProfileById(profileId, authenticated);
  }

  getProfiles(pageNumber = 1, pageSize = 10): Observable<ProfileListResponse> {
    return this.memberFacade.getProfiles(pageNumber, pageSize);
  }

  getMyProfile(): Observable<ProfileDetailDto> {
    return this.memberFacade.getMyProfile();
  }

  updateMyProfile(dto: CreateProfileDto): Observable<void> {
    return this.memberFacade.updateMyProfile(dto);
  }

  getCurrentMember(): Observable<MemberRecord | null> {
    return this.memberFacade.getCurrentMember();
  }
}
