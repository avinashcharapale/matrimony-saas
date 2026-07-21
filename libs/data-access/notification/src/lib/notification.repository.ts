import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  NotificationClient,
  NotificationDto,
  NotificationListResponse,
  NotificationDetailResponse,
  SendNotificationRequestDto,
} from '@org/generated';

@Injectable({ providedIn: 'root' })
export class NotificationRepository {
  private readonly notification = inject(NotificationClient);

  getNotifications(page = 1, pageSize = 20, unreadOnly = false): Observable<NotificationListResponse> {
    return this.notification.getNotifications(page, pageSize, unreadOnly);
  }

  getById(id: number): Observable<NotificationDetailResponse> {
    return this.notification.getById(id);
  }

  getUnreadCount(): Observable<{ unreadCount: number }> {
    return this.notification.getUnreadCount();
  }

  markAsRead(id: number): Observable<void> {
    return this.notification.markAsRead(id);
  }

  markAllAsRead(): Observable<void> {
    return this.notification.markAllAsRead();
  }

  sendNotification(body: SendNotificationRequestDto): Observable<{ notificationId: number; title: string; status: string }> {
    return this.notification.sendNotification(body);
  }
}
