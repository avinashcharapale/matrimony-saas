import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-pricing',
  standalone: true,
  template: `
    <div class="pricing-page">
      <h1>Pricing</h1>
      <p>Simple, transparent pricing for every family.</p>
    </div>
  `,
  styles: [`.pricing-page { padding: 4rem 2rem; text-align: center; }`],
})
export class Pricing {}
