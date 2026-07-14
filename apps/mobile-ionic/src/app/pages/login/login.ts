import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
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
  imports: [IonicModule, CommonModule, FormsModule],
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
