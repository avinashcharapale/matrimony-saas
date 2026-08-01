import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { UserRepository } from './user.repository';
import { UserDetailDto, UserListDto, CreateUserRequestDto, UpdateUserRequestDto, CreatedUserResponseDto } from '@org/generated';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

export interface UserState {
  users: UserListDto[];
  selectedUser: UserDetailDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
};

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, repository = inject(UserRepository)) => ({
    loadUsersByTenant(tenantId: number) {
      patchState(store, { loading: true, error: null });

      return repository.getByTenant(tenantId).pipe(
        tap((users) => {
          patchState(store, { users: users ?? [], loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to load users';
          patchState(store, { loading: false, error: message });
          return of([]);
        }),
      );
    },

    loadUser(id: number) {
      patchState(store, { loading: true, error: null });

      return repository.getById(id).pipe(
        tap((user) => {
          patchState(store, { selectedUser: user, loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to load user';
          patchState(store, { loading: false, error: message });
          return of(null);
        }),
      );
    },

    createUser(body: CreateUserRequestDto) {
      patchState(store, { loading: true, error: null });

      return repository.create(body).pipe(
        tap(() => {
          patchState(store, { loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to create user';
          patchState(store, { loading: false, error: message });
          return of(null);
        }),
      );
    },

    updateUser(id: number, body: UpdateUserRequestDto) {
      patchState(store, { loading: true, error: null });

      return repository.update(id, body).pipe(
        tap(() => {
          patchState(store, { loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to update user';
          patchState(store, { loading: false, error: message });
          return of(void 0);
        }),
      );
    },

    deleteUser(id: number) {
      patchState(store, { loading: true, error: null });

      return repository.delete(id).pipe(
        tap(() => {
          patchState(store, {
            users: store.users().filter((u) => u.id !== id),
            loading: false,
          });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to delete user';
          patchState(store, { loading: false, error: message });
          return of(void 0);
        }),
      );
    },

    clearSelected() {
      patchState(store, { selectedUser: null });
    },
  })),
);
