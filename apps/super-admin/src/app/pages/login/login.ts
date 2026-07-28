import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '@org/data-access-auth';
import { PlatformAuthService } from '../../services/platform-auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">SA</div>
          <h1>Super Admin</h1>
          <p>Platform administration access</p>
        </div>

        @if (errorMessage()) {
          <div class="error-banner">{{ errorMessage() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="field">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="admin@example.com"
              autocomplete="email"
            />
            @if (form.get('email')?.touched && form.get('email')?.errors?.['required']) {
              <span class="field-error">Email is required</span>
            }
            @if (form.get('email')?.touched && form.get('email')?.errors?.['email']) {
              <span class="field-error">Enter a valid email</span>
            }
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Enter password"
              autocomplete="current-password"
            />
            @if (form.get('password')?.touched && form.get('password')?.errors?.['required']) {
              <span class="field-error">Password is required</span>
            }
          </div>

          <button type="submit" class="btn-primary" [disabled]="loading() || form.invalid">
            @if (loading()) {
              <span class="spinner"></span> Signing in...
            } @else {
              Sign In
            }
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #2c003e 0%, #4a0072 100%);
    }
    .login-card {
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      width: 100%;
      max-width: 400px;
    }
    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .logo {
      width: 64px;
      height: 64px;
      background: #7b1fa2;
      color: white;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 auto 1rem;
    }
    .login-header h1 {
      font-size: 1.5rem;
      color: #2c003e;
      margin-bottom: 0.25rem;
    }
    .login-header p {
      color: #666;
      font-size: 0.875rem;
    }
    .error-banner {
      background: #ffebee;
      color: #c62828;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
      margin-bottom: 1rem;
      border: 1px solid #ffcdd2;
    }
    .field {
      margin-bottom: 1.25rem;
    }
    .field label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #333;
      margin-bottom: 0.375rem;
    }
    .field input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.9375rem;
      transition: border-color 0.2s;
      outline: none;
    }
    .field input:focus {
      border-color: #7b1fa2;
      box-shadow: 0 0 0 3px rgba(123, 31, 162, 0.1);
    }
    .field-error {
      display: block;
      color: #c62828;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }
    .btn-primary {
      width: 100%;
      padding: 0.75rem;
      background: #7b1fa2;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: background 0.2s;
      margin-top: 0.5rem;
    }
    .btn-primary:hover:not(:disabled) {
      background: #6a1b9a;
    }
    .btn-primary:disabled {
      background: #b39dba;
      cursor: not-allowed;
    }
    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authStore = inject(AuthStore);
  private readonly platformAuthService = inject(PlatformAuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    const { email, password } = this.form.getRawValue();
    this.loading.set(true);
    this.errorMessage.set(null);

    this.platformAuthService.login({ email, password }).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.authStore['patchState'](this.authStore, {
          accessToken: response.accessToken,
          storedRefreshToken: response.refreshToken,
          userId: response.userId,
          tenantId: response.tenantId,
          role: response.role,
          expiresAt: response.expiresAt,
        });
        localStorage.setItem('auth_token', response.accessToken);
        localStorage.setItem('refresh_token', response.refreshToken);
        localStorage.setItem('auth_user_id', String(response.userId));
        localStorage.setItem('auth_tenant_id', String(response.tenantId));
        localStorage.setItem('auth_role', response.role);
        localStorage.setItem('auth_expires_at', response.expiresAt);
        this.router.navigate(['/tenants']);
      },
      error: (error) => {
        this.loading.set(false);
        const message = error?.error?.message ?? error?.error ?? 'Invalid email or password.';
        this.errorMessage.set(typeof message === 'string' ? message : 'Invalid email or password.');
      },
    });
  }
}
