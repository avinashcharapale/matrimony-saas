import { Injectable, inject } from '@angular/core';
import {
  MemberRecord,
  RegisterFormDetails,
  RegisterSubmissionPayload,
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
  genderId?: number;
  ageMin?: number;
  ageMax?: number;
  religion?: string;
  caste?: string;
  education?: string;
  educationId?: number;
  occupationId?: number;
  workingCity?: string;
  nativePlace?: string;
  maritalStatus?: string;
  annualIncomeFrom?: number;
  annualIncomeTo?: number;
  heightFromFt?: number;
  heightFromIn?: number;
  heightToFt?: number;
  heightToIn?: number;
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
  surname?: string;
  age?: number;
  bio?: string;
  locationText?: string;
  occupationText?: string;
  email: string;
  religionId?: number;
  casteId?: number;
  heightText?: string;
  thumbnailUrl?: string;
  genderId?: number;
  createdAt: string;
  createdAtDate?: string;
  dobText?: string;
  nativeDistrictName?: string;
  educationText?: string;
  occupationIncomeText?: string;
  isContactUnlocked?: boolean;
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

function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `${(amount / 10000000).toFixed(amount % 10000000 === 0 ? 0 : 1)} Cr`;
  if (amount >= 100000) return `${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1)} L`;
  return amount.toLocaleString('en-IN');
}

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
      lastName: profile.surname,
      age: profile.age,
      occupation: profile.occupationText,
      location: profile.locationText,
      bio: profile.bio,
      profileCode: profile.profileCode,
      religionId: profile.religionId,
      casteId: profile.casteId,
      heightText: profile.heightText,
      thumbnailUrl: profile.thumbnailUrl,
      genderId: profile.genderId,
      createdAt: profile.createdAt,
      createdAtDate: profile.createdAtDate,
      dobText: profile.dobText,
      nativeDistrictName: profile.nativeDistrictName,
      educationText: profile.educationText,
      occupationIncomeText: profile.occupationIncomeText,
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
        workingCity: details.professional.workingCityCountry,
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
        intercastMarriage: this.toOptionalBoolean(details.family.intercastMarriage),
        intercastRelation: details.family.intercastRelation,
      },
      relativeSurnames,
      partnerPreference: {
        expectedManglik: this.toOptionalBoolean(details.expectations.expectedManglik),
        maxAgeDifference: this.toOptionalNumber(details.expectations.maxAgeDifference),
        expectedHeightFt: this.toOptionalNumber(details.expectations.expectedHeightFt),
        expectedHeightIn: this.toOptionalNumber(details.expectations.expectedHeightIn),
        divorcee: this.toOptionalBoolean(details.expectations.divorcee),
        expectedCasteNoBar: false,
        expectedEducationNoBar: false,
        expectedOccupationNoBar: false,
      },
      profileHoroscope: {
        manglik: this.toOptionalBoolean(details.horoscope.manglik),
        birthHour: this.toOptionalNumber(details.horoscope.birthHour),
        birthMinute: this.toOptionalNumber(details.horoscope.birthMinute),
        birthPeriod: details.horoscope.birthPeriod,
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
    photos?: File[];
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

        return this.apiService.createOrUpdateProfile(payload.profile, payload.photos ?? []).pipe(
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
      return of([]);
    }

    return this.profileClient.searchPublicProfiles({
      genderId: filters.genderId,
      ageFrom: filters.ageMin,
      ageTo: filters.ageMax,
      religionId: filters.religion ? Number(filters.religion) || undefined : undefined,
      casteId: filters.caste ? Number(filters.caste) || undefined : undefined,
      educationId: filters.educationId || (filters.education ? Number(filters.education) || undefined : undefined),
      occupationId: filters.occupationId || (filters.occupation ? Number(filters.occupation) || undefined : undefined),
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
    }).pipe(
      map((response) => (response.items ?? []).map((p) => this.convertToMemberRecord(this.mapListItemToSearchResult(p)))),
      catchError((error) => {
        console.error('Search profiles error:', error);
        return of([]);
      })
    );
  }

  getProfiles(pageNumber = 1, pageSize = 10): Observable<ProfileListResponse> {
    if (!this.isAuthenticated()) {
      return of({
        profiles: [],
        total: 0,
        pageNumber,
        pageSize,
        totalPages: 0,
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
    const request$ = this.authService.isAuthenticated()
      ? this.profileClient.getById(profileId)
      : this.profileClient.getPublicProfileById(profileId);

    return request$.pipe(
      map((profile) => this.mapProfileDetailToProfileDetail(profile)),
      catchError((error) => {
        console.error('Get profile by ID error:', error);
        return throwError(() => error);
      })
    );
  }

  getMyProfile(): Observable<ProfileDetailDto> {
    return this.profileClient.getMyProfile().pipe(
      catchError((error) => {
        console.error('Get my profile error:', error);
        return throwError(() => error);
      })
    );
  }

  updateMyProfile(dto: CreateProfileDto): Observable<void> {
    return this.profileClient.updateMyProfile(dto).pipe(
      catchError((error) => {
        console.error('Update my profile error:', error);
        return throwError(() => error);
      })
    );
  }

  private mapListItemsToListResponse(
    profiles: ProfileListItemDto[],
    pageNumber: number,
    pageSize: number
  ): ProfileListResponse {
    const mapped = profiles.map((profile) => this.mapListItemToSearchResult(profile));

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

  private static readonly MONTH_MAP: Record<string, number> = {
    Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
    Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
  };

  private mapListItemToSearchResult(profile: ProfileListItemDto): ProfileSearchResult {
    const heightFt = profile.heightFt ?? undefined;
    const heightIn = profile.heightIn ?? undefined;
    const heightText = heightFt != null ? `${heightFt}'${String(heightIn ?? 0).padStart(2, '0')}"` : undefined;

    const dobDay = profile.dobDay ?? undefined;
    const dobYear = profile.dobYear ?? undefined;
    let dobMonthNum: number | undefined;
    if (typeof profile.dobMonth === 'string' && profile.dobMonth) {
      dobMonthNum = MemberService.MONTH_MAP[profile.dobMonth] ?? parseInt(profile.dobMonth, 10);
    } else if (typeof profile.dobMonth === 'number') {
      dobMonthNum = profile.dobMonth;
    }
    const dobText = dobDay != null && dobMonthNum != null && dobYear != null
      ? `${String(dobDay).padStart(2, '0')}/${String(dobMonthNum).padStart(2, '0')}/${dobYear}`
      : undefined;

    const createdAt = profile.createdAt;
    const createdAtDate = createdAt
      ? `${String(new Date(createdAt).getDate()).padStart(2, '0')}/${String(new Date(createdAt).getMonth() + 1).padStart(2, '0')}/${String(new Date(createdAt).getFullYear()).slice(2)}`
      : undefined;

    const parts: string[] = [];
    if (profile.occupationDetails) parts.push(profile.occupationDetails);
    if (profile.workingCity) parts.push(profile.workingCity);
    if (profile.workingCountryName) parts.push(profile.workingCountryName);
    const occupationIncomeText = parts.length > 0
      ? parts.join(', ') + (profile.incomeAmount ? ` / ${formatCurrency(profile.incomeAmount)}` : '')
      : profile.occupationText ?? undefined;

    return {
      profileId: profile.profileId ?? 0,
      userId: profile.profileId ?? 0,
      profileCode: profile.profileCode ?? String(profile.profileId ?? ''),
      fullName: profile.fullName ?? '',
      surname: profile.surname ?? undefined,
      age: profile.age ?? undefined,
      bio: undefined,
      locationText: profile.locationText ?? undefined,
      occupationText: profile.occupationText ?? undefined,
      email: '',
      religionId: profile.religionId ?? undefined,
      casteId: profile.casteId ?? undefined,
      heightText,
      thumbnailUrl: profile.thumbnailUrl ?? undefined,
      genderId: profile.genderId ?? undefined,
      createdAt: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
      createdAtDate,
      dobText,
      nativeDistrictName: profile.nativeDistrictName ?? undefined,
      educationText: profile.educationName ?? undefined,
      occupationIncomeText,
    };
  }

  private mapProfileDetailToProfileDetail(profile: ProfileDetailDto): ProfileDetail {
    const phones = profile.phoneNumbers ?? [];
    const contactData: Record<string, unknown> | undefined = profile.contact
      ? {
          ContactEmail: profile.contact.contactEmail ?? '',
          ResidenceAddress: profile.contact.residenceAddress ?? '',
          IdProofNumber: profile.contact.idProofNumber ?? '',
          SmsMobile: phones[0]?.phoneNumber ?? '',
          MobileSecondary: phones[1]?.phoneNumber ?? '',
        }
      : undefined;

    const pd = profile.personalDetails;
    const personal: Record<string, unknown> | undefined = pd
      ? {
          FirstName: profile.fullName?.split(' ')[0] ?? '',
          MiddleName: '',
          LastName: profile.fullName?.split(' ').slice(1).join(' ') ?? '',
          DobDay: pd.dobDay,
          DobMonth: pd.dobMonth,
          DobYear: pd.dobYear,
          GenderId: pd.genderId,
          ReligionId: pd.religionId,
          CasteId: pd.casteId,
          SubCasteId: pd.subCasteId,
          MaritalStatusId: pd.maritalStatusId,
          Gender: pd.genderName ?? '',
          Religion: pd.religionName ?? '',
          Caste: pd.casteName ?? '',
          SubCast: pd.subCasteName ?? '',
          MaritalStatus: pd.maritalStatusName ?? '',
          HeightFt: pd.heightFt,
          HeightIn: pd.heightIn,
          WeightKg: pd.weightKg,
          BloodGroup: pd.bloodGroupName ?? '',
          Complexion: pd.complexionName ?? '',
          Diet: pd.dietName ?? '',
          Personality: pd.personalityName ?? '',
          Spectacles: pd.spectacles,
          Lens: pd.lens,
          PhysicalDisability: pd.physicalDisability,
          DisabilityDetail: pd.disabilityDetail ?? '',
        }
      : undefined;

    const hd = profile.horoscope;
    const horoscope: Record<string, unknown> | undefined = hd
      ? {
          Manglik: hd.manglik,
          Rashi: hd.rashiName ?? '',
          Nakshatra: hd.nakshatraName ?? '',
          Charan: hd.charanName ?? '',
          Nadi: hd.nadiName ?? '',
          Gan: hd.ganName ?? '',
          BirthHour: hd.birthHour,
          BirthMinute: hd.birthMinute,
          BirthPeriod: hd.birthPeriod ?? '',
          BirthDistrict: hd.birthDistrictName ?? '',
          Devak: hd.devak ?? '',
        }
      : undefined;

    const cd = profile.career;
    const professional: Record<string, unknown> | undefined = cd
      ? {
          EducationArea: cd.educationAreaName ?? '',
          Education: cd.educationName ?? '',
          OccupationType: cd.occupationName ?? '',
          OccupationDetails: cd.occupationDetails ?? '',
          WorkingCityCountry: [cd.workingCity, cd.workingStateName, cd.workingCountryName].filter(Boolean).join(', '),
          IncomeAmount: cd.incomeAmount,
          IncomePeriod: cd.incomePeriodName ?? '',
        }
      : undefined;

    const fd = profile.familyInfo;
    const family: Record<string, unknown> | undefined = fd
      ? {
          FatherStatus: fd.fatherStatus,
          MotherStatus: fd.motherStatus,
          Brothers: fd.brothers,
          MarriedBrothers: fd.marriedBrothers,
          Sisters: fd.sisters,
          MarriedSisters: fd.marriedSisters,
          ParentsFullName: fd.parentsFullName ?? '',
          ParentsOccupation: fd.parentsOccupation ?? '',
          ParentsResidentCity: fd.parentsResidentCity ?? '',
          FamilyWealth: fd.familyWealth ?? '',
          MamaSurnamePlace: fd.mamaSurnamePlace ?? '',
          NativeDistrict: fd.nativeDistrictName ?? '',
          NativeTaluka: fd.nativeTalukaName ?? '',
          IntercastMarriage: fd.intercastMarriage,
          IntercastRelation: fd.intercastRelation ?? '',
          RelativesSurnames: (profile.relativeSurnames ?? []).join(', '),
        }
      : undefined;

    const pp = profile.partnerPreference;
    const expectedCities = (profile.preferredCities ?? []).join(', ');
    const expectations: Record<string, unknown> | undefined = pp
      ? {
          MaxAgeDifference: pp.maxAgeDifference,
          ExpectedHeightFt: pp.expectedHeightFt,
          ExpectedHeightIn: pp.expectedHeightIn,
          ExpectedManglik: pp.expectedManglik,
          Divorcee: pp.divorcee,
          PreferredCities: expectedCities,
          ExpectedCasteIds: profile.expectedCasteIds ?? [],
          ExpectedCasteNoBar: pp.expectedCasteNoBar ?? false,
          ExpectedEducationIds: profile.expectedEducationIds ?? [],
          ExpectedEducationNoBar: pp.expectedEducationNoBar ?? false,
          ExpectedOccupationIds: profile.expectedOccupationIds ?? [],
          ExpectedOccupationNoBar: pp.expectedOccupationNoBar ?? false,
        }
      : { PreferredCities: expectedCities };

    const photos = (profile.photos ?? []).map((p) => ({
      PhotoSlot: p.photoSlot,
      FileName: p.fileName ?? '',
      FileUrl: p.fileUrl ?? p.fileName ?? '',
      IsPrimary: p.isPrimary,
    }));

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
      isContactUnlocked: profile.isContactUnlocked ?? false,
      contact: contactData,
      personal,
      horoscope,
      professional,
      family,
      expectations,
      photos,
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
