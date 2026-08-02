import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { TenantRepository } from './tenant.repository';
import { tap } from 'rxjs';

export interface TenantState {
  resolvedTenantId: number | null;
  tenantCode: string | null;
  resolved: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: TenantState = {
  resolvedTenantId: null,
  tenantCode: null,
  resolved: false,
  loading: false,
  error: null,
};

export const TenantStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ resolvedTenantId }) => ({
    tenantHeaderId: computed(() => {
      const id = resolvedTenantId();
      return id && id > 0 ? String(id) : null;
    }),
  })),
  withMethods((store, repository = inject(TenantRepository)) => ({
    setResolvedTenant(tenantId: number, tenantCode: string | null) {
      patchState(store, {
        resolvedTenantId: tenantId,
        tenantCode,
        resolved: true,
        loading: false,
      });
    },

    resolveTenant(host: string, pathname: string, search: string) {
      patchState(store, { loading: true, error: null });

      return repository.resolveTenant(host, pathname, search).pipe(
        tap({
          next: (resolved) => {
            patchState(store, {
              resolvedTenantId:
                Number.isFinite(resolved.tenantId) && resolved.tenantId > 0
                  ? resolved.tenantId
                  : null,
              tenantCode: resolved.tenantCode ?? null,
              resolved: resolved.resolved,
              loading: false,
            });
          },
          error: (err) => {
            patchState(store, {
              loading: false,
              error: err?.message ?? 'Failed to resolve tenant',
            });
          },
        }),
      );
    },
  })),
);
