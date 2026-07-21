import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  NotificationDto,
  NotificationListResponse,
  NotificationDetailResponse,
  SendNotificationRequestDto,
} from './dtos';

@Injectable({ providedIn: 'root' })
export class NotificationClient {
  private readonly http = inject(HttpClient);

  getNotifications(page = 1, pageSize = 20, unreadOnly = false): Observable<NotificationListResponse> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('pageSize', String(pageSize))
      .set('unreadOnly', String(unreadOnly));
    return this.http.get<NotificationListResponse>('/notification/api/Notifications', { params });
  }

  getById(id: number): Observable<NotificationDetailResponse> {
    return this.http.get<NotificationDetailResponse>(`/notification/api/Notifications/${id}`);
  }

  getUnreadCount(): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>('/notification/api/Notifications/unread-count');
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`/notification/api/Notifications/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>('/notification/api/Notifications/read-all', {});
  }

  sendNotification(body: SendNotificationRequestDto): Observable<{ notificationId: number; title: string; status: string }> {
    return this.http.post<{ notificationId: number; title: string; status: string }>('/notification/api/Notifications/send', body);
  }
}
