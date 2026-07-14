import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ProfileRepository, ProfileSearchParams } from './profile.repository';
import { ProfileListItemDto, ProfileDetailDto } from '@org/generated';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';

export interface ProfileSearchState {
  results: ProfileListItemDto[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

export interface ProfileDetailState {
  selectedProfile: ProfileDetailDto | null;
  loading: boolean;
  error: string | null;
}

export interface ProfileState {
  search: ProfileSearchState;
  detail: ProfileDetailState;
}

const initialSearchState: ProfileSearchState = {
  results: [],
  total: 0,
  pageNumber: 1,
  pageSize: 20,
  totalPages: 0,
  loading: false,
  error: null,
};

const initialDetailState: ProfileDetailState = {
  selectedProfile: null,
  loading: false,
  error: null,
};

export const ProfileStore = signalStore(
  { providedIn: 'root' },
  withState<ProfileState>({
    search: initialSearchState,
    detail: initialDetailState,
  }),
  withComputed(({ search }) => ({
    hasResults: computed(() => search().results.length > 0),
    isEmpty: computed(() => !search().loading && search().results.length === 0),
  })),
  withMethods((store, repository = inject(ProfileRepository)) => ({
    searchProfiles(params: ProfileSearchParams) {
      patchState(store, {
        search: { ...store.search(), loading: true, error: null },
      });

      return repository.searchPublicProfiles(params).pipe(
        map((response) => {
          patchState(store, {
            search: {
              results: response.items ?? [],
              total: response.total ?? 0,
              pageNumber: response.pageNumber ?? params.pageNumber ?? 1,
              pageSize: response.pageSize ?? params.pageSize ?? 20,
              totalPages: response.totalPages ?? 0,
              loading: false,
              error: null,
            },
          });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to search profiles';
          patchState(store, {
            search: { ...store.search(), loading: false, error: message },
          });
          return of(void 0);
        }),
      );
    },

    loadProfileById(id: number) {
      patchState(store, {
        detail: { ...store.detail(), loading: true, error: null },
      });

      return repository.getPublicProfileById(id).pipe(
        tap((profile) => {
          patchState(store, {
            detail: { selectedProfile: profile, loading: false, error: null },
          });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to load profile';
          patchState(store, {
            detail: { ...store.detail(), loading: false, error: message },
          });
          return of(null);
        }),
      );
    },

    clearSearch() {
      patchState(store, { search: initialSearchState });
    },

    clearProfile() {
      patchState(store, { detail: initialDetailState });
    },
  })),
);
