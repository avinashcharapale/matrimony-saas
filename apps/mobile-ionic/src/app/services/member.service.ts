import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { MemberRecord, RegisterFormDetails, SAMPLE_PROFILES, createEmptyRegisterFormDetails } from '@org/models';
import { TenantService } from './tenant.service';
import { ProfileDetailDto } from '@org/generated';

export type { MemberRecord, RegisterFormDetails } from '@org/models';

export interface SearchFilters {
  name: string;
  location: string;
  occupation: string;
}

const MEMBERS_KEY_PREFIX = 'matrimony_members';
const SESSION_KEY_PREFIX = 'matrimony_session_user';
const LEGACY_MEMBERS_KEY = 'matrimony_members';
const LEGACY_SESSION_KEY = 'matrimony_session_user';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private readonly tenantService = inject(TenantService);
  private readonly http = inject(HttpClient);

  private get tenantId(): string {
    return this.tenantService.tenant.id || 'default';
  }

  private get membersKey(): string {
    return `${MEMBERS_KEY_PREFIX}_${this.tenantId}`;
  }

  private get sessionKey(): string {
    return `${SESSION_KEY_PREFIX}_${this.tenantId}`;
  }

  getMembers(): MemberRecord[] {
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

  registerMember(payload: Omit<MemberRecord, 'id' | 'createdAt'>): { ok: boolean; message: string } {
    const members = this.getMembers();
    const exists = members.some((member) => member.email.toLowerCase() === payload.email.toLowerCase());
    if (exists) {
      return { ok: false, message: 'Email already registered. Please login instead.' };
    }

    const next: MemberRecord = {
      ...payload,
      id: `member-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(this.membersKey, JSON.stringify([next, ...members]));
    return { ok: true, message: 'Registration successful. Please login.' };
  }

  login(email: string, password: string): { ok: boolean; message: string } {
    const member = this.getMembers().find(
      (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password,
    );

    if (!member) {
      return { ok: false, message: 'Invalid email or password.' };
    }

    localStorage.setItem(this.sessionKey, member.id);
    return { ok: true, message: 'Login successful.' };
  }

  logout(): void {
    localStorage.removeItem(this.sessionKey);
  }

  getCurrentMember(): MemberRecord | null {
    let sessionUserId = localStorage.getItem(this.sessionKey);
    if (!sessionUserId) {
      const legacySessionUserId = localStorage.getItem(LEGACY_SESSION_KEY);
      if (legacySessionUserId) {
        localStorage.setItem(this.sessionKey, legacySessionUserId);
        sessionUserId = legacySessionUserId;
      }
    }

    if (!sessionUserId) {
      return null;
    }

    return this.getMembers().find((member) => member.id === sessionUserId) ?? null;
  }

  updateCurrentMember(partial: Partial<MemberRecord>): { ok: boolean; message: string } {
    const current = this.getCurrentMember();
    if (!current) {
      return { ok: false, message: 'Please login first.' };
    }

    const updated = { ...current, ...partial };
    const allMembers = this.getMembers().map((member) => (member.id === updated.id ? updated : member));
    localStorage.setItem(this.membersKey, JSON.stringify(allMembers));
    return { ok: true, message: 'Profile updated successfully.' };
  }

  searchProfiles(filters: SearchFilters): MemberRecord[] {
    const source = [...this.getMembers(), ...SAMPLE_PROFILES];
    const unique = source.filter(
      (item, index, arr) => arr.findIndex((candidate) => candidate.email.toLowerCase() === item.email.toLowerCase()) === index,
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

  getProfileById(profileId: string): MemberRecord | null {
    const source = [...this.getMembers(), ...SAMPLE_PROFILES];
    return source.find((item) => item.id === profileId) ?? null;
  }

  getProfileByIdFromApi(profileId: number): Observable<MemberRecord | null> {
    return this.http.get<ProfileDetailDto>(`/api/UserProfiles/public/${profileId}`).pipe(
      map((dto) => this.mapDtoToMemberRecord(dto)),
      catchError(() => of(null)),
    );
  }

  private mapDtoToMemberRecord(dto: ProfileDetailDto): MemberRecord {
    const pd = dto.personalDetails;
    const photos = (dto.photos ?? []).map((p) => ({
      photoSlot: p.photoSlot ?? 0,
      fileName: p.fileName ?? '',
      fileUrl: p.fileUrl ?? p.fileName ?? '',
      isPrimary: p.isPrimary ?? false,
    }));

    return {
      id: `${dto.profileId ?? 0}`,
      profileCode: dto.profileCode ?? String(dto.profileId ?? ''),
      email: dto.contact?.contactEmail ?? '',
      name: dto.fullName ?? '',
      age: dto.age ?? undefined,
      occupation: dto.occupationText ?? undefined,
      location: dto.locationText ?? undefined,
      bio: dto.bio ?? undefined,
      createdAt: dto.lastActiveAt ?? new Date().toISOString(),
      password: '',
      registrationDetails: {
        ...createEmptyRegisterFormDetails(),
        personal: {
          firstName: dto.fullName?.split(' ')[0] ?? '',
          middleName: '',
          lastName: dto.fullName?.split(' ').slice(1).join(' ') ?? '',
          dobDay: `${pd?.dobDay ?? ''}`,
          dobMonth: pd?.dobMonth ?? '',
          dobYear: `${pd?.dobYear ?? ''}`,
          gender: `${pd?.genderId ?? ''}`,
          religion: pd?.religionName ?? '',
          caste: pd?.casteName ?? '',
          subCast: pd?.subCasteName ?? '',
          maritalStatus: pd?.maritalStatusName ?? '',
          heightFt: `${pd?.heightFt ?? ''}`,
          heightIn: `${pd?.heightIn ?? ''}`,
          weightKg: `${pd?.weightKg ?? ''}`,
          bloodGroup: pd?.bloodGroupName ?? '',
          complexion: pd?.complexionName ?? '',
          physicalDisability: pd?.physicalDisability ? 'Yes' : 'No',
          disabilityDetail: pd?.disabilityDetail ?? '',
          diet: pd?.dietName ?? '',
          spectacles: pd?.spectacles ? 'Yes' : 'No',
          lens: pd?.lens ? 'Yes' : 'No',
          personality: pd?.personalityName ?? '',
        },
        horoscope: {
          manglik: dto.horoscope?.manglik ? 'Yes' : 'No',
          rashi: dto.horoscope?.rashiName ?? '',
          nakshatra: dto.horoscope?.nakshatraName ?? '',
          charan: dto.horoscope?.charanName ?? '',
          nadi: dto.horoscope?.nadiName ?? '',
          gan: dto.horoscope?.ganName ?? '',
          birthHour: `${dto.horoscope?.birthHour ?? ''}`,
          birthMinute: `${dto.horoscope?.birthMinute ?? ''}`,
          birthPeriod: dto.horoscope?.birthPeriod ?? '',
          birthDistrict: dto.horoscope?.birthDistrictName ?? '',
          devak: dto.horoscope?.devak ?? '',
        },
        professional: {
          educationArea: dto.career?.educationAreaName ?? '',
          education: dto.career?.educationName ?? '',
          occupationType: dto.career?.occupationName ?? '',
          occupationDetails: dto.career?.occupationDetails ?? '',
          workingCityCountry: [dto.career?.workingCity, dto.career?.workingStateName, dto.career?.workingCountryName].filter(Boolean).join(', '),
          incomeAmount: `${dto.career?.incomeAmount ?? ''}`,
          incomePeriod: dto.career?.incomePeriodName ?? '',
        },
        contact: {
          idProofNumber: dto.contact?.idProofNumber ?? '',
          residenceAddress: dto.contact?.residenceAddress ?? '',
          contactEmail: dto.contact?.contactEmail ?? '',
          smsMobile: dto.phoneNumbers?.[0]?.phoneNumber ?? '',
          mobileSecondary: dto.phoneNumbers?.[1]?.phoneNumber ?? '',
          phonePrimary: dto.phoneNumbers?.[2]?.phoneNumber ?? '',
          phoneSecondary: dto.phoneNumbers?.[3]?.phoneNumber ?? '',
        },
        family: {
          fatherStatus: dto.familyInfo?.fatherStatus ? 'Yes' : 'No',
          motherStatus: dto.familyInfo?.motherStatus ? 'Yes' : 'No',
          brothers: `${dto.familyInfo?.brothers ?? ''}`,
          marriedBrothers: `${dto.familyInfo?.marriedBrothers ?? ''}`,
          sisters: `${dto.familyInfo?.sisters ?? ''}`,
          marriedSisters: `${dto.familyInfo?.marriedSisters ?? ''}`,
          parentsFullName: dto.familyInfo?.parentsFullName ?? '',
          parentsOccupation: dto.familyInfo?.parentsOccupation ?? '',
          parentsResidentCity: dto.familyInfo?.parentsResidentCity ?? '',
          relativesSurnames: (dto.relativeSurnames ?? []).join(', '),
          familyWealth: dto.familyInfo?.familyWealth ?? '',
          mamaSurnamePlace: dto.familyInfo?.mamaSurnamePlace ?? '',
          nativeDistrict: dto.familyInfo?.nativeDistrictName ?? '',
          nativeTaluka: dto.familyInfo?.nativeTalukaName ?? '',
          intercastMarriage: dto.familyInfo?.intercastMarriage ? 'Yes' : 'No',
          intercastRelation: dto.familyInfo?.intercastRelation ?? '',
        },
        expectations: {
          preferredCities: (dto.preferredCities ?? []).join(', '),
          expectedManglik: dto.partnerPreference?.expectedManglik ? 'Yes' : 'No',
          expectedCaste: '',
          maxAgeDifference: `${dto.partnerPreference?.maxAgeDifference ?? ''}`,
          expectedHeightFt: `${dto.partnerPreference?.expectedHeightFt ?? ''}`,
          expectedHeightIn: `${dto.partnerPreference?.expectedHeightIn ?? ''}`,
          expectedEducation: '',
          expectedOccupationIncome: '',
          divorcee: dto.partnerPreference?.divorcee ? 'Yes' : 'No',
        },
        photos,
      },
    };
  }
}