import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, computed, inject, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore } from '@org/data-access-auth';
import { RegisterFormDetails, createEmptyRegisterFormDetails } from '@org/models';
import { isValidEmail } from '@org/shared-utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-register',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

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
  photos = signal(this.details.photos);
  message = signal('');
  isError = signal(false);
  isLoading = signal(false);

  constructor() {}

  submit(): void {
    this.message.set('');
    this.isError.set(false);
    this.isLoading.set(true);

    localStorage.clear();
    sessionStorage.clear();

    const fullName = [
      this.details.personal.firstName,
      this.details.personal.middleName,
      this.details.personal.lastName,
    ].filter((value) => value.trim().length > 0).join(' ');

    if (!this.details.personal.firstName.trim() || !this.details.personal.lastName.trim()) {
      this.isError.set(true);
      this.message.set('First name and last name are required.');
      this.isLoading.set(false);
      return;
    }

    if (!this.details.personal.religion.trim()) {
      this.isError.set(true);
      this.message.set('Religion is required.');
      this.isLoading.set(false);
      return;
    }

    if (!isValidEmail(this.email)) {
      this.isError.set(true);
      this.message.set('Enter a valid email address.');
      this.isLoading.set(false);
      return;
    }

    if (this.password.trim().length < 8) {
      this.isError.set(true);
      this.message.set('Password must be at least 8 characters.');
      this.isLoading.set(false);
      return;
    }

    if (this.password.trim() !== this.confirmPassword.trim()) {
      this.isError.set(true);
      this.message.set('Password and confirm password must match.');
      this.isLoading.set(false);
      return;
    }

    if (this.details.verification.verificationInput.trim() !== this.details.verification.verificationCode) {
      this.isError.set(true);
      this.message.set('Enter the correct verification code.');
      this.isLoading.set(false);
      return;
    }

    this.authStore
      .register(this.email.trim().toLowerCase(), this.password.trim(), this.confirmPassword.trim(), 1)
      .subscribe({
        next: (result) => {
          this.isLoading.set(false);
          if (result.ok) {
            this.message.set(`Profile registered successfully for ${fullName}.`);
            this.router.navigateByUrl('/home');
          } else {
            this.isError.set(true);
            this.message.set(result.message);
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.isError.set(true);
          this.message.set(error?.error?.error || 'Registration failed. Please try again.');
        },
      });
  }

  onPrimaryPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const next = this.photos().filter((photo) => photo.photoSlot !== 1);
    const updated = file
      ? [{ photoSlot: 1, fileName: file.name, isPrimary: true }, ...next]
      : next;
    this.details.photos = updated;
    this.photos.set(updated);
  }

  onSecondaryPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const next = this.photos().filter((photo) => photo.photoSlot !== 2);
    const updated = file
      ? [...next, { photoSlot: 2, fileName: file.name }].sort((a, b) => a.photoSlot - b.photoSlot)
      : next;
    this.details.photos = updated;
    this.photos.set(updated);
  }

  primaryPhotoName = computed(() => this.photos().find((photo) => photo.photoSlot === 1)?.fileName ?? '');

  secondaryPhotoName = computed(() => this.photos().find((photo) => photo.photoSlot === 2)?.fileName ?? '');
}
