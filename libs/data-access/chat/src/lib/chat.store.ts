import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { ChatRepository } from './chat.repository';
import { ChatConversationDto } from '@org/generated';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

export interface ChatState {
  conversations: ChatConversationDto[];
  selectedConversation: ChatConversationDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  selectedConversation: null,
  loading: false,
  error: null,
};

export const ChatStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, repository = inject(ChatRepository)) => ({
    loadConversations(userId: number, tenantId?: number) {
      patchState(store, { loading: true, error: null });

      return repository.getConversationsByUser(userId, tenantId).pipe(
        tap((conversations) => {
          patchState(store, { conversations: conversations ?? [], loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to load conversations';
          patchState(store, { loading: false, error: message });
          return of([]);
        }),
      );
    },

    loadConversation(id: number, tenantId?: number) {
      patchState(store, { loading: true, error: null });

      return repository.getConversationById(id, tenantId).pipe(
        tap((conversation) => {
          patchState(store, { selectedConversation: conversation, loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to load conversation';
          patchState(store, { loading: false, error: message });
          return of(null);
        }),
      );
    },

    createConversation(body: ChatConversationDto) {
      return repository.createConversation(body).pipe(
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to create conversation';
          patchState(store, { error: message });
          return of(void 0);
        }),
      );
    },

    clearSelected() {
      patchState(store, { selectedConversation: null });
    },
  })),
);
