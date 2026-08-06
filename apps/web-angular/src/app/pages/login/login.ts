import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TenantService } from '../../services/tenant.service';
import { AuthService } from '../../services/auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  readonly tenant = inject(TenantService).tenant;
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  email = '';
  password = '';
  message = signal('');
  isLoading = signal(false);

  submit(form: NgForm): void {
    this.message.set('');

    if (form.invalid) {
      this.message.set(this.translate.instant('auth.invalidEmailPassword'));
      return;
    }

    const email = this.email.trim().toLowerCase();
    const password = this.password.trim();

    if (password.length < 6) {
      this.message.set(this.translate.instant('auth.passwordTooShort'));
      return;
    }

    this.isLoading.set(true);

    this.authService.login(email, password).subscribe({
      next: (result) => {
        this.isLoading.set(false);
        if (result.ok) {
          this.router.navigateByUrl('/home');
        } else {
          this.message.set(result.message);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.message.set(this.translate.instant('auth.loginFailed'));
      },
    });
  }
}
