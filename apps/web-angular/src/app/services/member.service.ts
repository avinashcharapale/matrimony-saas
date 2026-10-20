import { Injectable, inject } from '@angular/core';
import { MemberRecord, RegisterSubmissionPayload } from '@org/models';
import { TenantService } from './tenant.service';
import { ApiService } from './api.service';
import { RegisterSyncService } from './register-sync.service';
import { ACCESS_TOKEN_KEY, AuthService, REFRESH_TOKEN_KEY } from './auth.service';
import { CreateProfileDto, ProfileDetailDto } from '@org/generated';
import { Observable, of } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import { MemberFacade } from '@org/data-access-profile';
import { buildProfilePayload, getErrorMessage } from '@org/data-access-registration';
import type {
  ProfileDetail,
  ProfileListResponse,
  RegisterMemberResult,
  SearchFilters,
} from '@org/data-access-profile';

export type { MemberRecord } from '@org/models';
export type {
  ProfileDetail,
  ProfileListResponse,
  ProfileSearchResult,
  RegisterMemberResult,
  SearchFilters,
} from '@org/data-access-profile';

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
  private readonly registerSyncService = inject(RegisterSyncService);
  private readonly memberFacade = inject(MemberFacade);

  private get tenantId(): string {
    return (this.tenantService.tenantHeaderId ?? this.tenantService.tenant.id ?? 'default') as string;
  }

  private get membersKey(): string {
    return `${MEMBERS_KEY_PREFIX}_${this.tenantId}`;
  }

  private get sessionKey(): string {
    return `${SESSION_KEY_PREFIX}_${this.tenantId}`;
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
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
          }),
        );
      }),
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

    return this.apiService
      .register({
        email: payload.email,
        password: payload.password,
        confirmPassword: payload.confirmPassword,
        tenantId,
      })
      .pipe(
        concatMap((response) => {
          localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
          localStorage.setItem(this.sessionKey, response.userId.toString());

          return this.apiService.createOrUpdateProfile(payload.profile, payload.photos ?? []).pipe(
            map(() => ({ ok: true, message: 'Registration successful. Welcome!', profileSynced: true })),
            catchError((profileSyncError: unknown) =>
              this.registerSyncService
                .enqueuePendingProfileSync(payload.profile, getErrorMessage(profileSyncError, 'Profile sync failed.'))
                .pipe(
                  map(() => ({
                    ok: true,
                    message:
                      'Account created, but profile sync to DB is pending. Please login; sync will retry automatically.',
                    profileSynced: false,
                  })),
                ),
            ),
          );
        }),
        catchError((error: unknown) =>
          of({
            ok: false,
            message: getErrorMessage(error, 'Registration failed. Please try again.'),
            profileSynced: false,
          }),
        ),
      );
  }

  registerMember(payload: RegisterSubmissionPayload): Observable<RegisterMemberResult> {
    const profilePayload = buildProfilePayload(payload);

    const tenantHeaderId = Number(this.tenantService.tenantHeaderId);
    const tenantId = Number.isFinite(tenantHeaderId) && tenantHeaderId > 0 ? tenantHeaderId : undefined;

    return this.apiService
      .register({
        email: payload.email,
        password: payload.password || '',
        confirmPassword: payload.registrationDetails?.confirmPassword || payload.password || '',
        tenantId,
      })
      .pipe(
        concatMap((response) => {
          localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
          localStorage.setItem(this.sessionKey, response.userId.toString());

          return this.apiService.createOrUpdateProfile(profilePayload).pipe(
            map(() => ({ ok: true, message: 'Registration successful. Welcome!', profileSynced: true })),
            catchError((profileSyncError: unknown) =>
              this.registerSyncService
                .enqueuePendingProfileSync(profilePayload, getErrorMessage(profileSyncError, 'Profile sync failed.'))
                .pipe(
                  map(() => ({
                    ok: true,
                    message:
                      'Account created, but profile sync to DB is pending. Please login; sync will retry automatically.',
                    profileSynced: false,
                  })),
                ),
            ),
          );
        }),
        catchError((error: unknown) =>
          of({
            ok: false,
            message: getErrorMessage(error, 'Registration failed. Please try again.'),
            profileSynced: false,
          }),
        ),
      );
  }

  processPendingProfileSync(): Observable<{ syncedCount: number; pendingCount: number }> {
    return this.registerSyncService.processPendingProfileSync((error, fallback) =>
      getErrorMessage(error, fallback),
    );
  }

  logout(): Observable<void> {
    return this.authService.logout().pipe(
      map(() => {
        localStorage.removeItem(this.sessionKey);
        return void 0;
      }),
    );
  }

  getCurrentMember(): Observable<MemberRecord | null> {
    if (!this.isAuthenticated()) {
      return of(null);
    }

    return this.memberFacade.getCurrentMember();
  }

  searchProfiles(filters: SearchFilters): Observable<MemberRecord[]> {
    if (!this.isAuthenticated()) {
      return of([]);
    }

    return this.memberFacade.searchProfileRecords(filters);
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

    return this.memberFacade.getProfiles(pageNumber, pageSize);
  }

  getProfileById(profileId: number): Observable<ProfileDetail> {
    return this.memberFacade.getProfileById(profileId, this.authService.isAuthenticated());
  }

  getMyProfile(): Observable<ProfileDetailDto> {
    return this.memberFacade.getMyProfile();
  }

  updateMyProfile(dto: CreateProfileDto): Observable<void> {
    return this.memberFacade.updateMyProfile(dto);
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
