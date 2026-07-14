import { Injectable, inject } from '@angular/core';
import {
  MemberRecord,
  RegisterFormDetails,
  RegisterSubmissionPayload,
  SAMPLE_PROFILES,
  createEmptyRegisterFormDetails,
} from '@org/models';
import { TenantService } from './tenant.service';
import { ApiService } from './api.service';
import { RegisterSyncService } from './register-sync.service';
import { ACCESS_TOKEN_KEY, AuthService, REFRESH_TOKEN_KEY } from './auth.service';
import { ProfileClient, ProfileListItemDto, ProfileDetailDto, ProfileListItemDtoPagedResult, CreateProfileDto } from '@org/generated';
import { Observable, of, throwError } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';

export type { MemberRecord } from '@org/models';

export interface SearchFilters {
  name: string;
  location: string;
  occupation: string;
  ageMin?: number;
  ageMax?: number;
  religion?: string;
  caste?: string;
  education?: string;
  maritalStatus?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface RegisterMemberResult {
  ok: boolean;
  message: string;
  profileSynced: boolean;
}

export interface ProfileSearchResult {
  profileId: number;
  userId: number;
  profileCode: string;
  fullName: string;
  age?: number;
  bio?: string;
  locationText?: string;
  occupationText?: string;
  email: string;
  createdAt: string;
}

export interface ProfileListResponse {
  profiles: ProfileSearchResult[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

interface ProfileDetail extends ProfileSearchResult {
  personal?: Record<string, unknown>;
  horoscope?: Record<string, unknown>;
  professional?: Record<string, unknown>;
  contact?: Record<string, unknown>;
  family?: Record<string, unknown>;
  expectations?: Record<string, unknown>;
  verification?: Record<string, unknown>;
  photos?: Array<Record<string, unknown>>;
}

const MEMBERS_KEY_PREFIX = 'matrimony_members';
const SESSION_KEY_PREFIX = 'matrimony_session_user';
const LEGACY_MEMBERS_KEY = 'matrimony_members';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private readonly tenantService = inject(TenantService);
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly profileClient = inject(ProfileClient);
  private readonly registerSyncService = inject(RegisterSyncService);

  private get tenantId(): string {
    return (this.tenantService.tenantHeaderId ?? this.tenantService.tenant.id ?? 'default') as string;
  }

  private get membersKey(): string {
    return `${MEMBERS_KEY_PREFIX}_${this.tenantId}`;
  }

  private get sessionKey(): string {
    return `${SESSION_KEY_PREFIX}_${this.tenantId}`;
  }

  private convertToMemberRecord(profile: ProfileSearchResult): MemberRecord {
    return {
      id: `${profile.profileId}`,
      email: profile.email,
      name: profile.fullName,
      age: profile.age,
      occupation: profile.occupationText,
      location: profile.locationText,
      bio: profile.bio,
      createdAt: profile.createdAt,
      password: '',
    };
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (!error || typeof error !== 'object' || !('error' in error)) {
      return fallback;
    }

    const payload = (error as { error?: unknown }).error;
    if (!payload || typeof payload !== 'object') {
      return fallback;
    }

    const apiError = (payload as { error?: unknown }).error;
    if (typeof apiError === 'string' && apiError.trim().length > 0) {
      return apiError;
    }

    const detail = (payload as { detail?: unknown }).detail;
    if (typeof detail === 'string' && detail.trim().length > 0) {
      return detail;
    }

    const errors = (payload as { errors?: unknown }).errors;
    if (errors && typeof errors === 'object') {
      const fieldErrors = Object.entries(errors as Record<string, unknown>)
        .flatMap(([field, value]) => {
          if (Array.isArray(value)) {
            return value
              .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
              .map((entry) => `${field}: ${entry}`);
          }
          if (typeof value === 'string' && value.trim().length > 0) {
            return [`${field}: ${value}`];
          }
          return [];
        });

      if (fieldErrors.length > 0) {
        return fieldErrors.join(' | ');
      }
    }

    const title = (payload as { title?: unknown }).title;
    if (typeof title === 'string' && title.trim().length > 0) {
      return title;
    }

    return fallback;
  }

  private computeAge(details: RegisterFormDetails): number | undefined {
    const birthYear = Number(details.personal.dobYear);
    if (!Number.isFinite(birthYear) || birthYear <= 0) {
      return undefined;
    }

    return new Date().getFullYear() - birthYear;
  }

  private toOptionalNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private toOptionalBoolean(value: unknown): boolean | undefined {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['true', '1', 'yes', 'y'].includes(normalized)) {
        return true;
      }
      if (['false', '0', 'no', 'n'].includes(normalized)) {
        return false;
      }
    }
    return undefined;
  }

