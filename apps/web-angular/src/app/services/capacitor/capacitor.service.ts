import { Injectable, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, PushNotificationSchema, Token } from '@capacitor/push-notifications';
import { LocalNotifications, LocalNotificationSchema, PermissionStatus } from '@capacitor/local-notifications';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Network, NetworkStatus } from '@capacitor/network';
import { App, AppState } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';

export interface PushNotificationToken {
  value: string;
}

export interface NotificationPermissionStatus {
  display: 'granted' | 'denied' | 'prompt';
  receive: 'granted' | 'denied' | 'prompt';
}

@Injectable({ providedIn: 'root' })
export class CapacitorService {
  private readonly isNative = Capacitor.isNativePlatform();
  private readonly platform = Capacitor.getPlatform();
  private pushToken: string | null = null;

  constructor() {
    if (this.isNative) {
      this.initializeNativeFeatures();
    }
  }

  private async initializeNativeFeatures(): Promise<void> {
    try {
      await this.setupPushNotifications();
      await this.setupLocalNotifications();
      await this.setupStatusBar();
      await this.setupKeyboard();
      await this.setupAppListeners();
      await SplashScreen.hide();
    } catch (error) {
      console.warn('Capacitor native features initialization failed:', error);
    }
  }

  // Push Notifications
  private async setupPushNotifications(): Promise<void> {
    try {
      const perm = await PushNotifications.requestPermissions();
      if (perm.receive === 'granted') {
        await PushNotifications.register();

        PushNotifications.addListener('registration', (token: Token) => {
          this.pushToken = token.value;
          console.log('Push registration token:', token.value);
        });

        PushNotifications.addListener('registrationError', (error: Error) => {
          console.error('Push registration error:', error);
        });

        PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
          console.log('Push notification received:', notification);
          this.handleNotification(notification);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          console.log('Push notification action performed:', action);
          this.handleNotificationAction(action);
        });
      }
    } catch (error) {
      console.warn('Push notifications setup failed:', error);
    }
  }

  private handleNotification(notification: PushNotificationSchema): void {
    // Emit event or handle notification
    window.dispatchEvent(new CustomEvent('pushNotification', { detail: notification }));
  }

  private handleNotificationAction(action: any): void {
    window.dispatchEvent(new CustomEvent('pushNotificationAction', { detail: action }));
  }

  async getPushToken(): Promise<string | null> {
    if (!this.isNative) return null;
    if (this.pushToken) return this.pushToken;

    try {
      const token = await PushNotifications.getToken();
      this.pushToken = token.value;
      return token.value;
    } catch {
      return null;
    }
  }

  // Local Notifications
  private async setupLocalNotifications(): Promise<void> {
    try {
      await LocalNotifications.requestPermissions();
    } catch (error) {
      console.warn('Local notifications setup failed:', error);
    }
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    id: number,
    extra?: Record<string, any>,
    at?: Date
  ): Promise<void> {
    if (!this.isNative) return;

    try {
      const notification: LocalNotificationSchema = {
        id,
        title,
        body,
        extra,
        schedule: at ? { at } : undefined,
        smallIcon: 'ic_stat_icon',
        iconColor: '#8e1f4f',
      };
      await LocalNotifications.schedule({ notifications: [notification] });
    } catch (error) {
      console.warn('Failed to schedule local notification:', error);
    }
  }

  async cancelLocalNotification(id: number): Promise<void> {
    if (!this.isNative) return;
    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
    } catch (error) {
      console.warn('Failed to cancel local notification:', error);
    }
  }

  // Camera
  async takePhoto(options: {
    quality?: number;
    allowEditing?: boolean;
    resultType?: CameraResultType;
    source?: CameraSource;
  } = {}): Promise<Photo | null> {
    if (!this.isNative) {
      // Fallback for web - use file input
      return this.webFileInput(options.resultType || CameraResultType.DataUrl);
    }

    try {
      const photo = await Camera.getPhoto({
        quality: options.quality ?? 90,
        allowEditing: options.allowEditing ?? true,
        resultType: options.resultType ?? CameraResultType.DataUrl,
        source: options.source ?? CameraSource.Camera,
      });
      return photo;
    } catch (error) {
      console.warn('Camera failed:', error);
      return null;
    }
  }

  async pickFromGallery(options: {
    quality?: number;
    allowEditing?: boolean;
    resultType?: CameraResultType;
  } = {}): Promise<Photo | null> {
    if (!this.isNative) {
      return this.webFileInput(options.resultType || CameraResultType.DataUrl);
    }

    try {
      const photo = await Camera.getPhoto({
        quality: options.quality ?? 90,
        allowEditing: options.allowEditing ?? true,
        resultType: options.resultType ?? CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });
      return photo;
    } catch (error) {
      console.warn('Gallery pick failed:', error);
      return null;
    }
  }

  private webFileInput(resultType: CameraResultType): Promise<Photo | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            dataUrl: reader.result as string,
            format: file.type.split('/')[1],
            saved: false,
            webPath: URL.createObjectURL(file),
            exif: null,
          } as Photo);
        };
        reader.readAsDataURL(file);
      };
      input.click();
    });
  }

  // Network
  async getNetworkStatus(): Promise<NetworkStatus> {
    if (!this.isNative) {
      return { connected: navigator.onLine, connectionType: 'wifi' };
    }
    return Network.getStatus();
  }

  onNetworkChange(callback: (status: NetworkStatus) => void): void {
    if (!this.isNative) {
      window.addEventListener('online', () => callback({ connected: true, connectionType: 'wifi' }));
      window.addEventListener('offline', () => callback({ connected: false, connectionType: 'none' }));
      return;
    }
    Network.addListener('networkStatusChange', callback);
  }

  // App Lifecycle
  private async setupAppListeners(): Promise<void> {
    App.addListener('appStateChange', (state: AppState) => {
      window.dispatchEvent(new CustomEvent('appStateChange', { detail: state }));
    });

    App.addListener('backButton', () => {
      window.dispatchEvent(new CustomEvent('backButton'));
    });
  }

  async exitApp(): Promise<void> {
    if (!this.isNative) return;
    await App.exitApp();
  }

  // Haptics
  async hapticImpact(style: ImpactStyle = ImpactStyle.Medium): Promise<void> {
    if (!this.isNative) return;
    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.warn('Haptics failed:', error);
    }
  }

  async hapticNotification(type: 'success' | 'warning' | 'error'): Promise<void> {
    if (!this.isNative) return;
    try {
      await Haptics.notification({ type });
    } catch (error) {
      console.warn('Haptics notification failed:', error);
    }
  }

  // Status Bar
  private async setupStatusBar(): Promise<void> {
    try {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#8e1f4f' });
      await StatusBar.setOverlaysWebView({ overlay: false });
    } catch (error) {
      console.warn('Status bar setup failed:', error);
    }
  }

  async setStatusBarStyle(style: Style, backgroundColor?: string): Promise<void> {
    if (!this.isNative) return;
    try {
      await StatusBar.setStyle({ style });
      if (backgroundColor) {
        await StatusBar.setBackgroundColor({ color: backgroundColor });
      }
    } catch (error) {
      console.warn('Failed to set status bar style:', error);
    }
  }

  // Keyboard
  private async setupKeyboard(): Promise<void> {
    try {
      await Keyboard.setResizeMode({ mode: 'body' });
      await Keyboard.setStyle({ style: Style.Dark });
    } catch (error) {
      console.warn('Keyboard setup failed:', error);
    }
  }

  async showKeyboard(): Promise<void> {
    if (!this.isNative) return;
    try {
      await Keyboard.show();
    } catch (error) {
      console.warn('Failed to show keyboard:', error);
    }
  }

  async hideKeyboard(): Promise<void> {
    if (!this.isNative) return;
    try {
      await Keyboard.hide();
    } catch (error) {
      console.warn('Failed to hide keyboard:', error);
    }
  }

  onKeyboardShow(callback: (info: { keyboardHeight: number }) => void): void {
    if (!this.isNative) return;
    Keyboard.addListener('keyboardWillShow', callback);
  }

  onKeyboardHide(callback: () => void): void {
    if (!this.isNative) return;
    Keyboard.addListener('keyboardWillHide', callback);
  }

  // Utility
  isNativePlatform(): boolean {
    return this.isNative;
  }

  getPlatform(): string {
    return this.platform;
  }

  async getAppVersion(): Promise<string> {
    if (!this.isNative) return '1.0.0';
    try {
      const { getPackageName, getVersion } = await import('@capacitor/app');
      const [packageName, version] = await Promise.all([getPackageName(), getVersion()]);
      return `${packageName} v${version}`;
    } catch {
      return '1.0.0';
    }
  }
}