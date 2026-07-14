import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-tenants',
  standalone: true,
  template: `
    <div class="tenants-page">
      <h1>Tenant Management</h1>
      <p>Create, configure, and manage all tenant instances across the platform.</p>
    </div>
  `,
  styles: [`.tenants-page h1 { margin-bottom: 1rem; }`],
})
export class Tenants {}
