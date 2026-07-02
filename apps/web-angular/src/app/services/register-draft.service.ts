import { Injectable, inject } from '@angular/core';
import { ParamMap } from '@angular/router';
import { RegisterDraftState } from '@org/models';
import { TenantService } from './tenant.service';

export interface RegisterDraftContext {
  draftId: string;
  tenantId: string;
  storageKey: string;
}

@Injectable({
  providedIn: 'root',
})
export class RegisterDraftService {
  private static readonly DRAFT_STORAGE_PREFIX = 'register_draft';
  private static readonly DEFAULT_DRAFT_ID = 'default';

  private readonly tenantService = inject(TenantService);

  resolveContext(queryParams: ParamMap): RegisterDraftContext {
    const draftIdFromQuery = queryParams.get('draftId')?.trim();
    const tenantIdFromQuery = queryParams.get('tenantId')?.trim();

    const draftId = draftIdFromQuery || RegisterDraftService.DEFAULT_DRAFT_ID;
    const tenantId =
      tenantIdFromQuery ||
      this.tenantService.tenantHeaderId ||
      this.tenantService.tenant.id ||
      'default';

    return {
      draftId,
      tenantId,
      storageKey: `${RegisterDraftService.DRAFT_STORAGE_PREFIX}_${tenantId}_${draftId}`,
    };
  }

  saveStep(
    context: RegisterDraftContext,
    currentStep: number,
    stepValues: Record<string, unknown>
  ): void {
    const state = this.read(context) ?? {
      tenantId: context.tenantId,
      draftId: context.draftId,
      currentStep,
      updatedAt: Date.now(),
      steps: {},
      syncStatus: 'local-only',
    };

    state.currentStep = currentStep;
    state.updatedAt = Date.now();
    state.steps[String(currentStep)] = stepValues;

    localStorage.setItem(context.storageKey, JSON.stringify(state));
  }

  read(context: RegisterDraftContext): RegisterDraftState | null {
    try {
      const raw = localStorage.getItem(context.storageKey);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as RegisterDraftState;
      if (!parsed || typeof parsed !== 'object' || !parsed.steps || typeof parsed.steps !== 'object') {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }

  clear(context: RegisterDraftContext): void {
    localStorage.removeItem(context.storageKey);
  }
}