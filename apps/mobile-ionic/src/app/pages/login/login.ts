import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '@org/shared-services';
import { TenantService } from '../../services/tenant.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  readonly tenant = inject(TenantService).tenant;

  email = '';
  password = '';
  error = '';
  emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.error = '';
    const email = this.email.trim().toLowerCase();
    const password = this.password.trim();

    if (!this.emailPattern.test(email)) {
      this.error = 'Please enter a valid email address.';
      return;
    }

    if (password.length < 6 || password.length > 64) {
      this.error = 'Password must be between 6 and 64 characters.';
      return;
    }

    this.auth.login({ email, password }).subscribe({
      next: (result) => {
        if (result.accessToken) {
          this.router.navigateByUrl('/home');
          return;
        }
        this.error = 'Please enter valid credentials.';
      },
      error: () => {
        this.error = 'Please enter valid credentials.';
      },
    });
  }
}
