import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatClient } from '@org/generated';
import { AuthService } from '../../services/auth.service';
import { MemberService } from '../../services/member.service';
import { SubscriptionStore } from '@org/data-access-subscription';
import { SharedSidebarComponent } from '../../components/shared-sidebar/shared-sidebar.component';
import { getDefaultAvatar, resolvePhotoUrl } from '../../utils/default-avatar';

interface Conversation {
  id: string;
  name: string;
  messages: { byMe: boolean; text: string; time: string }[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedSidebarComponent],
  template: `
    <section class="search-page">
      <div class="search-shell">
        <app-shared-sidebar
          [userName]="userName()"
          [userPhotoUrl]="userPhotoUrl()"
          [userOccupation]="userOccupation()"
          [subscriptionStatus]="subscriptionStatus()"
          [subscriptionLoading]="subscriptionLoading()">
        </app-shared-sidebar>

        <div class="page-content">
          <header class="page-header">
            <p class="eyebrow">Communication</p>
            <h1>Messages</h1>
          </header>

          <section class="chat-layout">
            <aside class="chat-list">
              @if (conversations().length > 0) {
                @for (chat of conversations(); track chat.id) {
                <button type="button" [class.active]="chat.id === activeId()" (click)="activeId.set(chat.id)">
                  <strong>{{ chat.name }}</strong>
                  <span>{{ chat.messages[chat.messages.length - 1]?.text }}</span>
                </button>
                }
              } @else {
                <p class="empty-hint">No conversations yet.</p>
              }
            </aside>

            <main class="chat-panel">
              @if (activeConversation()) {
                <h2>{{ activeConversation()?.name }}</h2>
                <div class="messages-box">
                  @for (msg of activeConversation()?.messages || []; track $index) {
                  <div class="bubble" [class.me]="msg.byMe">
                    <p>{{ msg.text }}</p>
                    <small>{{ msg.time }}</small>
                  </div>
                  }
                </div>
                <form class="composer" (ngSubmit)="sendMessage()">
                  <input type="text" name="message" [ngModel]="draft()" (ngModelChange)="draft.set($event)" placeholder="Type message" />
                  <button type="submit" [disabled]="!draft().trim()">Send</button>
                </form>
              } @else {
                <div class="empty-chat">
                  <p>Select a conversation to start messaging.</p>
                </div>
              }
            </main>
          </section>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      :host { display: block; }
      :host {
        --bg-soft: #f7f4f1;
        --card: #ffffff;
        --line: #e5e0db;
        --text-main: #1f2230;
        --text-soft: #6d7285;
        --text-muted: #9ca3af;
        --accent: var(--tenant-primary);
        --accent-dark: var(--tenant-accent);
        --accent-soft: color-mix(in srgb, var(--tenant-primary) 8%, #ffffff);
        --accent-border: color-mix(in srgb, var(--tenant-primary) 25%, #ffffff);
        --radius-sm: 8px;
        --radius-md: 12px;
        --radius-lg: 16px;
        display: block;
      }
      .search-page { width: 100%; color: var(--text-main); }
      .search-shell { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 1.25rem; align-items: start; }
      .page-content { display: grid; gap: 1rem; }
      .page-header, .chat-layout { background: #fff; border: 1px solid #eadfd7; border-radius: 1rem; padding: 1rem; }
      .eyebrow { margin: 0; color: #9a5e45; text-transform: uppercase; font-size: 0.74rem; font-weight: 700; }
      h1 { margin: 0.35rem 0 0; color: #24283a; }
      .chat-layout { display: grid; grid-template-columns: 260px 1fr; gap: 1rem; }
      .chat-list { display: grid; gap: 0.5rem; }
      .chat-list button { text-align: left; border: 1px solid #e8d9cf; border-radius: 0.7rem; background: #fcf8f5; padding: 0.65rem; cursor: pointer; display: grid; gap: 0.2rem; }
      .chat-list button.active { border-color: #9a5e45; background: #f4e7df; }
      .chat-list strong { color: #2f3347; }
      .chat-list span { color: #6a7288; font-size: 0.84rem; }
      .chat-panel h2 { margin: 0; color: #2f3347; }
      .messages-box { margin-top: 0.7rem; height: 320px; overflow: auto; display: grid; gap: 0.55rem; padding-right: 0.2rem; }
      .bubble { max-width: 72%; background: #f1f4fb; border-radius: 0.75rem; padding: 0.6rem 0.7rem; }
      .bubble.me { margin-left: auto; background: #f4e7df; }
      .bubble p { margin: 0; color: #32374a; }
      .bubble small { color: #7a8197; font-size: 0.72rem; }
      .composer { margin-top: 0.8rem; display: flex; gap: 0.6rem; }
      .composer input { flex: 1; border: 1px solid #dcc8bc; border-radius: 0.6rem; padding: 0.6rem; }
      .composer button { border: none; border-radius: 0.6rem; background: #9a5e45; color: #fff; padding: 0.6rem 0.9rem; font-weight: 700; }
      .empty-hint { color: #6f7486; font-size: 0.85rem; text-align: center; padding: 1rem; }
      .empty-chat { display: grid; place-items: center; height: 100%; color: #6f7486; }
      @media (max-width: 900px) { .search-shell { grid-template-columns: 1fr; } }
      @media (max-width: 780px) { .chat-layout { grid-template-columns: 1fr; } .messages-box { height: 260px; } }
    `,
  ],
})
export class Messages implements OnInit {
  readonly draft = signal('');
  readonly activeId = signal('');
  readonly conversations = signal<Conversation[]>([]);

