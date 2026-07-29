import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthStore } from '@org/data-access-auth';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <div class="admin-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <mat-icon class="logo-icon">favorite</mat-icon>
          <h2>Matrimony Admin</h2>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </a>
          @if (isAdmin()) {
            <a routerLink="/users" routerLinkActive="active" class="nav-item">
              <mat-icon>people</mat-icon>
              <span>Users</span>
            </a>
            <a routerLink="/roles" routerLinkActive="active" class="nav-item">
              <mat-icon>admin_panel_settings</mat-icon>
              <span>Roles</span>
            </a>
            <a routerLink="/permissions" routerLinkActive="active" class="nav-item">
              <mat-icon>vpn_key</mat-icon>
              <span>Permissions</span>
            </a>
            <a routerLink="/tenants" routerLinkActive="active" class="nav-item">
              <mat-icon>business</mat-icon>
              <span>Tenants</span>
            </a>
          }
          <a routerLink="/profiles" routerLinkActive="active" class="nav-item">
            <mat-icon>person_search</mat-icon>
            <span>Profiles</span>
          </a>
          @if (isAdmin()) {
            <a routerLink="/subscription-plans" routerLinkActive="active" class="nav-item">
              <mat-icon>card_membership</mat-icon>
              <span>Plan Management</span>
            </a>
          }
          <a routerLink="/subscriptions" routerLinkActive="active" class="nav-item">
            <mat-icon>subscriptions</mat-icon>
            <span>Subscriptions</span>
          </a>
        </nav>
        <div class="sidebar-footer">
          <div class="user-info">
            <mat-icon>account_circle</mat-icon>
            <span>{{ roleLabel() }}</span>
          </div>
          <button mat-flat-button color="warn" (click)="logout()" class="logout-btn">
            <mat-icon>logout</mat-icon>
            Logout
          </button>
        </div>
      </aside>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 260px;
      background: #1a1a2e;
      color: white;
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 100;
      overflow-y: auto;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid #2a2a4a;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #e91e63;
    }

    .sidebar-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: white;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0.75rem 1.5rem;
      color: #b0b0c0;
      text-decoration: none;
      transition: all 0.2s;
      font-size: 14px;
      border-left: 3px solid transparent;
    }

    .nav-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .nav-item:hover {
      background: #2a2a4a;
      color: white;
    }

    .nav-item.active {
      background: #2a2a4a;
      color: white;
      border-left-color: #1976d2;
    }

    .sidebar-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #2a2a4a;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      color: #b0b0c0;
      font-size: 13px;
    }

    .user-info mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .main-content {
      flex: 1;
      margin-left: 260px;
      background: #f5f5f5;
      padding: 2rem;
      min-height: 100vh;
    }
  `],
})
export class Layout {
  private readonly authStore = inject(AuthStore);

  private readonly session = this.authStore.session;

  readonly isAdmin = computed(() => {
    const s = this.session();
    return s?.role === 'TenantAdmin' || s?.role === 'SuperAdmin';
  });

  readonly roleLabel = computed(() => {
    const s = this.session();
    return s?.role ?? 'User';
  });

  logout(): void {
    this.authStore.logout().subscribe(() => {
      window.location.href = '/login';
    });
  }
}
