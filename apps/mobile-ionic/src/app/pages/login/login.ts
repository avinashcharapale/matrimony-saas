import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthStore } from '@org/data-access-auth';
import { TenantService } from '../../services/tenant.service';
import { isValidEmail } from '@org/shared-utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-login',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  readonly tenant = inject(TenantService).tenant;
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  email = '';
  password = '';
  readonly error = signal('');
  readonly isLoading = signal(false);
  readonly emailTouched = signal(false);
  readonly passwordTouched = signal(false);

  readonly emailInvalid = computed(() => this.emailTouched() && !isValidEmail(this.email.trim()));
  readonly passwordInvalid = computed(() => {
    if (!this.passwordTouched()) return false;
    const len = this.password.trim().length;
    return len < 6 || len > 64;
  });

  onEmailBlur(): void {
    this.emailTouched.set(true);
  }

  onPasswordBlur(): void {
    this.passwordTouched.set(true);
  }

  submit() {
    this.error.set('');
    const email = this.email.trim().toLowerCase();
    const password = this.password.trim();

    if (!isValidEmail(email)) {
      this.error.set('Please enter a valid email address.');
      return;
    }

    if (password.length < 6 || password.length > 64) {
      this.error.set('Password must be between 6 and 64 characters.');
      return;
    }

    this.isLoading.set(true);
    this.authStore.login(email, password).subscribe({
      next: (result) => {
        this.isLoading.set(false);
        if (result.ok) {
          this.router.navigateByUrl('/home');
        } else {
          this.error.set(result.message);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.error.set('Please enter valid credentials.');
      },
    });
  }
}
