import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>Super Admin Login</h1>
        <p>System administration access</p>
      </div>
    </div>
  `,
  styles: [`
    .login-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; }
    .login-card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
  `],
})
export class Login {}
