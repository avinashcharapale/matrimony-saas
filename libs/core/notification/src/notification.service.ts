import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';

export type NotificationKind = 'success' | 'error' | 'info' | 'warning';

const NOTIFICATION_CONFIG: Record<NotificationKind, { duration: number; panelClass: string[] }> = {
  success: { duration: 4000, panelClass: ['app-snackbar', 'app-snackbar-success'] },
  error: { duration: 7000, panelClass: ['app-snackbar', 'app-snackbar-error'] },
  info: { duration: 4000, panelClass: ['app-snackbar', 'app-snackbar-info'] },
  warning: { duration: 6000, panelClass: ['app-snackbar', 'app-snackbar-warning'] },
};

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): MatSnackBarRef<TextOnlySnackBar> {
    return this.show(message, 'success');
  }

  error(message: string): MatSnackBarRef<TextOnlySnackBar> {
    return this.show(message, 'error', 'Close');
  }

  info(message: string): MatSnackBarRef<TextOnlySnackBar> {
    return this.show(message, 'info');
  }

  warning(message: string): MatSnackBarRef<TextOnlySnackBar> {
    return this.show(message, 'warning', 'Close');
  }

  private show(message: string, kind: NotificationKind, action = ''): MatSnackBarRef<TextOnlySnackBar> {
    return this.snackBar.open(message, action, NOTIFICATION_CONFIG[kind]);
  }
}
