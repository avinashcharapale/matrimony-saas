import { Injectable, inject } from '@angular/core';
import {
  MemberRecord,
  RegisterFormDetails,
  RegisterSubmissionPayload,
  SAMPLE_PROFILES,
  createEmptyRegisterFormDetails,
} from '@org/models';
import { TenantService } from './tenant.service';
import { ApiService, ProfileListResponse, ProfileSearchResult, ProfileUpsertRequest } from './api.service';
import { RegisterSyncService } from './register-sync.service';
import { firstValueFrom } from 'rxjs';

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

const MEMBERS_KEY_PREFIX = 'matrimony_members';
const SESSION_KEY_PREFIX = 'matrimony_session_user';
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const LEGACY_MEMBERS_KEY = 'matrimony_members';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private readonly tenantService = inject(TenantService);
  private readonly apiService = inject(ApiService);
  private readonly registerSyncService = inject(RegisterSyncService);

  private get tenantId(): string {
    return this.tenantService.tenant.id || 'default';
  }

  private get membersKey(): string {
    return `${MEMBERS_KEY_PREFIX}_${this.tenantId}`;
  }

  private get sessionKey(): string {
    return `${SESSION_KEY_PREFIX}_${this.tenantId}`;
  }

  /**
   * Convert ProfileSearchResult to MemberRecord format for UI compatibility
   */
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
      password: '', // Not available from API
    };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === 'object' && 'error' in error) {
      const apiError = (error as { error?: { error?: string } }).error?.error;
      if (typeof apiError === 'string' && apiError.trim().length > 0) {
        return apiError;
      }
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

  private buildProfilePayload(payload: RegisterSubmissionPayload): ProfileUpsertRequest {
    const details = payload.registrationDetails ?? createEmptyRegisterFormDetails();
    const fullName = payload.name || [
      details.personal.firstName,
      details.personal.middleName,
      details.personal.lastName,
    ].filter(Boolean).join(' ');

    return {
      fullName,
      age: payload.age ?? this.computeAge(details),
      bio: payload.bio,
      locationText: payload.location || details.contact.residenceAddress || details.professional.workingCityCountry,
      occupationText: payload.occupation || details.professional.occupationDetails,
      personal: {
        firstName: details.personal.firstName,
        middleName: details.personal.middleName,
        lastName: details.personal.lastName,
        dobDay: details.personal.dobDay,
        dobMonth: details.personal.dobMonth,
        dobYear: details.personal.dobYear,
        gender: details.personal.gender,
        religion: details.personal.religion,
        caste: details.personal.caste,
        subCast: details.personal.subCast,
        maritalStatus: details.personal.maritalStatus,
        heightFt: details.personal.heightFt,
        heightIn: details.personal.heightIn,
        weightKg: details.personal.weightKg,
        bloodGroup: details.personal.bloodGroup,
        complexion: details.personal.complexion,
        physicalDisability: details.personal.physicalDisability,
        disabilityDetail: details.personal.disabilityDetail,
        diet: details.personal.diet,
        spectacles: details.personal.spectacles,
        lens: details.personal.lens,
        personality: details.personal.personality,
      },
      horoscope: {
        manglik: details.horoscope.manglik,
        rashi: details.horoscope.rashi,
        nakshatra: details.horoscope.nakshatra,
        charan: details.horoscope.charan,
        nadi: details.horoscope.nadi,
        gan: details.horoscope.gan,
        birthHour: details.horoscope.birthHour,
        birthMinute: details.horoscope.birthMinute,
        birthPeriod: details.horoscope.birthPeriod,
        birthDistrict: details.horoscope.birthDistrict,
        devak: details.horoscope.devak,
      },
      professional: {
        educationArea: details.professional.educationArea,
        education: details.professional.education,
        occupationType: details.professional.occupationType,
        occupationDetails: details.professional.occupationDetails,
        workingCityCountry: details.professional.workingCityCountry,
        incomeAmount: details.professional.incomeAmount,
        incomePeriod: details.professional.incomePeriod,
      },
      contact: {
        idProofNumber: details.contact.idProofNumber,
        residenceAddress: details.contact.residenceAddress,
        contactEmail: details.contact.contactEmail || payload.email,
        smsMobile: details.contact.smsMobile,
        mobileSecondary: details.contact.mobileSecondary,
        phonePrimary: details.contact.phonePrimary,
        phoneSecondary: details.contact.phoneSecondary,
      },
      family: {
        fatherStatus: details.family.fatherStatus,
        motherStatus: details.family.motherStatus,
        brothers: details.family.brothers,
        marriedBrothers: details.family.marriedBrothers,
        sisters: details.family.sisters,
        marriedSisters: details.family.marriedSisters,
        parentsFullName: details.family.parentsFullName,
        parentsOccupation: details.family.parentsOccupation,
        parentsResidentCity: details.family.parentsResidentCity,
        relativesSurnames: details.family.relativesSurnames,
        familyWealth: details.family.familyWealth,
        mamaSurnamePlace: details.family.mamaSurnamePlace,
        nativeDistrict: details.family.nativeDistrict,
        nativeTaluka: details.family.nativeTaluka,
        intercastMarriage: details.family.intercastMarriage,
        intercastRelation: details.family.intercastRelation,
      },
      expectations: {
        preferredCities: details.expectations.preferredCities,
        expectedManglik: details.expectations.expectedManglik,
        expectedCaste: details.expectations.expectedCaste,
        maxAgeDifference: details.expectations.maxAgeDifference,
        expectedHeightFt: details.expectations.expectedHeightFt,
        expectedHeightIn: details.expectations.expectedHeightIn,
        expectedEducation: details.expectations.expectedEducation,
        expectedOccupationIncome: details.expectations.expectedOccupationIncome,
        divorcee: details.expectations.divorcee,
      },
      verification: {
        verificationCode: details.verification.verificationCode,
        verificationInput: details.verification.verificationInput,
        verificationPassed:
          details.verification.verificationCode.length > 0 &&
          details.verification.verificationCode === details.verification.verificationInput,
      },
      photos: details.photos
        .filter((photo) => photo.fileName.trim().length > 0)
        .map((photo, index) => ({
          photoSlot: photo.photoSlot || index + 1,
          fileName: photo.fileName,
          isPrimary: photo.isPrimary ?? index === 0,
        })),
    };
  }

  /**
   * Login via API
   */
  async login(email: string, password: string): Promise<{ ok: boolean; message: string }> {
    try {
      const response = await firstValueFrom(
        this.apiService.login({ email, password })
      );

      // Store tokens
      localStorage.setItem(AUTH_TOKEN_KEY, response.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      localStorage.setItem(this.sessionKey, response.userId.toString());

      const syncResult = await this.processPendingProfileSync();
      if (syncResult.pendingCount > 0) {
        return {
          ok: true,
          message: `Login successful. Profile sync pending for ${syncResult.pendingCount} item(s), retrying automatically.`,
        };
      }

      return { ok: true, message: 'Login successful.' };
    } catch (error: unknown) {
      const message = this.getErrorMessage(error, 'Invalid email or password.');
      return { ok: false, message };
    }
  }

  /**
   * Register via API
   */
  async registerMember(payload: RegisterSubmissionPayload): Promise<RegisterMemberResult> {
    const profilePayload = this.buildProfilePayload(payload);

    try {
      const tenantHeaderId = Number(this.tenantService.tenantHeaderId);
      const tenantId = Number.isFinite(tenantHeaderId) && tenantHeaderId > 0 ? tenantHeaderId : undefined;

      const response = await firstValueFrom(
        this.apiService.register({
          email: payload.email,
          password: payload.password || '',
          confirmPassword: payload.registrationDetails?.confirmPassword || payload.password || '',
          tenantId,
        })
      );

      // Store tokens
      localStorage.setItem(AUTH_TOKEN_KEY, response.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      localStorage.setItem(this.sessionKey, response.userId.toString());

      try {
        await firstValueFrom(this.apiService.createOrUpdateProfile(profilePayload));
        return {
          ok: true,
          message: 'Registration successful. Welcome!',
          profileSynced: true,
        };
      } catch (profileSyncError: unknown) {
        await this.registerSyncService.enqueuePendingProfileSync(
          profilePayload,
          this.getErrorMessage(profileSyncError, 'Profile sync failed.')
        );

        return {
          ok: true,
          message: 'Account created, but profile sync to DB is pending. Please login; sync will retry automatically.',
          profileSynced: false,
        };
      }
    } catch (error: unknown) {
      const message = this.getErrorMessage(error, 'Registration failed. Please try again.');
      return { ok: false, message, profileSynced: false };
    }
  }

  async processPendingProfileSync(): Promise<{ syncedCount: number; pendingCount: number }> {
    return this.registerSyncService.processPendingProfileSync((error, fallback) =>
      this.getErrorMessage(error, fallback)
    );
  }

  /**
   * Logout via API
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await firstValueFrom(this.apiService.logout(refreshToken));
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local tokens
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.sessionKey);
    }
  }

  /**
   * Get current user info
   */
  async getCurrentMember(): Promise<MemberRecord | null> {
    if (!this.isAuthenticated()) {
      return null;
    }

    try {
      const user = await firstValueFrom(this.apiService.getCurrentUser());
      return {
        id: `member-${user.id}`,
        email: user.email,
        name: user.name || user.email,
        age: undefined,
        occupation: undefined,
        location: undefined,
        createdAt: new Date().toISOString(),
        password: '',
      };
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Search profiles via API
   */
  async searchProfiles(filters: SearchFilters): Promise<MemberRecord[]> {
    try {
      if (!this.isAuthenticated()) {
        // Fallback to sample profiles if not authenticated
        return this.searchProfilesLocal(filters);
      }

      const response = await firstValueFrom(
        this.apiService.searchProfiles({
          name: filters.name,
          location: filters.location,
          occupation: filters.occupation,
          ageMin: filters.ageMin,
          ageMax: filters.ageMax,
          religion: filters.religion,
          caste: filters.caste,
          education: filters.education,
          maritalStatus: filters.maritalStatus,
          pageNumber: 1,
          pageSize: 20,
        })
      );

      return response.profiles.map(p => this.convertToMemberRecord(p));
    } catch (error) {
      console.error('Search profiles error:', error);
      // Fallback to sample profiles
      return this.searchProfilesLocal(filters);
    }
  }

  /**
   * Get all profiles (with pagination)
   */
  async getProfiles(pageNumber = 1, pageSize = 10): Promise<ProfileListResponse> {
    try {
      if (!this.isAuthenticated()) {
        // Fallback: return sample profiles
        const profiles = SAMPLE_PROFILES.slice(0, pageSize).map(p => ({
          profileId: parseInt(p.id.split('-')[1] || '0'),
          userId: parseInt(p.id.split('-')[1] || '0'),
          profileCode: p.id,
          fullName: p.name,
          age: p.age,
          bio: p.bio,
          locationText: p.location,
          occupationText: p.occupation,
          email: p.email,
          createdAt: p.createdAt,
        }));
        return {
          profiles,
          total: SAMPLE_PROFILES.length,
          pageNumber,
          pageSize,
          totalPages: Math.ceil(SAMPLE_PROFILES.length / pageSize),
        };
      }

      return await firstValueFrom(
        this.apiService.getProfiles({ pageNumber, pageSize })
      );
    } catch (error) {
      console.error('Get profiles error:', error);
      throw error;
    }
  }

  /**
   * Get profile by ID
   */
  async getProfileById(profileId: number) {
    try {
      return await firstValueFrom(this.apiService.getProfileById(profileId));
    } catch (error) {
      console.error('Get profile by ID error:', error);
      throw error;
    }
  }

  /**
   * Local search (fallback)
   */
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

  /**
   * Get members from localStorage (legacy)
   */
  private getMembers(): MemberRecord[] {
    try {
      const scopedRaw = localStorage.getItem(this.membersKey);
      if (scopedRaw) {
        return JSON.parse(scopedRaw) as MemberRecord[];
      }

      // One-time fallback to legacy non-tenant storage.
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

  /**
   * Update current member (legacy)
   */
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
