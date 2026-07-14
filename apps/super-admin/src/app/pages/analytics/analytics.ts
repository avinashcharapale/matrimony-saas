import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-analytics',
  standalone: true,
  template: `
    <div class="analytics-page">
      <h1>Platform Analytics</h1>
      <p>Usage statistics and performance metrics across all tenants.</p>
    </div>
  `,
  styles: [`.analytics-page h1 { margin-bottom: 1rem; }`],
})
export class Analytics {}
