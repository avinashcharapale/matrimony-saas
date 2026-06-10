import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@org/shared-services';
import { RegisterFormDetails, createEmptyRegisterFormDetails } from '@org/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  email = '';
  password = '';
  confirmPassword = '';
  details: RegisterFormDetails = {
    ...createEmptyRegisterFormDetails(),
    verification: {
      verificationCode: '58164',
      verificationInput: '',
    },
  };
  message = '';
  isError = false;
  isLoading = false;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  submit(): void {
    this.message = '';
    this.isError = false;
    this.isLoading = true;

    const fullName = [
      this.details.personal.firstName,
      this.details.personal.middleName,
      this.details.personal.lastName,
    ].filter((value) => value.trim().length > 0).join(' ');

    if (!this.details.personal.firstName.trim() || !this.details.personal.lastName.trim()) {
      this.isError = true;
      this.message = 'First name and last name are required.';
      this.isLoading = false;
      return;
    }

    if (!this.details.personal.religion.trim()) {
      this.isError = true;
      this.message = 'Religion is required.';
      this.isLoading = false;
      return;
    }

    if (!this.email.trim() || !this.email.includes('@')) {
      this.isError = true;
      this.message = 'Enter a valid email address.';
      this.isLoading = false;
      return;
    }

    if (this.password.trim().length < 8) {
      this.isError = true;
      this.message = 'Password must be at least 8 characters.';
      this.isLoading = false;
      return;
    }

    if (this.password.trim() !== this.confirmPassword.trim()) {
      this.isError = true;
      this.message = 'Password and confirm password must match.';
      this.isLoading = false;
      return;
    }

    if (this.details.verification.verificationInput.trim() !== this.details.verification.verificationCode) {
      this.isError = true;
      this.message = 'Enter the correct verification code.';
      this.isLoading = false;
      return;
    }

    this.authService
      .register({
        email: this.email.trim().toLowerCase(),
        password: this.password.trim(),
        confirmPassword: this.confirmPassword.trim(),
        tenantId: 1,
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.message = `Profile registered successfully for ${fullName}.`;
          this.router.navigateByUrl('/home');
        },
        error: (error) => {
          this.isLoading = false;
          this.isError = true;
          this.message = error?.error?.error || 'Registration failed. Please try again.';
        },
      });
  }

  onPrimaryPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const next = this.details.photos.filter((photo) => photo.photoSlot !== 1);
    this.details.photos = file
      ? [{ photoSlot: 1, fileName: file.name, isPrimary: true }, ...next]
      : next;
  }

  onSecondaryPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const next = this.details.photos.filter((photo) => photo.photoSlot !== 2);
    this.details.photos = file
      ? [...next, { photoSlot: 2, fileName: file.name }].sort((a, b) => a.photoSlot - b.photoSlot)
      : next;
  }

  get primaryPhotoName(): string {
    return this.details.photos.find((photo) => photo.photoSlot === 1)?.fileName ?? '';
  }

  get secondaryPhotoName(): string {
    return this.details.photos.find((photo) => photo.photoSlot === 2)?.fileName ?? '';
  }
}
