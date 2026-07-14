import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Users</h3>
          <p class="stat-value">--</p>
        </div>
        <div class="stat-card">
          <h3>Active Profiles</h3>
          <p class="stat-value">--</p>
        </div>
        <div class="stat-card">
          <h3>Tenants</h3>
          <p class="stat-value">--</p>
        </div>
        <div class="stat-card">
          <h3>Subscriptions</h3>
          <p class="stat-value">--</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard h1 { margin-bottom: 2rem; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stat-card h3 { color: #666; margin-bottom: 0.5rem; }
    .stat-value { font-size: 2rem; font-weight: bold; color: #1976d2; }
  `],
})
export class Dashboard {}
