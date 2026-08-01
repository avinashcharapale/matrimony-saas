import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent, EmptyStateComponent } from '@org/shared-ui';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationStore } from '@org/data-access-notification';
import { SignalRService, NotificationEvent } from '@org/core';
import { AuthStore } from '@org/data-access-auth';
import { Subscription } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule, PageHeaderComponent, EmptyStateComponent,
    MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="notifications-page">
      <ui-page-header title="Notifications" subtitle="In-app notifications for your account">
        <div class="header-actions">
          <button mat-stroked-button color="primary" (click)="reload()">
            <mat-icon>refresh</mat-icon>
            Refresh
          </button>
          @if (store.hasUnread()) {
            <button mat-flat-button color="primary" (click)="markAllRead()">
              <mat-icon>done_all</mat-icon>
              Mark all as read
            </button>
          }
        </div>
      </ui-page-header>

      <div class="filter-bar">
        <button
          class="filter-btn"
          [class.filter-btn--active]="unreadOnly() === false"
          (click)="setFilter(false)"
        >All</button>
        <button
          class="filter-btn"
          [class.filter-btn--active]="unreadOnly() === true"
          (click)="setFilter(true)"
        >Unread ({{ store.unreadCount() }})</button>
      </div>

      @if (store.loading()) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading notifications...</span>
        </div>
      } @else if (store.notifications().length === 0) {
        <ui-empty-state
          icon="notifications_none"
          message="{{ unreadOnly() ? 'No unread notifications' : 'No notifications yet' }}"
        ></ui-empty-state>
      } @else {
        <div class="notification-list">
          @for (notification of store.notifications(); track notification.notificationId) {
            <div class="notification-card" [class.notification-card--unread]="!notification.isRead">
              <div class="notification-icon">
                <mat-icon>{{ iconFor(notification.typeCode) }}</mat-icon>
              </div>
              <div class="notification-body">
                <div class="notification-header">
                  <span class="notification-title">{{ notification.title }}</span>
                  @if (!notification.isRead) {
                    <span class="unread-dot" title="Unread"></span>
                  }
                </div>
                @if (notification.body) {
                  <p class="notification-text">{{ notification.body }}</p>
                }
                <div class="notification-meta">
                  @if (notification.categoryName) {
                    <span class="notification-tag">{{ notification.categoryName }}</span>
                  }
                  <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
                </div>
              </div>
              <div class="notification-actions">
                @if (!notification.isRead && notification.notificationId != null) {
                  <button mat-icon-button color="primary" title="Mark as read"
                    (click)="markRead(notification.notificationId)">
                    <mat-icon>check</mat-icon>
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .notifications-page { position: relative; }
    .header-actions { display: flex; gap: 8px; }
    .filter-bar {
      display: flex; gap: 8px; margin-bottom: 1.25rem;
    }
    .filter-btn {
      padding: 6px 14px; border-radius: 9999px; border: 1px solid #e0e0e0;
      background: white; color: #555; cursor: pointer; font-size: 13px;
      transition: all 0.2s;
    }
    .filter-btn--active { background: #1976d2; color: white; border-color: #1976d2; }
    .loading-state {
      display: flex; flex-direction: column; align-items: center; gap: 12px;
      padding: 3rem; color: #757575; font-size: 14px;
      background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .notification-list {
      display: flex; flex-direction: column; gap: 10px;
    }
    .notification-card {
      display: flex; align-items: flex-start; gap: 14px;
      background: white; border-radius: 12px; padding: 1rem 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border-left: 3px solid transparent;
    }
    .notification-card--unread {
      background: #f0f7ff;
      border-left-color: #1976d2;
    }
    .notification-icon {
      width: 40px; height: 40px; border-radius: 50%;
      background: #e3f2fd; color: #1976d2;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .notification-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .notification-body { flex: 1; min-width: 0; }
    .notification-header {
      display: flex; align-items: center; gap: 8px; margin-bottom: 4px;
    }
    .notification-title { font-weight: 600; font-size: 14px; color: #222; }
    .unread-dot {
      width: 8px; height: 8px; border-radius: 50%; background: #1976d2;
      display: inline-block; flex-shrink: 0;
    }
    .notification-text {
      margin: 0 0 8px; color: #555; font-size: 13px; line-height: 1.5;
      overflow-wrap: anywhere;
    }
    .notification-meta { display: flex; align-items: center; gap: 10px; }
    .notification-tag {
      background: #eceff1; color: #607d8b; border-radius: 10px;
      padding: 1px 8px; font-size: 12px; font-weight: 500;
    }
    .notification-time { color: #9e9e9e; font-size: 12px; }
    .notification-actions { flex-shrink: 0; }
  `],
})
export class Notifications implements OnInit, OnDestroy {
  readonly store = inject(NotificationStore);
  private readonly signalR = inject(SignalRService);
  private readonly authStore = inject(AuthStore);

  readonly unreadOnly = signal(false);

  private hubSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.reload();
    this.connectHub();
  }

  ngOnDestroy(): void {
    this.hubSubscription?.unsubscribe();
  }

  reload(): void {
    this.store.loadNotifications(1, 20, this.unreadOnly());
    this.store.loadUnreadCount();
  }

  setFilter(unreadOnly: boolean): void {
    this.unreadOnly.set(unreadOnly);
    this.store.loadNotifications(1, 20, unreadOnly);
  }

  markRead(id: number): void {
    this.store.markAsRead(id).subscribe();
  }

  markAllRead(): void {
    this.store.markAllAsRead().subscribe();
  }

  private connectHub(): void {
    const token = this.authStore.accessToken();
    if (!token) return;

    this.signalR.startNotificationHub(token);

    this.hubSubscription = this.signalR.onNotificationReceived.subscribe(
      (event: NotificationEvent) => {
        this.store.addNotification({
          notificationId: event.notificationId,
          title: event.title,
          body: event.body,
          actionUrl: event.actionUrl,
          createdAt: event.createdAt,
          isRead: false,
        });
      },
    );
  }

  iconFor(typeCode?: string): string {
    switch (typeCode?.toLowerCase()) {
      case 'match': return 'favorite';
      case 'message': case 'chat': return 'chat';
      case 'subscription': case 'payment': case 'billing': return 'card_membership';
      case 'profile': return 'person';
      case 'security': return 'security';
      case 'system': case 'admin': return 'campaign';
      default: return 'notifications';
    }
  }

  formatTime(value?: string): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }
}
