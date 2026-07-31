import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthStore } from '@org/data-access-auth';
import { PlatformAuthService } from '../services/platform-auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">SA</div>
          <div class="header-text">
            <h2>Super Admin</h2>
            <span class="header-sub">Platform Console</span>
          </div>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/tenants" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">T</span>
            Tenants
          </a>
          <a routerLink="/platform-admins" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">A</span>
            Admins
          </a>
          <a routerLink="/platform-roles" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">R</span>
            Roles
          </a>
          <a routerLink="/platform-permissions" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">P</span>
            Permissions
          </a>
          <a routerLink="/analytics" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">A</span>
            Analytics
          </a>
          <a routerLink="/system" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">S</span>
            System
          </a>
          <a routerLink="/features" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">F</span>
            Features
          </a>
        </nav>
        <div class="sidebar-footer">
          <button class="logout-btn" (click)="logout()">Sign Out</button>
        </div>
      </aside>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; min-height: 100vh; }
    .sidebar {
      width: 250px; background: #2c003e; color: white;
      display: flex; flex-direction: column; flex-shrink: 0;
    }
    .sidebar-header {
      padding: 1.5rem; border-bottom: 1px solid #4a0072;
      display: flex; align-items: center; gap: 0.75rem;
    }
    .logo {
      width: 40px; height: 40px; background: #7b1fa2; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.875rem; font-weight: 700; flex-shrink: 0;
    }
    .header-text h2 { font-size: 1rem; font-weight: 600; margin: 0; line-height: 1.2; }
    .header-sub { font-size: 0.6875rem; color: #b39dba; }
    .sidebar-nav { flex: 1; padding: 1rem 0; }
    .nav-item {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem 1.5rem; color: #d0b0e0; text-decoration: none;
      transition: all 0.2s; font-size: 0.875rem;
    }
    .nav-item:hover, .nav-item.active {
      background: #4a0072; color: white;
    }
    .nav-item.active { border-left: 3px solid #e040fb; }
    .nav-icon {
      width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
      background: rgba(255, 255, 255, 0.1); border-radius: 6px;
      font-size: 0.6875rem; font-weight: 700; flex-shrink: 0;
    }
    .sidebar-footer { padding: 1rem 1.5rem; border-top: 1px solid #4a0072; }
    .logout-btn {
      width: 100%; padding: 0.625rem; background: rgba(229, 57, 53, 0.15);
      color: #ef9a9a; border: 1px solid rgba(229, 57, 53, 0.3); border-radius: 6px;
      cursor: pointer; font-size: 0.875rem; font-weight: 500; transition: all 0.2s;
    }
    .logout-btn:hover { background: #e53935; color: white; border-color: #e53935; }
    .main-content { flex: 1; background: #f5f5f5; padding: 2rem; overflow-y: auto; }
  `],
})
export class Layout {
  private readonly authStore = inject(AuthStore);
  private readonly platformAuthService = inject(PlatformAuthService);
  private readonly router = inject(Router);

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
