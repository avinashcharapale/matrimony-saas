import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-users',
  standalone: true,
  template: `
    <div class="users-page">
      <h1>User Management</h1>
      <p>Manage registered users, roles, and permissions.</p>
    </div>
  `,
  styles: [`.users-page h1 { margin-bottom: 1rem; }`],
})
export class Users {}