  private readonly chatClient = inject(ChatClient);
  private readonly authService = inject(AuthService);
  private readonly memberService = inject(MemberService);
  private readonly subscriptionStore = inject(SubscriptionStore);

  readonly userName = signal('');
  readonly userPhotoUrl = signal('');
  readonly userOccupation = signal('');
  readonly subscriptionStatus = this.subscriptionStore.status;
  readonly subscriptionLoading = computed(() => this.subscriptionStore.loading());

  readonly activeConversation = computed(() =>
    this.conversations().find((item) => item.id === this.activeId())
  );

  ngOnInit(): void {
    const userId = this.authService.getSession()?.userId ?? 0;
    if (userId) {
      this.subscriptionStore.loadSubscriptionStatus(userId).subscribe();
    }

    this.memberService.getMyProfile().subscribe({
      next: (profile) => {
        const fullName = profile.fullName ?? '';
        const genderId = profile.personalDetails?.genderId ?? null;
        const primaryPhoto = (profile.photos ?? []).find(ph => ph.isPrimary) ?? profile.photos?.[0];
        const photoUrl = primaryPhoto
          ? resolvePhotoUrl(primaryPhoto.fileUrl, fullName, genderId)
          : getDefaultAvatar(fullName, genderId);

        this.userName.set(fullName);
        this.userPhotoUrl.set(photoUrl);
        this.userOccupation.set(profile.occupationText ?? '');
      },
      error: () => {},
    });

    this.loadConversations();
  }

  private loadConversations(): void {
    const session = this.authService.getSession();
    if (!session?.userId) return;

    this.chatClient.getByUser(String(session.userId)).subscribe({
      next: (convos) => {
        const mapped: Conversation[] = (convos ?? []).map((c) => ({
          id: String(c.conversationId ?? ''),
          name: c.conversationName ?? 'Unknown',
          messages: c.lastMessage
            ? [{ byMe: false, text: c.lastMessage.content ?? '', time: c.lastMessage.sentDate ?? '' }]
            : [],
        }));
        this.conversations.set(mapped);
        if (mapped.length > 0) {
          this.activeId.set(mapped[0].id);
        }
      },
      error: () => {},
    });
  }

  sendMessage(): void {
    const draftValue = this.draft().trim();
    const active = this.activeConversation();
    if (!draftValue || !active) return;
    this.conversations.update(convos =>
      convos.map((c) =>
        c.id === active.id
          ? { ...c, messages: [...c.messages, { byMe: true, text: draftValue, time: 'Now' }] }
          : c
      )
    );
    this.draft.set('');
  }
}
