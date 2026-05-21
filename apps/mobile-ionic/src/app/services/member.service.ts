import { Injectable, inject } from '@angular/core';
import { MemberRecord, RegisterFormDetails, SAMPLE_PROFILES } from '@org/models';
import { TenantService } from './tenant.service';

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
}