import { Injectable, inject } from '@angular/core';
import { MemberRecord } from '@org/models';
import { LocaleService } from '@org/i18n';
import {
  IdentityClient,
  ProfileClient,
  ProfileDetailDto,
  ProfileListItemDto,
  CreateProfileDto,
} from '@org/generated';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  ProfileDetail,
  ProfileListResponse,
  ProfileSearchResult,
  SearchFilters,
} from './member.models';
import {
  convertToMemberRecord,
  mapListItemToSearchResult,
  mapProfileDetailToProfileDetail,
} from './member.mapper';

@Injectable({ providedIn: 'root' })
export class MemberFacade {
  private readonly profileClient = inject(ProfileClient);
  private readonly identity = inject(IdentityClient);
  private readonly localeService = inject(LocaleService);

  searchProfiles(filters: SearchFilters): Observable<ProfileSearchResult[]> {
    return this.profileClient
      .searchPublicProfiles({
        genderId: filters.genderId,
        ageFrom: filters.ageMin,
        ageTo: filters.ageMax,
        religionId: filters.religion ? Number(filters.religion) || undefined : undefined,
        casteId: filters.caste ? Number(filters.caste) || undefined : undefined,
        educationId:
          filters.educationId || (filters.education ? Number(filters.education) || undefined : undefined),
        occupationId:
          filters.occupationId || (filters.occupation ? Number(filters.occupation) || undefined : undefined),
        workingCity: filters.workingCity || undefined,
        nativePlace: filters.nativePlace || undefined,
        maritalStatusId: filters.maritalStatus ? Number(filters.maritalStatus) || undefined : undefined,
        annualIncomeFrom: filters.annualIncomeFrom,
        annualIncomeTo: filters.annualIncomeTo,
        heightFromFt: filters.heightFromFt,
        heightFromIn: filters.heightFromIn,
        heightToFt: filters.heightToFt,
        heightToIn: filters.heightToIn,
        city: filters.location || undefined,
        pageNumber: filters.pageNumber ?? 1,
        pageSize: filters.pageSize ?? 20,
        searchTerm: [filters.name].filter(Boolean).join(' ') || undefined,
      })
      .pipe(
        map((response) =>
          (response.items ?? []).map((p) =>
            mapListItemToSearchResult(p, (amount) => this.localeService.formatCompactCurrency(amount)),
          ),
        ),
        catchError((error) => {
          console.error('Search profiles error:', error);
          return of([]);
        }),
      );
  }

  searchProfileRecords(filters: SearchFilters): Observable<MemberRecord[]> {
    return this.searchProfiles(filters).pipe(
      map((results) => results.map((result) => convertToMemberRecord(result))),
    );
  }

  getProfiles(pageNumber = 1, pageSize = 10): Observable<ProfileListResponse> {
    return this.profileClient.getProfilesByTenant().pipe(
      map((profiles) => this.mapListItemsToListResponse(profiles ?? [], pageNumber, pageSize)),
      catchError((error) => {
        console.error('Get profiles error:', error);
        return throwError(() => error);
      }),
    );
  }

  getProfileById(profileId: number, authenticated: boolean): Observable<ProfileDetail> {
    const request$ = authenticated
      ? this.profileClient.getById(profileId)
      : this.profileClient.getPublicProfileById(profileId);

    return request$.pipe(
      map((profile) => mapProfileDetailToProfileDetail(profile)),
      catchError((error) => {
        console.error('Get profile by ID error:', error);
        return throwError(() => error);
      }),
    );
  }

  getProfileRecordById(profileId: number, authenticated = false): Observable<MemberRecord | null> {
    return this.getProfileById(profileId, authenticated).pipe(
      map((detail) => convertToMemberRecord(detail)),
      catchError(() => of(null)),
    );
  }

  getMyProfile(): Observable<ProfileDetailDto> {
    return this.profileClient.getMyProfile().pipe(
      catchError((error) => {
        console.error('Get my profile error:', error);
        return throwError(() => error);
      }),
    );
  }

  updateMyProfile(dto: CreateProfileDto): Observable<void> {
    return this.profileClient.updateMyProfile(dto).pipe(
      catchError((error) => {
        console.error('Update my profile error:', error);
        return throwError(() => error);
      }),
    );
  }

  getCurrentMember(): Observable<MemberRecord | null> {
    return this.identity.getCurrentUser().pipe(
      map((user) => ({
        id: `member-${user.id}`,
        email: user.email ?? '',
        name: user.email ?? '',
        age: undefined,
        occupation: undefined,
        location: undefined,
        createdAt: new Date().toISOString(),
        password: '',
      })),
      catchError((error) => {
        console.error('Failed to get current user:', error);
        return of(null);
      }),
    );
  }

  private mapListItemsToListResponse(
    profiles: ProfileListItemDto[],
    pageNumber: number,
    pageSize: number,
  ): ProfileListResponse {
    const mapped = profiles.map((profile) =>
      mapListItemToSearchResult(profile, (amount) => this.localeService.formatCompactCurrency(amount)),
    );

    const start = (pageNumber - 1) * pageSize;
    const paged = mapped.slice(start, start + pageSize);
    const total = mapped.length;

    return {
      profiles: paged,
      total,
      pageNumber,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize || 1)),
    };
  }
}
