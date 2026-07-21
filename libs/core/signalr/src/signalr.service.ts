import { Injectable, OnDestroy } from '@angular/core';
import { HubConnectionBuilder, HubConnection, HubConnectionState } from '@microsoft/signalr';
import { Subject, Observable, filter, map } from 'rxjs';

export interface NotificationEvent {
  notificationId: number;
  title: string;
  body: string;
  actionUrl?: string;
  createdAt: string;
}

export interface ChatMessageEvent {
  conversationId: number;
  senderUserId: number;
  message: string;
  sentAt: string;
}

export interface TypingEvent {
  conversationId: number;
  userId: number;
}

@Injectable({ providedIn: 'root' })
export class SignalRService implements OnDestroy {
  private notificationConnection: HubConnection | null = null;
  private chatConnection: HubConnection | null = null;

  private readonly notificationReceived$ = new Subject<NotificationEvent>();
  private readonly chatMessageReceived$ = new Subject<ChatMessageEvent>();
  private readonly userTyping$ = new Subject<TypingEvent>();
  private readonly connectionStateChanged$ = new Subject<{ hub: string; connected: boolean }>();

  get onNotificationReceived(): Observable<NotificationEvent> {
    return this.notificationReceived$.asObservable();
  }

  get onChatMessageReceived(): Observable<ChatMessageEvent> {
    return this.chatMessageReceived$.asObservable();
  }

  get onUserTyping(): Observable<TypingEvent> {
    return this.userTyping$.asObservable();
  }

  get onConnectionStateChanged(): Observable<{ hub: string; connected: boolean }> {
    return this.connectionStateChanged$.asObservable();
  }

  get isConnectedToNotifications(): boolean {
    return this.notificationConnection?.state === HubConnectionState.Connected;
  }

  get isConnectedToChat(): boolean {
    return this.chatConnection?.state === HubConnectionState.Connected;
  }

  async startNotificationHub(accessToken: string): Promise<void> {
    if (this.notificationConnection?.state === HubConnectionState.Connected) return;

    this.notificationConnection = new HubConnectionBuilder()
      .withUrl('/hubs/notifications', { accessTokenFactory: () => accessToken })
      .withAutomaticReconnect([0, 2, 5, 10, 15, 30])
      .build();

    this.notificationConnection.on('ReceiveNotification', (notification: NotificationEvent) => {
      this.notificationReceived$.next(notification);
    });

    this.notificationConnection.onreconnected(() => {
      this.connectionStateChanged$.next({ hub: 'notifications', connected: true });
    });

    this.notificationConnection.onreconnecting(() => {
      this.connectionStateChanged$.next({ hub: 'notifications', connected: false });
    });

    this.notificationConnection.onclose(() => {
      this.connectionStateChanged$.next({ hub: 'notifications', connected: false });
    });

    try {
      await this.notificationConnection.start();
      this.connectionStateChanged$.next({ hub: 'notifications', connected: true });
    } catch (err) {
      console.error('Notification hub connection failed:', err);
    }
  }

  async startChatHub(accessToken: string): Promise<void> {
    if (this.chatConnection?.state === HubConnectionState.Connected) return;

    this.chatConnection = new HubConnectionBuilder()
      .withUrl('/hubs/chat', { accessTokenFactory: () => accessToken })
      .withAutomaticReconnect([0, 2, 5, 10, 15, 30])
      .build();

    this.chatConnection.on('ReceiveMessage', (conversationId: number, senderUserId: number, message: string, sentAt: string) => {
      this.chatMessageReceived$.next({ conversationId, senderUserId, message, sentAt });
    });

    this.chatConnection.on('UserTyping', (conversationId: number, userId: number) => {
      this.userTyping$.next({ conversationId, userId });
    });

    this.chatConnection.onreconnected(() => {
      this.connectionStateChanged$.next({ hub: 'chat', connected: true });
    });

    this.chatConnection.onreconnecting(() => {
      this.connectionStateChanged$.next({ hub: 'chat', connected: false });
    });

    this.chatConnection.onclose(() => {
      this.connectionStateChanged$.next({ hub: 'chat', connected: false });
    });

    try {
      await this.chatConnection.start();
      this.connectionStateChanged$.next({ hub: 'chat', connected: true });
    } catch (err) {
      console.error('Chat hub connection failed:', err);
    }
  }

  async stopNotificationHub(): Promise<void> {
    if (this.notificationConnection) {
      await this.notificationConnection.stop();
      this.notificationConnection = null;
    }
  }

  async stopChatHub(): Promise<void> {
    if (this.chatConnection) {
      await this.chatConnection.stop();
      this.chatConnection = null;
    }
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    if (this.notificationConnection?.state === HubConnectionState.Connected) {
      await this.notificationConnection.invoke('MarkAsRead', notificationId);
    }
  }

  async markAllNotificationsAsRead(): Promise<void> {
    if (this.notificationConnection?.state === HubConnectionState.Connected) {
      await this.notificationConnection.invoke('MarkAllAsRead');
    }
  }

  async joinConversation(conversationId: number): Promise<void> {
    if (this.chatConnection?.state === HubConnectionState.Connected) {
      await this.chatConnection.invoke('JoinConversation', conversationId);
    }
  }

  async leaveConversation(conversationId: number): Promise<void> {
    if (this.chatConnection?.state === HubConnectionState.Connected) {
      await this.chatConnection.invoke('LeaveConversation', conversationId);
    }
  }

  async sendChatMessage(conversationId: number, message: string): Promise<void> {
    if (this.chatConnection?.state === HubConnectionState.Connected) {
      await this.chatConnection.invoke('SendMessage', conversationId, message);
    }
  }

  async sendTypingIndicator(conversationId: number): Promise<void> {
    if (this.chatConnection?.state === HubConnectionState.Connected) {
      await this.chatConnection.invoke('TypingIndicator', conversationId);
    }
  }

  ngOnDestroy(): void {
    this.stopNotificationHub();
    this.stopChatHub();
    this.notificationReceived$.complete();
    this.chatMessageReceived$.complete();
    this.userTyping$.complete();
    this.connectionStateChanged$.complete();
  }
}
