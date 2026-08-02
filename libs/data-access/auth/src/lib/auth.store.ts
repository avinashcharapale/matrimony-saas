import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { AuthRepository, AuthLoginResponse } from './auth.repository';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';

export const ACCESS_TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const USER_ID_KEY = 'auth_user_id';
export const TENANT_ID_KEY = 'auth_tenant_id';
export const ROLE_KEY = 'auth_role';
export const ROLES_KEY = 'auth_roles';
export const PERMISSIONS_KEY = 'auth_permissions';
export const EXPIRES_AT_KEY = 'auth_expires_at';

export interface AuthSession {
  userId: number;
  tenantId: number;
  role: string;
  roles: string[];
  permissions: string[];
  expiresAt: string;
}

export interface AuthState {
  accessToken: string | null;
  storedRefreshToken: string | null;
  userId: number | null;
  tenantId: number | null;
  role: string | null;
  roles: string[];
  permissions: string[];
  expiresAt: string | null;
  loading: boolean;
  error: string | null;
}

function loadFromStorage(): AuthState {
  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    storedRefreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
    userId: localStorage.getItem(USER_ID_KEY)
      ? Number(localStorage.getItem(USER_ID_KEY))
      : null,
    tenantId: localStorage.getItem(TENANT_ID_KEY)
      ? Number(localStorage.getItem(TENANT_ID_KEY))
      : null,
    role: localStorage.getItem(ROLE_KEY),
    roles: parseRoles(localStorage.getItem(ROLES_KEY)),
    permissions: parseRoles(localStorage.getItem(PERMISSIONS_KEY)),
    expiresAt: localStorage.getItem(EXPIRES_AT_KEY),
    loading: false,
    error: null,
  };
}

function parseRoles(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((r) => typeof r === 'string') : [];
  } catch {
    return [];
  }
}

function persistToStorage(state: AuthState): void {
  const set = (key: string, val: string | null) =>
    val != null ? localStorage.setItem(key, val) : localStorage.removeItem(key);

  set(ACCESS_TOKEN_KEY, state.accessToken);
  set(REFRESH_TOKEN_KEY, state.storedRefreshToken);
  set(USER_ID_KEY, state.userId != null ? String(state.userId) : null);
  set(TENANT_ID_KEY, state.tenantId != null ? String(state.tenantId) : null);
  set(ROLE_KEY, state.role);
  set(ROLES_KEY, state.roles.length > 0 ? JSON.stringify(state.roles) : null);
  set(PERMISSIONS_KEY, state.permissions.length > 0 ? JSON.stringify(state.permissions) : null);
  set(EXPIRES_AT_KEY, state.expiresAt);
}

function normalizeAuthPayload(
  response: AuthLoginResponse,
  previous: AuthSession | null = null,
): Partial<AuthState> {
  const r = response as unknown as {
    accessToken?: string;
    refreshToken?: string;
    userId?: number;
    tenantId?: number;
    role?: string;
    roles?: string[];
    permissions?: string[];
    expiresAt?: string;
    expiresIn?: number;
    user?: { id?: number; tenantId?: number };
  };

  const accessToken = r.accessToken ?? null;
  const storedRefreshToken = r.refreshToken ?? null;
  const userId = r.userId ?? r.user?.id ?? previous?.userId ?? null;
  const tenantId = r.tenantId ?? r.user?.tenantId ?? previous?.tenantId ?? null;
  const role = r.role ?? previous?.role ?? 'member';
  const roles = Array.isArray(r.roles) && r.roles.length > 0
    ? r.roles
    : previous?.roles ?? (role ? [role] : []);
  const permissions = Array.isArray(r.permissions)
    ? r.permissions.filter((p) => typeof p === 'string')
    : previous?.permissions ?? [];
  const expiresAt =
    r.expiresAt ??
    (typeof r.expiresIn === 'number' && r.expiresIn > 0
      ? new Date(Date.now() + r.expiresIn * 1000).toISOString()
      : null) ??
    previous?.expiresAt ??
    null;

  return { accessToken, storedRefreshToken, userId, tenantId, role, roles, permissions, expiresAt };
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;

    if (typeof e['error'] === 'string' && (e['error'] as string).trim().length > 0) {
      return e['error'] as string;
    }

    if (e['error'] && typeof e['error'] === 'object') {
      const inner = e['error'] as Record<string, unknown>;
      if (typeof inner['error'] === 'string' && (inner['error'] as string).trim().length > 0)
        return inner['error'] as string;
      if (typeof inner['message'] === 'string' && (inner['message'] as string).trim().length > 0)
        return inner['message'] as string;
      if (typeof inner['detail'] === 'string' && (inner['detail'] as string).trim().length > 0)
        return inner['detail'] as string;
      if (typeof inner['title'] === 'string' && (inner['title'] as string).trim().length > 0)
        return inner['title'] as string;
      if (inner['errors'] && typeof inner['errors'] === 'object') {
        const first = Object.values(inner['errors'] as Record<string, unknown>)
          .flatMap((v) => (Array.isArray(v) ? v : [v]))
          .find((v) => typeof v === 'string' && v.trim().length > 0);
        if (first) return first as string;
      }
    }

    if (typeof e['message'] === 'string' && (e['message'] as string).trim().length > 0) {
      return e['message'] as string;
    }
  }

  return fallback;
}