  private buildProfilePayload(payload: RegisterSubmissionPayload): CreateProfileDto {
    const details = payload.registrationDetails ?? createEmptyRegisterFormDetails();
    const fullName = payload.name || [
      details.personal.firstName,
      details.personal.middleName,
      details.personal.lastName,
    ].filter(Boolean).join(' ');

    const phoneNumbers = [
      details.contact.smsMobile ? { phoneType: 'Mobile', phoneNumber: details.contact.smsMobile } : null,
      details.contact.mobileSecondary ? { phoneType: 'Mobile2', phoneNumber: details.contact.mobileSecondary } : null,
      details.contact.phonePrimary ? { phoneType: 'Phone', phoneNumber: details.contact.phonePrimary } : null,
      details.contact.phoneSecondary ? { phoneType: 'Phone2', phoneNumber: details.contact.phoneSecondary } : null,
    ].filter((p): p is { phoneType: string; phoneNumber: string } => p !== null);

    const relativeSurnames = details.family.relativesSurnames
      ? details.family.relativesSurnames.split(/[,\n]/).map((s) => s.trim()).filter(Boolean)
      : undefined;

    return {
      fullName,
      age: payload.age ?? this.computeAge(details),
      bio: payload.bio,
      locationText: payload.location || details.contact.residenceAddress || details.professional.workingCityCountry,
      occupationText: payload.occupation || details.professional.occupationDetails,
      personalDetails: {
        firstName: details.personal.firstName,
        middleName: details.personal.middleName,
        lastName: details.personal.lastName,
        dobDay: this.toOptionalNumber(details.personal.dobDay),
        dobMonth: details.personal.dobMonth,
        dobYear: this.toOptionalNumber(details.personal.dobYear),
        genderId: this.toOptionalNumber(details.personal.gender),
        religionId: this.toOptionalNumber(details.personal.religion),
        casteId: this.toOptionalNumber(details.personal.caste),
        subCasteId: this.toOptionalNumber(details.personal.subCast),
        maritalStatusId: this.toOptionalNumber(details.personal.maritalStatus),
        heightFt: this.toOptionalNumber(details.personal.heightFt),
        heightIn: this.toOptionalNumber(details.personal.heightIn),
        weightKg: this.toOptionalNumber(details.personal.weightKg),
        bloodGroupId: this.toOptionalNumber(details.personal.bloodGroup),
        complexionId: this.toOptionalNumber(details.personal.complexion),
        physicalDisability: this.toOptionalBoolean(details.personal.physicalDisability),
        disabilityDetail: details.personal.disabilityDetail,
        dietId: this.toOptionalNumber(details.personal.diet),
        spectacles: this.toOptionalBoolean(details.personal.spectacles),
        lens: this.toOptionalBoolean(details.personal.lens),
        personalityId: this.toOptionalNumber(details.personal.personality),
      },
      careerDetails: {
        educationAreaId: this.toOptionalNumber(details.professional.educationArea),
        educationId: this.toOptionalNumber(details.professional.education),
        occupationId: this.toOptionalNumber(details.professional.occupationType),
        occupationDetails: details.professional.occupationDetails,
        workingCityCountry: details.professional.workingCityCountry,
        incomeAmount: this.toOptionalNumber(details.professional.incomeAmount),
        incomePeriodId: this.toOptionalNumber(details.professional.incomePeriod),
      },
      contactDetails: {
        idProofNumber: details.contact.idProofNumber,
        residenceAddress: details.contact.residenceAddress,
        contactEmail: details.contact.contactEmail || payload.email,
      },
      phoneNumbers: phoneNumbers.length > 0 ? phoneNumbers : undefined,
      familyDetails: {
        fatherStatus: this.toOptionalBoolean(details.family.fatherStatus),
        motherStatus: this.toOptionalBoolean(details.family.motherStatus),
        brothers: this.toOptionalNumber(details.family.brothers),
        marriedBrothers: this.toOptionalNumber(details.family.marriedBrothers),
        sisters: this.toOptionalNumber(details.family.sisters),
        marriedSisters: this.toOptionalNumber(details.family.marriedSisters),
        parentsFullName: details.family.parentsFullName,
        parentsOccupation: details.family.parentsOccupation,
        parentsResidentCity: details.family.parentsResidentCity,
        familyWealth: details.family.familyWealth,
        mamaSurnamePlace: details.family.mamaSurnamePlace,
        nativeDistrict: details.family.nativeDistrict,
        nativeTaluka: details.family.nativeTaluka,
        intercastMarriage: this.toOptionalBoolean(details.family.intercastMarriage),
        intercastRelation: details.family.intercastRelation,
      },
      relativeSurnames,
      partnerPreference: {
        expectedManglik: this.toOptionalBoolean(details.expectations.expectedManglik),
        expectedCaste: details.expectations.expectedCaste,
        maxAgeDifference: this.toOptionalNumber(details.expectations.maxAgeDifference),
        expectedHeightFt: this.toOptionalNumber(details.expectations.expectedHeightFt),
        expectedHeightIn: this.toOptionalNumber(details.expectations.expectedHeightIn),
        expectedEducation: details.expectations.expectedEducation,
        expectedOccupationIncome: details.expectations.expectedOccupationIncome,
        divorcee: this.toOptionalBoolean(details.expectations.divorcee),
      },
      profileHoroscope: {
        manglik: this.toOptionalBoolean(details.horoscope.manglik),
        birthHour: this.toOptionalNumber(details.horoscope.birthHour),
        birthMinute: this.toOptionalNumber(details.horoscope.birthMinute),
        birthPeriod: details.horoscope.birthPeriod,
        birthDistrict: details.horoscope.birthDistrict,
        devak: details.horoscope.devak,
        rashiId: this.toOptionalNumber(details.horoscope.rashi),
        nakshatraId: this.toOptionalNumber(details.horoscope.nakshatra),
        charanId: this.toOptionalNumber(details.horoscope.charan),
        nadiId: this.toOptionalNumber(details.horoscope.nadi),
        ganId: this.toOptionalNumber(details.horoscope.gan),
      },
      profilePhotos: details.photos
        .filter((photo) => photo.fileName.trim().length > 0)
        .map((photo, index) => ({
          photoSlot: photo.photoSlot || index + 1,
          fileName: photo.fileName,
          isPrimary: photo.isPrimary ?? index === 0,
        })),
    };
  }

