import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatClient, ChatConversationDto } from '@org/generated';

@Injectable({ providedIn: 'root' })
export class ChatRepository {
  private readonly chat = inject(ChatClient);

  getConversationById(id: number, tenantId?: number): Observable<ChatConversationDto> {
    return this.chat.getChatConversationById(id, tenantId);
  }

  getConversationsByUser(userId: number, tenantId?: number): Observable<ChatConversationDto[]> {
    return this.chat.getChatConversationsByUser(userId, tenantId);
  }

  createConversation(body: ChatConversationDto): Observable<void> {
    return this.chat.createChatConversation(body);
  }

  updateConversation(id: number, body: ChatConversationDto): Observable<void> {
    return this.chat.updateChatConversation(id, body);
  }

  deleteConversation(id: number, tenantId?: number): Observable<void> {
    return this.chat.deleteChatConversation(id, tenantId);
  }
}
