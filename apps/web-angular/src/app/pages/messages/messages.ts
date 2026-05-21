import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Conversation {
  id: string;
  name: string;
  messages: { byMe: boolean; text: string; time: string }[];
}

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <p class="eyebrow">Communication</p>
        <h1>Messages</h1>
      </header>

      <section class="chat-layout">
        <aside class="chat-list">
          @for (chat of conversations; track chat.id) {
          <button type="button" [class.active]="chat.id === activeId" (click)="activeId = chat.id">
            <strong>{{ chat.name }}</strong>
            <span>{{ chat.messages[chat.messages.length - 1]?.text }}</span>
          </button>
          }
        </aside>

        <main class="chat-panel">
          <h2>{{ activeConversation?.name }}</h2>
          <div class="messages-box">
            @for (msg of activeConversation?.messages || []; track $index) {
            <div class="bubble" [class.me]="msg.byMe">
              <p>{{ msg.text }}</p>
              <small>{{ msg.time }}</small>
            </div>
            }
          </div>
          <form class="composer" (ngSubmit)="sendMessage()">
            <input type="text" name="message" [(ngModel)]="draft" placeholder="Type message" />
            <button type="submit" [disabled]="!draft.trim()">Send</button>
          </form>
        </main>
      </section>
    </section>
  `,
  styles: [
    `
      .page-shell { width: min(100%, 980px); margin: 0 auto; display: grid; gap: 1rem; }
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
      @media (max-width: 780px) { .chat-layout { grid-template-columns: 1fr; } .messages-box { height: 260px; } }
    `,
  ],
})
export class Messages {
  draft = '';
  activeId = 'c1';

  conversations: Conversation[] = [
    {
      id: 'c1',
      name: 'Priya Shinde',
      messages: [
        { byMe: false, text: 'Hi, can we talk this weekend?', time: '09:10' },
        { byMe: true, text: 'Sure, Sunday evening works.', time: '09:14' },
      ],
    },
    {
      id: 'c2',
      name: 'Snehal Deshmukh',
      messages: [
        { byMe: false, text: 'Thanks for sharing details.', time: 'Yesterday' },
      ],
    },
  ];

  get activeConversation(): Conversation | undefined {
    return this.conversations.find((item) => item.id === this.activeId);
  }

  sendMessage(): void {
    if (!this.draft.trim() || !this.activeConversation) return;
    this.activeConversation.messages.push({ byMe: true, text: this.draft.trim(), time: 'Now' });
    this.draft = '';
  }
}
