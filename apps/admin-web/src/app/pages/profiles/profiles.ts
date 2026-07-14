import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profiles',
  standalone: true,
  template: `
    <div class="profiles-page">
      <h1>Profile Management</h1>
      <p>View and manage member profiles across all tenants.</p>
    </div>
  `,
  styles: [`.profiles-page h1 { margin-bottom: 1rem; }`],
})
export class Profiles {}