const EMPTY_STATE: AuthState = {
  accessToken: null,
  storedRefreshToken: null,
  userId: null,
  tenantId: null,
  role: null,
  roles: [],
  permissions: [],
  expiresAt: null,
  loading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(loadFromStorage),
  withComputed(({ accessToken, userId, tenantId, role, roles, permissions, expiresAt }) => ({
    isAuthenticated: computed(() => {
      const token = accessToken();
      if (!token) return false;
      const exp = expiresAt();
      if (exp) return new Date(exp) > new Date();
      return true;
    }),
    isAdmin: computed(() => {
      const r = role();
      if (r === 'TenantAdmin' || r === 'SuperAdmin' || r === 'PlatformAdmin') return true;
      const all = roles();
      return all.includes('TenantAdmin') || all.includes('SuperAdmin') || all.includes('PlatformAdmin');
    }),
    isPlatformAdmin: computed(() => {
      const r = role();
      if (r === 'PlatformAdmin' || r === 'SuperAdmin') return true;
      const all = roles();
      return all.includes('PlatformAdmin') || all.includes('SuperAdmin');
    }),
    session: computed((): AuthSession | null => {
      const uid = userId();
      if (uid == null) return null;
      return {
        userId: uid,
        tenantId: tenantId() ?? 0,
        role: role() ?? 'member',
        roles: roles(),
        permissions: permissions(),
        expiresAt: expiresAt() ?? '',
      };
    }),
  })),
  withMethods((store, repository = inject(AuthRepository)) => ({
    can(code: string): boolean {
      if (store.isAdmin()) return true;
      return store.permissions().includes(code);
    },
    login(email: string, password: string) {
      patchState(store, { loading: true, error: null });

      return repository.login({ email, password }).pipe(
        map((response) => {
          const normalized = normalizeAuthPayload(response);
          const newState = { ...store, ...normalized, loading: false } as AuthState;
          patchState(store, { ...normalized, loading: false });
          persistToStorage(newState);
          return { ok: true as const, message: 'Login successful.' };
        }),
        catchError((error: unknown) => {
          const message = extractErrorMessage(error, 'Invalid email or password.');
          patchState(store, { loading: false, error: message });
          return of({ ok: false as const, message });
        }),
      );
    },

    register(email: string, password: string, confirmPassword: string, tenantId?: number) {
      patchState(store, { loading: true, error: null });

      return repository.register({ email, password, confirmPassword, tenantId }).pipe(
        map((response) => {
          const normalized = normalizeAuthPayload(response);
          const newState = { ...store, ...normalized, loading: false } as AuthState;
          patchState(store, { ...normalized, loading: false });
          persistToStorage(newState);
          return { ok: true as const, message: 'Registration successful.' };
        }),
        catchError((error: unknown) => {
          const message = extractErrorMessage(error, 'Registration failed.');
          patchState(store, { loading: false, error: message });
          return of({ ok: false as const, message });
        }),
      );
    },

    refreshAuth() {
      const rt = store.storedRefreshToken();
      if (!rt) return of(false);

      return repository.refreshToken(rt).pipe(
        map((response) => {
          const previous: AuthSession | null =
            store.userId() != null
              ? {
                  userId: store.userId()!,
                  tenantId: store.tenantId() ?? 0,
                  role: store.role() ?? 'member',
                  roles: store.roles(),
                  permissions: store.permissions(),
                  expiresAt: store.expiresAt() ?? '',
                }
              : null;

          const normalized = normalizeAuthPayload(response, previous);
          const newState = { ...store, ...normalized } as AuthState;
          patchState(store, normalized);
          persistToStorage(newState);
          return true;
        }),
        catchError(() => of(false)),
      );
    },

    logout() {
      const rt = store.storedRefreshToken();
      const request$ = rt ? repository.logout(rt) : of(void 0);

      return request$.pipe(
        catchError(() => of(void 0)),
        tap(() => {
          patchState(store, EMPTY_STATE);
          persistToStorage(EMPTY_STATE);
        }),
        map(() => void 0),
      );
    },

    clearSession() {
      patchState(store, EMPTY_STATE);
      persistToStorage(EMPTY_STATE);
    },
  })),
);
