import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthStore } from '@org/data-access-auth';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>Super Admin</h2>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/tenants" routerLinkActive="active">Tenants</a>
          <a routerLink="/analytics" routerLinkActive="active">Analytics</a>
          <a routerLink="/system" routerLinkActive="active">System</a>
        </nav>
        <div class="sidebar-footer">
          <button (click)="logout()">Logout</button>
        </div>
      </aside>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; min-height: 100vh; }
    .sidebar { width: 250px; background: #2c003e; color: white; display: flex; flex-direction: column; }
    .sidebar-header { padding: 1.5rem; border-bottom: 1px solid #4a0072; }
    .sidebar-nav { flex: 1; padding: 1rem 0; }
    .sidebar-nav a { display: block; padding: 0.75rem 1.5rem; color: #d0b0e0; text-decoration: none; transition: all 0.2s; }
    .sidebar-nav a:hover, .sidebar-nav a.active { background: #4a0072; color: white; }
    .sidebar-footer { padding: 1rem 1.5rem; border-top: 1px solid #4a0072; }
    .sidebar-footer button { width: 100%; padding: 0.5rem; background: #e53935; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .main-content { flex: 1; background: #f5f5f5; padding: 2rem; }
  `],
})
export class Layout {
  private readonly authStore = inject(AuthStore);

  logout(): void {
    this.authStore.logout().subscribe(() => {
      window.location.href = '/login';
    });
  }
}
