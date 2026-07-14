import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-subscriptions',
  standalone: true,
  template: `
    <div class="subscriptions-page">
      <h1>Subscription Management</h1>
      <p>Manage subscription plans and billing.</p>
    </div>
  `,
  styles: [`.subscriptions-page h1 { margin-bottom: 1rem; }`],
})
export class Subscriptions {}
