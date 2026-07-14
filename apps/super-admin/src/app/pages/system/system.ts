import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-system',
  standalone: true,
  template: `
    <div class="system-page">
      <h1>System Settings</h1>
      <p>Global platform configuration and maintenance tools.</p>
    </div>
  `,
  styles: [`.system-page h1 { margin-bottom: 1rem; }`],
})
export class System {}
