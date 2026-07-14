import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { GeoRepository } from './geo.repository';
import { GeoStateDto, GeoDistrictDto, GeoTalukaDto } from '@org/generated';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

export interface GeoState {
  states: GeoStateDto[];
  districts: GeoDistrictDto[];
  talukas: GeoTalukaDto[];
  loading: boolean;
  error: string | null;
}

const initialState: GeoState = {
  states: [],
  districts: [],
  talukas: [],
  loading: false,
  error: null,
};

export const GeoStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, repository = inject(GeoRepository)) => ({
    loadStates() {
      patchState(store, { loading: true, error: null });

      return repository.getStates().pipe(
        tap((states) => {
          patchState(store, { states: states ?? [], loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to load states';
          patchState(store, { loading: false, error: message });
          return of([]);
        }),
      );
    },

    loadDistricts(stateId: number) {
      patchState(store, { loading: true, error: null });

      return repository.getDistricts(stateId).pipe(
        tap((districts) => {
          patchState(store, { districts: districts ?? [], loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to load districts';
          patchState(store, { loading: false, error: message });
          return of([]);
        }),
      );
    },

    loadTalukas(districtId: number) {
      patchState(store, { loading: true, error: null });

      return repository.getTalukas(districtId).pipe(
        tap((talukas) => {
          patchState(store, { talukas: talukas ?? [], loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to load talukas';
          patchState(store, { loading: false, error: message });
          return of([]);
        }),
      );
    },

    clearDistricts() {
      patchState(store, { districts: [], talukas: [] });
    },

    clearTalukas() {
      patchState(store, { talukas: [] });
    },
  })),
);
