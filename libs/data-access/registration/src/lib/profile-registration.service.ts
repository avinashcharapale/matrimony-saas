import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CreateProfileDto, ProfileClient } from '@org/generated';
import { RegisterSubmissionPayload } from '@org/models';
import { RegisterSyncService } from './register-sync.service';
import { buildProfilePayload, getErrorMessage } from './profile-payload';

export interface RegisterMemberResult {
  ok: boolean;
  message: string;
  profileSynced: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileRegistrationService {
  private readonly profileClient = inject(ProfileClient);
  private readonly registerSyncService = inject(RegisterSyncService);

  buildProfilePayload(payload: RegisterSubmissionPayload): CreateProfileDto {
    return buildProfilePayload(payload);
  }

  createMemberProfile(
    payload: RegisterSubmissionPayload,
    photos: File[] = [],
  ): Observable<RegisterMemberResult> {
    const profilePayload = this.buildProfilePayload(payload);

    return this.profileClient.create(profilePayload, photos).pipe(
      map(() => ({ ok: true, message: 'Registration successful. Welcome!', profileSynced: true })),
      catchError((profileSyncError: unknown) =>
        this.registerSyncService.enqueuePendingProfileSync(
          profilePayload,
          getErrorMessage(profileSyncError, 'Profile sync failed.')
        ).pipe(
          map(() => ({
            ok: true,
            message: 'Account created, but profile sync to DB is pending. Please login; sync will retry automatically.',
            profileSynced: false,
          }))
        )
      )
    );
  }
}