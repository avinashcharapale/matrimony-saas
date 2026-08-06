import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
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
  imports: [CommonModule, FormsModule, TranslateModule, SharedSidebarComponent],
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
            <p class="eyebrow">{{ 'messages.eyebrow' | translate }}</p>
            <h1>{{ 'nav.messages' | translate }}</h1>
          </header>

          <section class="chat-layout">
            <aside class="chat-list">
              @if (conversations().length > 0) {
                @for (chat of conversations(); track chat.id) {
                <button type="button" [class.active]="chat.id === activeId()" (click)="activeId.set(chat.id)">
                  <strong>{{ chat.name || ('messages.unknown' | translate) }}</strong>
                  <span>{{ chat.messages[chat.messages.length - 1]?.text }}</span>
                </button>
                }
              } @else {
                <p class="empty-hint">{{ 'messages.noConversations' | translate }}</p>
              }
            </aside>

            <main class="chat-panel">
              @if (activeConversation()) {
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
                  <input type="text" name="message" [ngModel]="draft()" (ngModelChange)="draft.set($event)" [attr.placeholder]="'messages.sendPlaceholder' | translate" />
                  <button type="submit" [disabled]="!draft().trim()">{{ 'messages.send' | translate }}</button>
                </form>
              } @else {
                <div class="empty-chat">
                  <p>{{ 'messages.selectConversation' | translate }}</p>
                </div>
              }
            </main>
          </section>
        </div>
      </div>
    </section>
  `,
  styleUrl: './messages.css',
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
          name: c.conversationName ?? '',
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
          ? { ...c, messages: [...c.messages, { byMe: true, text: draftValue, time: '' }] }
          : c
      )
    );
    this.draft.set('');
  }
}
