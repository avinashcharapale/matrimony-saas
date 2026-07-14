import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-features',
  standalone: true,
  template: `
    <div class="features-page">
      <h1>Features</h1>
      <p>Everything you need for successful matchmaking.</p>
    </div>
  `,
  styles: [`.features-page { padding: 4rem 2rem; text-align: center; }`],
})
export class Features {}
