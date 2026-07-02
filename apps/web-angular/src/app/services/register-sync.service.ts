import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService, ProfileUpsertRequest } from './api.service';
import { TenantService } from './tenant.service';

interface PendingProfileSyncItem {
  id: string;
  payload: ProfileUpsertRequest;
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
  private readonly tenantService = inject(TenantService);
  private readonly apiService = inject(ApiService);

  private get tenantId(): string {
    return this.tenantService.tenant.id || 'default';
  }

  private get profileSyncQueueKey(): string {
    return `${PROFILE_SYNC_QUEUE_KEY_PREFIX}_${this.tenantId}`;
  }

  async enqueuePendingProfileSync(payload: ProfileUpsertRequest, errorMessage: string): Promise<void> {
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
  }

  async processPendingProfileSync(
    getErrorMessage: (error: unknown, fallback: string) => string
  ): Promise<{ syncedCount: number; pendingCount: number }> {
    const queue = this.getPendingProfileSyncQueue();
    if (queue.length === 0) {
      return { syncedCount: 0, pendingCount: 0 };
    }

    const remaining: PendingProfileSyncItem[] = [];
    let syncedCount = 0;

    for (const item of queue) {
      try {
        await firstValueFrom(this.apiService.createOrUpdateProfile(item.payload));
        syncedCount += 1;
      } catch (error: unknown) {
        remaining.push({
          ...item,
          attempts: item.attempts + 1,
          updatedAt: new Date().toISOString(),
          lastError: getErrorMessage(error, 'Profile sync failed.'),
        });
      }
    }

    this.savePendingProfileSyncQueue(remaining);
    return { syncedCount, pendingCount: remaining.length };
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

  private getProfilePayloadSignature(payload: ProfileUpsertRequest): string {
    const contactEmail = (payload.contact?.['contactEmail'] ?? '').toString().trim().toLowerCase();
    const fullName = (payload.fullName ?? '').trim().toLowerCase();
    return `${contactEmail}::${fullName}`;
  }
}