  login(email: string, password: string): Observable<{ ok: boolean; message: string }> {
    return this.authService.login(email, password).pipe(
      concatMap((result) => {
        if (!result.ok) {
          return of(result);
        }

        const session = this.authService.getSession();
        if (session?.userId) {
          localStorage.setItem(this.sessionKey, String(session.userId));
        }

        return this.processPendingProfileSync().pipe(
          map((syncResult) => {
            if (syncResult.pendingCount > 0) {
              return {
                ok: true,
                message: `Login successful. Profile sync pending for ${syncResult.pendingCount} item(s), retrying automatically.`,
              };
            }
            return { ok: true, message: 'Login successful.' };
          })
        );
      })
    );
  }

  registerWithProfile(payload: {
    email: string;
    password: string;
    confirmPassword: string;
    profile: CreateProfileDto;
    name?: string;
    age?: number;
    bio?: string;
  }): Observable<RegisterMemberResult> {
    const tenantHeaderId = Number(this.tenantService.tenantHeaderId);
    const tenantId = Number.isFinite(tenantHeaderId) && tenantHeaderId > 0 ? tenantHeaderId : undefined;

    return this.apiService.register({
      email: payload.email,
      password: payload.password,
      confirmPassword: payload.confirmPassword,
      tenantId,
    }).pipe(
      concatMap((response) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
        localStorage.setItem(this.sessionKey, response.userId.toString());

        return this.apiService.createOrUpdateProfile(payload.profile).pipe(
          map(() => ({ ok: true, message: 'Registration successful. Welcome!', profileSynced: true })),
          catchError((profileSyncError: unknown) =>
            this.registerSyncService.enqueuePendingProfileSync(
              payload.profile,
              this.getErrorMessage(profileSyncError, 'Profile sync failed.')
            ).pipe(
              map(() => ({
                ok: true,
                message: 'Account created, but profile sync to DB is pending. Please login; sync will retry automatically.',
                profileSynced: false,
              }))
            )
          )
        );
      }),
      catchError((error: unknown) =>
        of({
          ok: false,
          message: this.getErrorMessage(error, 'Registration failed. Please try again.'),
          profileSynced: false,
        })
      )
    );
  }

  registerMember(payload: RegisterSubmissionPayload): Observable<RegisterMemberResult> {
    const profilePayload = this.buildProfilePayload(payload);

    const tenantHeaderId = Number(this.tenantService.tenantHeaderId);
    const tenantId = Number.isFinite(tenantHeaderId) && tenantHeaderId > 0 ? tenantHeaderId : undefined;

    return this.apiService.register({
      email: payload.email,
      password: payload.password || '',
      confirmPassword: payload.registrationDetails?.confirmPassword || payload.password || '',
      tenantId,
    }).pipe(
      concatMap((response) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
        localStorage.setItem(this.sessionKey, response.userId.toString());

        return this.apiService.createOrUpdateProfile(profilePayload).pipe(
          map(() => ({ ok: true, message: 'Registration successful. Welcome!', profileSynced: true })),
          catchError((profileSyncError: unknown) =>
            this.registerSyncService.enqueuePendingProfileSync(
              profilePayload,
              this.getErrorMessage(profileSyncError, 'Profile sync failed.')
            ).pipe(
              map(() => ({
                ok: true,
                message: 'Account created, but profile sync to DB is pending. Please login; sync will retry automatically.',
                profileSynced: false,
              }))
            )
          )
        );
      }),
      catchError((error: unknown) =>
        of({
          ok: false,
          message: this.getErrorMessage(error, 'Registration failed. Please try again.'),
          profileSynced: false,
        })
      )
    );
  }

  processPendingProfileSync(): Observable<{ syncedCount: number; pendingCount: number }> {
    return this.registerSyncService.processPendingProfileSync((error, fallback) =>
      this.getErrorMessage(error, fallback)
    );
  }

  logout(): Observable<void> {
    return this.authService.logout().pipe(
      map(() => {
        localStorage.removeItem(this.sessionKey);
        return void 0;
      })
    );
  }

  getCurrentMember(): Observable<MemberRecord | null> {
    if (!this.isAuthenticated()) {
      return of(null);
    }

    return this.apiService.getCurrentUser().pipe(
      map((user: any) => ({
        id: `member-${user.id}`,
        email: user.email,
        name: user.name || user.email,
        age: undefined,
        occupation: undefined,
        location: undefined,
        createdAt: new Date().toISOString(),
        password: '',
      })),
      catchError((error) => {
        console.error('Failed to get current user:', error);
        return of(null);
      })
    );
  }

  searchProfiles(filters: SearchFilters): Observable<MemberRecord[]> {
    if (!this.isAuthenticated()) {
      return of(this.searchProfilesLocal(filters));
    }

    return this.profileClient.searchPublicProfiles({
      ageFrom: filters.ageMin,
      ageTo: filters.ageMax,
      religionId: filters.religion ? undefined : undefined,
      casteId: filters.caste ? undefined : undefined,
      maritalStatusId: filters.maritalStatus ? undefined : undefined,
      city: filters.location || undefined,
      pageNumber: filters.pageNumber ?? 1,
      pageSize: filters.pageSize ?? 20,
      searchTerm: filters.name || undefined,
    }).pipe(
      map((response) => (response.items ?? []).map((p) => this.convertToMemberRecord(this.mapListItemToSearchResult(p)))),
      catchError((error) => {
        console.error('Search profiles error:', error);
        return of(this.searchProfilesLocal(filters));
      })
    );
  }

  getProfiles(pageNumber = 1, pageSize = 10): Observable<ProfileListResponse> {
    if (!this.isAuthenticated()) {
      const profiles = SAMPLE_PROFILES.slice(0, pageSize).map((p) => ({
        profileId: parseInt(p.id.split('-')[1] || '0', 10),
        userId: parseInt(p.id.split('-')[1] || '0', 10),
        profileCode: p.id,
        fullName: p.name,
        age: p.age,
        bio: p.bio,
        locationText: p.location,
        occupationText: p.occupation,
        email: p.email,
        createdAt: p.createdAt,
      }));
      return of({
        profiles,
        total: SAMPLE_PROFILES.length,
        pageNumber,
        pageSize,
        totalPages: Math.ceil(SAMPLE_PROFILES.length / pageSize),
      });
    }

    return this.profileClient.getProfilesByTenant().pipe(
      map((profiles) => this.mapListItemsToListResponse(profiles ?? [], pageNumber, pageSize)),
      catchError((error) => {
        console.error('Get profiles error:', error);
        return throwError(() => error);
      })
    );
  }

  getProfileById(profileId: number): Observable<ProfileDetail> {
    return this.profileClient.getPublicProfileById(profileId).pipe(
      map((profile) => this.mapProfileDetailToProfileDetail(profile)),
      catchError((error) => {
        console.error('Get profile by ID error:', error);
        return throwError(() => error);
      })
    );
  }

  private searchProfilesLocal(filters: SearchFilters): MemberRecord[] {
    const source = [...this.getMembers(), ...SAMPLE_PROFILES];
    const unique = source.filter(
      (item, index, arr) => arr.findIndex((x) => x.email.toLowerCase() === item.email.toLowerCase()) === index,
    );

    return unique.filter((item) => {
      const nameMatch = !filters.name || item.name.toLowerCase().includes(filters.name.toLowerCase());
      const locationMatch =
        !filters.location || (item.location ?? '').toLowerCase().includes(filters.location.toLowerCase());
      const occupationMatch =
        !filters.occupation || (item.occupation ?? '').toLowerCase().includes(filters.occupation.toLowerCase());
      return nameMatch && locationMatch && occupationMatch;
    });
  }

  private mapListItemsToListResponse(
    profiles: ProfileListItemDto[],
    pageNumber: number,
    pageSize: number
  ): ProfileListResponse {
    const mapped = profiles.map((profile) => ({
      profileId: profile.profileId ?? 0,
      userId: profile.profileId ?? 0,
      profileCode: String(profile.profileId ?? ''),
      fullName: profile.fullName ?? '',
      age: profile.age ?? undefined,
      bio: undefined,
      locationText: profile.locationText ?? undefined,
      occupationText: profile.occupationText ?? undefined,
      email: '',
      createdAt: new Date().toISOString(),
    }));

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

  private mapListItemToSearchResult(profile: ProfileListItemDto): ProfileSearchResult {
    return {
      profileId: profile.profileId ?? 0,
      userId: profile.profileId ?? 0,
      profileCode: String(profile.profileId ?? ''),
      fullName: profile.fullName ?? '',
      age: profile.age ?? undefined,
      bio: undefined,
      locationText: profile.locationText ?? undefined,
      occupationText: profile.occupationText ?? undefined,
      email: '',
      createdAt: new Date().toISOString(),
    };
  }

  private mapProfileDetailToProfileDetail(profile: ProfileDetailDto): ProfileDetail {
    return {
      profileId: profile.profileId ?? 0,
      userId: profile.profileId ?? 0,
      profileCode: String(profile.profileCode ?? profile.profileId ?? ''),
      fullName: profile.fullName ?? '',
      age: profile.age ?? undefined,
      bio: profile.bio ?? undefined,
      locationText: profile.locationText ?? undefined,
      occupationText: profile.occupationText ?? undefined,
      email: '',
      createdAt: new Date().toISOString(),
    };
  }

  private getMembers(): MemberRecord[] {
    try {
      const scopedRaw = localStorage.getItem(this.membersKey);
      if (scopedRaw) {
        return JSON.parse(scopedRaw) as MemberRecord[];
      }

      const legacyRaw = localStorage.getItem(LEGACY_MEMBERS_KEY);
      if (legacyRaw) {
        localStorage.setItem(this.membersKey, legacyRaw);
        return JSON.parse(legacyRaw) as MemberRecord[];
      }

      return [];
    } catch {
      return [];
    }
  }

  updateCurrentMember(partial: Partial<MemberRecord>): { ok: boolean; message: string } {
    const members = this.getMembers();
    const sessionId = localStorage.getItem(this.sessionKey);

    if (!sessionId) {
      return { ok: false, message: 'Please login first.' };
    }

    const index = members.findIndex((m) => m.id === sessionId);
    if (index === -1) {
      return { ok: false, message: 'Member not found.' };
    }

    members[index] = { ...members[index], ...partial };
    localStorage.setItem(this.membersKey, JSON.stringify(members));
    return { ok: true, message: 'Profile updated successfully.' };
  }
}
