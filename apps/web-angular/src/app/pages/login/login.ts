import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { TenantService } from '../../services/tenant.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  readonly tenant = inject(TenantService).tenant;
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  email = '';
  password = '';
  message = '';
  isLoading = false;

  async submit(form: NgForm): Promise<void> {
    this.message = '';
    this.isLoading = true;
    this.cdr.detectChanges();

    if (form.invalid) {
      this.message = 'Please enter a valid email and password.';
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    const email = this.email.trim().toLowerCase();
    const password = this.password.trim();

    if (password.length < 6) {
      this.message = 'Password must be at least 6 characters.';
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    try {
      const result = await this.authService.login(email, password);
      if (result.ok) {
        this.router.navigateByUrl('/home');
      } else {
        this.message = result.message;
        this.cdr.detectChanges();
      }
    } catch {
      this.message = 'Login failed. Please try again.';
      this.cdr.detectChanges();
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }
}
