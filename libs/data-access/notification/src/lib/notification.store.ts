import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { NotificationRepository } from './notification.repository';
import { NotificationDto, NotificationListResponse } from '@org/generated';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

export interface NotificationState {
  notifications: NotificationDto[];
  unreadCount: number;
  selectedNotification: NotificationDto | null;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  selectedNotification: null,
  page: 1,
  pageSize: 20,
  loading: false,
  error: null,
};

export const NotificationStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ notifications, unreadCount }) => ({
    hasNotifications: computed(() => notifications().length > 0),
    hasUnread: computed(() => unreadCount() > 0),
  })),
  withMethods((store, repository = inject(NotificationRepository)) => ({
    loadNotifications(page = 1, pageSize = 20, unreadOnly = false) {
      patchState(store, { loading: true, error: null });

      return repository.getNotifications(page, pageSize, unreadOnly).pipe(
        tap((response) => {
          patchState(store, {
            notifications: response.notifications ?? [],
            unreadCount: response.unreadCount ?? 0,
            page: response.page ?? page,
            pageSize: response.pageSize ?? pageSize,
            loading: false,
          });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to load notifications';
          patchState(store, { loading: false, error: message });
          return of(null);
        }),
      );
    },

    loadUnreadCount() {
      return repository.getUnreadCount().pipe(
        tap((response) => {
          patchState(store, { unreadCount: response.unreadCount ?? 0 });
        }),
        catchError(() => of(null)),
      );
    },

    markAsRead(id: number) {
      return repository.markAsRead(id).pipe(
        tap(() => {
          const notifications = store.notifications().map((n) =>
            n.notificationId === id ? { ...n, isRead: true } : n,
          );
          patchState(store, {
            notifications,
            unreadCount: Math.max(0, store.unreadCount() - 1),
          });
        }),
        catchError(() => of(void 0)),
      );
    },

    markAllAsRead() {
      return repository.markAllAsRead().pipe(
        tap(() => {
          const notifications = store.notifications().map((n) => ({ ...n, isRead: true }));
          patchState(store, { notifications, unreadCount: 0 });
        }),
        catchError(() => of(void 0)),
      );
    },

    addNotification(notification: NotificationDto) {
      const current = store.notifications();
      patchState(store, {
        notifications: [notification, ...current],
        unreadCount: store.unreadCount() + 1,
      });
    },

    clearSelected() {
      patchState(store, { selectedNotification: null });
    },
  })),
);
