import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { SubscriptionRepository } from './subscription.repository';
import { SubscriptionPlanDto, SubscriptionFeatureDto, SubscriptionStatusDto } from '@org/generated';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

export interface SubscriptionState {
  plans: SubscriptionPlanDto[];
  features: SubscriptionFeatureDto[];
  selectedPlan: SubscriptionPlanDto | null;
  status: SubscriptionStatusDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  plans: [],
  features: [],
  selectedPlan: null,
  status: null,
  loading: false,
  error: null,
};

export const SubscriptionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ plans, status }) => ({
    hasPlans: computed(() => plans().length > 0),
    isActive: computed(() => (status()?.isActive ?? false) && !(status()?.isTrial ?? false)),
    isTrial: computed(() => status()?.isTrial ?? false),
  })),
  withMethods((store, repository = inject(SubscriptionRepository)) => ({
    loadPlans() {
      patchState(store, { loading: true, error: null });

      return repository.getAllPlans().pipe(
        tap((plans) => {
          patchState(store, { plans: plans ?? [], loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to load plans';
          patchState(store, { loading: false, error: message });
          return of([]);
        }),
      );
    },

    loadPlanById(id: number) {
      patchState(store, { loading: true, error: null });

      return repository.getPlanById(id).pipe(
        tap((plan) => {
          patchState(store, { selectedPlan: plan, loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to load plan';
          patchState(store, { loading: false, error: message });
          return of(null);
        }),
      );
    },

    loadFeatures() {
      return repository.getAllFeatures().pipe(
        tap((features) => {
          patchState(store, { features: features ?? [] });
        }),
        catchError(() => of([])),
      );
    },

    loadSubscriptionStatus(userId: number, tenantId: number) {
      return repository.getUserSubscriptionStatus(userId, tenantId).pipe(
        tap((status) => {
          patchState(store, { status });
        }),
        catchError(() => of(void 0)),
      );
    },

    clearSelected() {
      patchState(store, { selectedPlan: null });
    },
  })),
);
