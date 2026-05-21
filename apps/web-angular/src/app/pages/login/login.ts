import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { TenantService } from '../../services/tenant.service';
import { MemberService } from '../../services/member.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  readonly tenant = inject(TenantService).tenant;
  private readonly memberService = inject(MemberService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  message = '';
  isLoading = false;

  async submit(form: NgForm): Promise<void> {
    this.message = '';
    this.isLoading = true;

    if (form.invalid) {
      this.message = 'Please enter a valid email and password.';
      this.isLoading = false;
      return;
    }

    const email = this.email.trim().toLowerCase();
    const password = this.password.trim();

    if (password.length < 6) {
      this.message = 'Password must be at least 6 characters.';
      this.isLoading = false;
      return;
    }

    try {
      const result = await this.memberService.login(email, password);
      this.message = result.message;
      if (result.ok) {
        this.router.navigateByUrl('/home');
      }
    } catch (error: any) {
      this.message = error.message || 'Login failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
