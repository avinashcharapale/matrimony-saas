import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatConversationDto } from './dtos';

@Injectable({ providedIn: 'root' })
export class ChatClient {
  private readonly http = inject(HttpClient);

  getById(id: string, tenantId?: string): Observable<ChatConversationDto> {
    let params = new HttpParams();
    if (tenantId !== undefined) {
      params = params.set('tenantId', tenantId);
    }
    return this.http.get<ChatConversationDto>(`/chat/ChatConversations/${id}`, { params });
  }

  update(id: string, body: ChatConversationDto): Observable<void> {
    return this.http.put<void>(`/chat/ChatConversations/${id}`, body);
  }

  delete(id: string, tenantId?: string): Observable<void> {
    let params = new HttpParams();
    if (tenantId !== undefined) {
      params = params.set('tenantId', tenantId);
    }
    return this.http.delete<void>(`/chat/ChatConversations/${id}`, { params });
  }

  getByUser(userId: string, tenantId?: string): Observable<ChatConversationDto[]> {
    let params = new HttpParams();
    if (tenantId !== undefined) {
      params = params.set('tenantId', tenantId);
    }
    return this.http.get<ChatConversationDto[]>(`/chat/ChatConversations/by-user/${userId}`, { params });
  }

  create(body: ChatConversationDto): Observable<void> {
    return this.http.post<void>('/chat/ChatConversations', body);
  }
}
