import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthStore } from '@org/data-access-auth';
import { PlatformAuthService } from '../services/platform-auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <div class="admin-layout" [class.sidebar-collapsed]="collapsed()">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">SA</div>
          @if (!collapsed()) {
            <div class="header-text">
              <h2>Super Admin</h2>
              <span class="header-sub">Platform Console</span>
            </div>
          }
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/tenants" routerLinkActive="active" class="nav-item" [title]="collapsed() ? 'Tenants' : ''">
            <mat-icon class="nav-icon">business</mat-icon>
            @if (!collapsed()) { Tenants }
          </a>
          <a routerLink="/platform-admins" routerLinkActive="active" class="nav-item" [title]="collapsed() ? 'Admins' : ''">
            <mat-icon class="nav-icon">admin_panel_settings</mat-icon>
            @if (!collapsed()) { Admins }
          </a>
          <a routerLink="/platform-roles" routerLinkActive="active" class="nav-item" [title]="collapsed() ? 'Roles' : ''">
            <mat-icon class="nav-icon">shield</mat-icon>
            @if (!collapsed()) { Roles }
          </a>
          <a routerLink="/platform-permissions" routerLinkActive="active" class="nav-item" [title]="collapsed() ? 'Permissions' : ''">
            <mat-icon class="nav-icon">lock</mat-icon>
            @if (!collapsed()) { Permissions }
          </a>
          <a routerLink="/analytics" routerLinkActive="active" class="nav-item" [title]="collapsed() ? 'Analytics' : ''">
            <mat-icon class="nav-icon">analytics</mat-icon>
            @if (!collapsed()) { Analytics }
          </a>
          <a routerLink="/system" routerLinkActive="active" class="nav-item" [title]="collapsed() ? 'System' : ''">
            <mat-icon class="nav-icon">settings_suggest</mat-icon>
            @if (!collapsed()) { System }
          </a>
          <a routerLink="/features" routerLinkActive="active" class="nav-item" [title]="collapsed() ? 'Features' : ''">
            <mat-icon class="nav-icon">toggle_on</mat-icon>
            @if (!collapsed()) { Features }
          </a>
        </nav>
        <div class="sidebar-footer">
          <button class="logout-btn" (click)="logout()" [title]="collapsed() ? 'Sign Out' : ''">
            <mat-icon class="logout-icon">logout</mat-icon>
            @if (!collapsed()) { Sign Out }
          </button>
        </div>
      </aside>
      <button class="collapse-toggle" (click)="collapsed.set(!collapsed())" [attr.aria-label]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'">
        {{ collapsed() ? '»' : '«' }}
      </button>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; min-height: 100vh; position: relative; }
    .sidebar {
      width: 250px; background: #2c003e; color: white;
      display: flex; flex-direction: column; flex-shrink: 0;
      transition: width 0.2s ease;
    }
    .sidebar-collapsed .sidebar { width: 60px; }
    .sidebar-header {
      padding: 1.5rem; border-bottom: 1px solid #4a0072;
      display: flex; align-items: center; gap: 0.75rem;
      overflow: hidden; white-space: nowrap;
    }
    .logo {
      width: 40px; height: 40px; background: #7b1fa2; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.875rem; font-weight: 700; flex-shrink: 0;
    }
    .header-text h2 { font-size: 1rem; font-weight: 600; margin: 0; line-height: 1.2; }
    .header-sub { font-size: 0.6875rem; color: #b39dba; }
    .collapse-toggle {
      position: fixed; top: 50%; left: 250px; transform: translate(-50%, -50%);
      width: 24px; height: 24px; border-radius: 50%;
      background: #7b1fa2; color: white; border: 2px solid #2c003e;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 0.75rem; font-weight: 700; z-index: 1000;
      transition: left 0.2s ease, background 0.15s;
    }
    .sidebar-collapsed .collapse-toggle { left: 60px; }
    .collapse-toggle:hover { background: #9c27b0; }
    .sidebar-nav { flex: 1; padding: 1rem 0; }
    .nav-item {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem 1.5rem; color: #d0b0e0; text-decoration: none;
      transition: all 0.2s; font-size: 0.875rem; white-space: nowrap;
      overflow: hidden;
    }
    .sidebar-collapsed .nav-item { justify-content: center; padding: 0.75rem; }
    .nav-item:hover, .nav-item.active {
      background: #4a0072; color: white;
    }
    .nav-item.active { border-left: 3px solid #e040fb; }
    .sidebar-collapsed .nav-item.active { border-left: none; }
    .nav-icon {
      font-size: 20px; width: 20px; height: 20px; flex-shrink: 0;
    }
    .sidebar-footer { padding: 1rem 1.5rem; border-top: 1px solid #4a0072; }
    .sidebar-collapsed .sidebar-footer { padding: 1rem 0.5rem; display: flex; justify-content: center; }
    .logout-btn {
      display: flex; align-items: center; gap: 0.75rem;
      width: 100%; padding: 0.625rem; background: rgba(229, 57, 53, 0.15);
      color: #ef9a9a; border: 1px solid rgba(229, 57, 53, 0.3); border-radius: 6px;
      cursor: pointer; font-size: 0.875rem; font-weight: 500; transition: all 0.2s;
    }
    .sidebar-collapsed .logout-btn { padding: 0.625rem; width: auto; }
    .logout-icon { font-size: 20px; width: 20px; height: 20px; }
    .logout-btn:hover { background: #e53935; color: white; border-color: #e53935; }
    .main-content { flex: 1; min-width: 0; background: #f5f5f5; padding: 2rem; overflow: auto; }
  `],
})
export class Layout {
  private readonly authStore = inject(AuthStore);
  private readonly platformAuthService = inject(PlatformAuthService);
  private readonly router = inject(Router);

  readonly collapsed = signal(false);

  logout(): void {
    const refreshToken = this.authStore.storedRefreshToken();
    if (refreshToken) {
      this.platformAuthService.logout(refreshToken).subscribe({
        next: () => {
          this.authStore.clearSession();
          this.router.navigate(['/login']);
        },
        error: () => {
          this.authStore.clearSession();
          this.router.navigate(['/login']);
        },
      });
    } else {
      this.authStore.clearSession();
      this.router.navigate(['/login']);
    }
  }
}
