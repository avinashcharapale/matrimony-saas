import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError, concatMap, map, reduce } from 'rxjs/operators';
import { CreateProfileDto, ProfileClient } from '@org/generated';
import { TENANT_CONTEXT } from './tenant-context';

interface PendingProfileSyncItem {
  id: string;
  payload: CreateProfileDto;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  lastError?: string;
}

const PROFILE_SYNC_QUEUE_KEY_PREFIX = 'profile_sync_queue';

@Injectable({
  providedIn: 'root',
})
export class RegisterSyncService {
  private readonly tenantContext = inject(TENANT_CONTEXT);
  private readonly profileClient = inject(ProfileClient);

  private get tenantId(): string {
    const context = this.tenantContext();
    return (context.tenantHeaderId ?? context.tenantId ?? 'default') as string;
  }

  private get profileSyncQueueKey(): string {
    return `${PROFILE_SYNC_QUEUE_KEY_PREFIX}_${this.tenantId}`;
  }

  enqueuePendingProfileSync(payload: CreateProfileDto, errorMessage: string): Observable<void> {
    const queue = this.getPendingProfileSyncQueue();
    const signature = this.getProfilePayloadSignature(payload);
    const now = new Date().toISOString();
    const existingIndex = queue.findIndex((item) => item.id === signature);

    const pendingItem: PendingProfileSyncItem = {
      id: signature,
      payload,
      attempts: existingIndex >= 0 ? queue[existingIndex].attempts + 1 : 1,
      createdAt: existingIndex >= 0 ? queue[existingIndex].createdAt : now,
      updatedAt: now,
      lastError: errorMessage,
    };

    if (existingIndex >= 0) {
      queue[existingIndex] = pendingItem;
    } else {
      queue.push(pendingItem);
    }

    this.savePendingProfileSyncQueue(queue);
    return of(void 0);
  }

  processPendingProfileSync(
    getErrorMessage: (error: unknown, fallback: string) => string
  ): Observable<{ syncedCount: number; pendingCount: number }> {
    const queue = this.getPendingProfileSyncQueue();
    if (queue.length === 0) {
      return of({ syncedCount: 0, pendingCount: 0 });
    }

    return from(queue).pipe(
      concatMap((item) =>
        this.profileClient.create(item.payload, []).pipe(
          map(() => ({ ok: true as const, item })),
          catchError((error: unknown) =>
            of({
              ok: false as const,
              item: {
                ...item,
                attempts: item.attempts + 1,
                updatedAt: new Date().toISOString(),
                lastError: getErrorMessage(error, 'Profile sync failed.'),
              },
            })
          )
        )
      ),
      reduce(
        (acc, result) => {
          if (result.ok) {
            acc.syncedCount += 1;
          } else {
            acc.remaining.push(result.item);
          }
          return acc;
        },
        { syncedCount: 0, remaining: [] as PendingProfileSyncItem[] }
      ),
      map(({ syncedCount, remaining }) => {
        this.savePendingProfileSyncQueue(remaining);
        return { syncedCount, pendingCount: remaining.length };
      })
    );
  }

  getPendingProfileSyncCount(): number {
    return this.getPendingProfileSyncQueue().length;
  }

  private getPendingProfileSyncQueue(): PendingProfileSyncItem[] {
    try {
      const raw = localStorage.getItem(this.profileSyncQueueKey);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw) as PendingProfileSyncItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private savePendingProfileSyncQueue(queue: PendingProfileSyncItem[]): void {
    if (queue.length === 0) {
      localStorage.removeItem(this.profileSyncQueueKey);
      return;
    }
    localStorage.setItem(this.profileSyncQueueKey, JSON.stringify(queue));
  }

  private getProfilePayloadSignature(payload: CreateProfileDto): string {
    const contactEmail = (payload.contactDetails?.contactEmail ?? '')
      .toString()
      .trim()
      .toLowerCase();
    const fullName = (payload.fullName ?? '').trim().toLowerCase();
    return `${contactEmail}::${fullName}`;
  }
}