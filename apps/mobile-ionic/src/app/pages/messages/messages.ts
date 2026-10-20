import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ChatClient, ChatMessageDto } from '@org/generated';
import { AuthStore } from '@org/data-access-auth';

interface Message {
  id?: string;
  byMe: boolean;
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  name: string;
  messages: Message[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-messages',
  standalone: true,
  imports: [IonicModule, FormsModule, TranslateModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <ion-page>
      <ion-header class="ion-no-border">
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
          <ion-title>{{ 'nav.messages' | translate }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="shell">
          <header class="page-header">
            <p class="eyebrow">{{ 'messages.eyebrow' | translate }}</p>
            <h1>{{ 'nav.messages' | translate }}</h1>
          </header>

          @if (conversations().length > 0) {
            <aside class="chat-list">
              @for (chat of conversations(); track chat.id) {
              <button type="button" class="chat-tab" [class.active]="chat.id === activeId()" (click)="selectConversation(chat.id)">
                <strong>{{ chat.name || ('messages.unknown' | translate) }}</strong>
                <span>{{ chat.messages[chat.messages.length - 1]?.text }}</span>
              </button>
              }
            </aside>
          } @else {
            <p class="empty-hint">{{ 'messages.noConversations' | translate }}</p>
          }

          @if (activeConversation()) {
            <main class="chat-panel">
              <h2>{{ activeConversation()?.name || ('messages.unknown' | translate) }}</h2>
              <div class="messages-box">
                @for (msg of activeConversation()?.messages || []; track $index) {
                <div class="bubble" [class.me]="msg.byMe">
                  <p>{{ msg.text }}</p>
                  <small>{{ msg.time || ('messages.now' | translate) }}</small>
                </div>
                }
              </div>
              <form class="composer" (ngSubmit)="sendMessage()">
                <ion-input
                  name="message"
                  [ngModel]="draft()"
                  (ngModelChange)="draft.set($event)"
                  [placeholder]="'messages.sendPlaceholder' | translate"
                ></ion-input>
                <ion-button type="submit" [disabled]="!draft().trim()">{{ 'messages.send' | translate }}</ion-button>
              </form>
            </main>
          } @else {
            <div class="empty-chat">
              <p>{{ 'messages.selectConversation' | translate }}</p>
            </div>
          }
        </div>
      </ion-content>
    </ion-page>
  `,
  styles: [
    `
      .shell {
        padding: 1rem;
      }

      .page-header h1 {
        margin: 0;
      }

      .eyebrow {
        margin: 0 0 0.25rem;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--tenant-primary);
      }

      .chat-list {
        display: flex;
        gap: 0.5rem;
        overflow-x: auto;
        padding: 0.75rem 0;
      }

      .chat-tab {
        flex: 0 0 auto;
        display: grid;
        gap: 0.15rem;
        max-width: 14rem;
        text-align: left;
        padding: 0.6rem 0.75rem;
        border-radius: 0.6rem;
        border: 1px solid var(--surface-overlay, #e5e7eb);
        background: var(--surface-overlay, transparent);
        color: inherit;
      }

      .chat-tab.active {
        border-color: var(--tenant-primary);
      }

      .chat-tab strong {
        font-size: 0.85rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .chat-tab span {
        font-size: 0.72rem;
        color: var(--text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .chat-panel h2 {
        margin: 0.5rem 0;
      }

      .messages-box {
        display: grid;
        gap: 0.5rem;
        max-height: 45vh;
        overflow-y: auto;
        padding: 0.5rem 0;
      }

      .bubble {
        justify-self: start;
        max-width: 80%;
        padding: 0.5rem 0.7rem;
        border-radius: 0.7rem;
        background: var(--surface-overlay, #f3f4f6);
      }

      .bubble.me {
        justify-self: end;
        background: var(--tenant-primary);
        color: var(--on-primary);
      }

      .bubble p {
        margin: 0;
      }

      .bubble small {
        display: block;
        margin-top: 0.15rem;
        font-size: 0.62rem;
        opacity: 0.7;
      }

      .composer {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        margin-top: 0.5rem;
      }

      .composer ion-input {
        flex: 1;
        --background: var(--surface-overlay, #f3f4f6);
        --padding-start: 0.6rem;
        border-radius: 0.6rem;
      }

      .empty-hint,
      .empty-chat p {
        color: var(--text-muted);
      }
    `,
  ],
})
export class Messages implements OnInit {
  readonly draft = signal('');
  readonly activeId = signal('');
  readonly conversations = signal<Conversation[]>([]);

  private readonly chatClient = inject(ChatClient);
  private readonly authStore = inject(AuthStore);

  readonly activeConversation = computed(() =>
    this.conversations().find((item) => item.id === this.activeId()),
  );

  ngOnInit(): void {
    this.loadConversations();
  }

  private loadConversations(): void {
    const userId = this.authStore.userId();
    if (!userId) return;

    this.chatClient.getByUser(String(userId)).subscribe({
      next: (convos) => {
        const mapped: Conversation[] = (convos ?? []).map((c) => ({
          id: String(c.conversationId ?? ''),
          name: c.conversationName ?? '',
          messages: c.lastMessage
            ? [{ byMe: false, text: c.lastMessage.content ?? '', time: c.lastMessage.sentDate ?? '' }]
            : [],
        }));
        this.conversations.set(mapped);
        if (mapped.length > 0) {
          this.selectConversation(mapped[0].id);
        }
      },
      error: () => this.conversations.set([]),
    });
  }

  selectConversation(id: string): void {
    this.activeId.set(id);
    const conversationId = Number(id);
    if (!conversationId) return;

    const userId = this.authStore.userId();
    this.chatClient.getMessagesByConversation(conversationId).subscribe({
      next: (messages) => this.applyMessages(id, messages ?? []),
      error: () => undefined,
    });

    if (userId) {
      this.chatClient
        .markMessagesAsRead({ conversationId, userId })
        .subscribe({ next: () => undefined, error: () => undefined });
    }
  }

  sendMessage(): void {
    const draftValue = this.draft().trim();
    const active = this.activeConversation();
    if (!draftValue || !active) return;

    const userId = this.authStore.userId();
    const conversationId = Number(active.id);
    const localId = `local-${Date.now()}`;

    this.conversations.update((convos) =>
      convos.map((c) =>
        c.id === active.id
          ? { ...c, messages: [...c.messages, { id: localId, byMe: true, text: draftValue, time: '' }] }
          : c,
      ),
    );
    this.draft.set('');

    if (!userId || !conversationId) return;

    this.chatClient
      .sendMessage({
        conversationId,
        senderUserId: userId,
        tenantId: this.authStore.tenantId() ?? undefined,
        content: draftValue,
        type: 'text',
      })
      .subscribe({
        next: (message) => {
          const sentAt = message?.sentDate ?? new Date().toISOString();
          this.conversations.update((convos) =>
            convos.map((c) =>
              c.id === active.id
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === localId ? { ...m, id: String(message?.messageId ?? localId), time: sentAt } : m,
                    ),
                  }
                : c,
            ),
          );
        },
        error: () => undefined,
      });
  }

  private applyMessages(conversationId: string, messages: ChatMessageDto[]): void {
    const userId = this.authStore.userId();
    const mapped = messages
      .slice()
      .sort((a, b) => (a.sentDate ?? '').localeCompare(b.sentDate ?? ''))
      .map((m) => ({
        id: String(m.messageId ?? ''),
        byMe: m.senderUserId != null && m.senderUserId === userId,
        text: m.content ?? '',
        time: m.sentDate ?? '',
      }));
    if (mapped.length === 0) return;
    this.conversations.update((convos) =>
      convos.map((c) => (c.id === conversationId ? { ...c, messages: mapped } : c)),
    );
  }
}
