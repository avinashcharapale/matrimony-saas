import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { patchState } from '@ngrx/signals';
import { AuthStore } from '@org/data-access-auth';
import { PlatformAuthService } from '../../services/platform-auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
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
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <mat-icon matPrefix>email</mat-icon>
            <input
              matInput
              type="email"
              formControlName="email"
              placeholder="admin@example.com"
              autocomplete="email"
            />
            @if (form.get('email')?.touched && form.get('email')?.errors?.['required']) {
              <mat-error>Email is required</mat-error>
            }
            @if (form.get('email')?.touched && form.get('email')?.errors?.['email']) {
              <mat-error>Enter a valid email</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <mat-icon matPrefix>lock</mat-icon>
            <input
              matInput
              type="password"
              formControlName="password"
              placeholder="Enter password"
              autocomplete="current-password"
            />
            @if (form.get('password')?.touched && form.get('password')?.errors?.['required']) {
              <mat-error>Password is required</mat-error>
            }
          </mat-form-field>

          <button
            mat-flat-button
            color="primary"
            type="submit"
            [disabled]="loading() || form.invalid"
          >
            @if (loading()) {
              Signing in...
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
    form {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    button[mat-flat-button] {
      width: 100%;
      margin-top: 0.5rem;
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
        patchState(this.authStore as never, {
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
