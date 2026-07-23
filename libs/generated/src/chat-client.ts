import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ChatConversationDto,
  ChatMessageDto,
  CreateConversationRequest,
  SendMessageRequest,
  UpdateMessageRequest,
  MarkMessagesAsReadRequest,
  BlockUserRequest,
  ChatParticipantDto,
  AddChatParticipantRequest,
  UpdateChatParticipantRequest,
  BlockedChatUserDto,
} from './dtos';

@Injectable({ providedIn: 'root' })
export class ChatClient {
  private readonly http = inject(HttpClient);

  // ─── Conversations ────────────────────────────────────────────────────────

  getConversationById(id: number): Observable<ChatConversationDto> {
    return this.http.get<ChatConversationDto>(`/chat/ChatConversations/${id}`);
  }

  getConversationsByUser(userId: number): Observable<ChatConversationDto[]> {
    return this.http.get<ChatConversationDto[]>(`/chat/ChatConversations/by-user/${userId}`);
  }

  createConversation(body: CreateConversationRequest): Observable<void> {
    return this.http.post<void>('/chat/ChatConversations', body);
  }

  updateConversation(id: number, body: ChatConversationDto): Observable<void> {
    return this.http.put<void>(`/chat/ChatConversations/${id}`, body);
  }

  deleteConversation(id: number): Observable<void> {
    return this.http.delete<void>(`/chat/ChatConversations/${id}`);
  }

  getByUser(userId: string | number): Observable<ChatConversationDto[]> {
    return this.getConversationsByUser(Number(userId));
  }

  // ─── Messages ─────────────────────────────────────────────────────────────

  sendMessage(body: SendMessageRequest): Observable<ChatMessageDto> {
    return this.http.post<ChatMessageDto>('/chat/ChatMessages', body);
  }

  getMessagesByConversation(conversationId: number, page = 1, pageSize = 50): Observable<ChatMessageDto[]> {
    return this.http.get<ChatMessageDto[]>(`/chat/ChatMessages/conversation/${conversationId}`, {
      params: { page, pageSize },
    });
  }

  getMessageById(id: number): Observable<ChatMessageDto> {
    return this.http.get<ChatMessageDto>(`/chat/ChatMessages/${id}`);
  }

  updateMessage(id: number, body: UpdateMessageRequest): Observable<void> {
    return this.http.put<void>(`/chat/ChatMessages/${id}`, body);
  }

  deleteMessage(id: number): Observable<void> {
    return this.http.delete<void>(`/chat/ChatMessages/${id}`);
  }

  markMessagesAsRead(body: MarkMessagesAsReadRequest): Observable<void> {
    return this.http.post<void>('/chat/ChatMessages/mark-read', body);
  }

  // ─── Participants ─────────────────────────────────────────────────────────

  getParticipantsByConversation(conversationId: number): Observable<ChatParticipantDto[]> {
    return this.http.get<ChatParticipantDto[]>(`/chat/ChatParticipants/conversation/${conversationId}`);
  }

  addParticipant(body: AddChatParticipantRequest): Observable<void> {
    return this.http.post<void>('/chat/ChatParticipants', body);
  }

  updateParticipant(id: number, body: UpdateChatParticipantRequest): Observable<void> {
    return this.http.put<void>(`/chat/ChatParticipants/${id}`, body);
  }

  removeParticipant(id: number): Observable<void> {
    return this.http.delete<void>(`/chat/ChatParticipants/${id}`);
  }

  // ─── Blocking ─────────────────────────────────────────────────────────────

  blockUser(body: BlockUserRequest): Observable<void> {
    return this.http.post<void>('/chat/BlockedUsers', body);
  }

  getBlockedUsers(tenantId: number, blockerUserId?: number): Observable<BlockedChatUserDto[]> {
    let params: any = { tenantId };
    if (blockerUserId !== undefined) {
      params.blockerUserId = blockerUserId;
    }
    return this.http.get<BlockedChatUserDto[]>('/chat/BlockedUsers', { params });
  }

  unblockUser(blockId: number, unblockReason?: string): Observable<void> {
    let params: any = {};
    if (unblockReason !== undefined) {
      params.unblockReason = unblockReason;
    }
    return this.http.post<void>(`/chat/BlockedUsers/${blockId}/unblock`, {}, { params });
  }
}
