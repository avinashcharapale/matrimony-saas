import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MemberService } from '../../services/member.service';
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

  constructor(
    private readonly router: Router,
    private readonly memberService: MemberService
  ) {}

  submit(): void {
    this.message = '';
    this.isError = false;

    const fullName = [
      this.details.personal.firstName,
      this.details.personal.middleName,
      this.details.personal.lastName,
    ].filter((value) => value.trim().length > 0).join(' ');

    if (!this.details.personal.firstName.trim() || !this.details.personal.lastName.trim()) {
      this.isError = true;
      this.message = 'First name and last name are required.';
      return;
    }

    if (!this.details.personal.religion.trim()) {
      this.isError = true;
      this.message = 'Religion is required.';
      return;
    }

    if (!this.email.trim() || !this.email.includes('@')) {
      this.isError = true;
      this.message = 'Enter a valid email address.';
      return;
    }

    if (this.password.trim().length < 8) {
      this.isError = true;
      this.message = 'Password must be at least 8 characters.';
      return;
    }

    if (this.password.trim() !== this.confirmPassword.trim()) {
      this.isError = true;
      this.message = 'Password and confirm password must match.';
      return;
    }

    if (this.details.verification.verificationInput.trim() !== this.details.verification.verificationCode) {
      this.isError = true;
      this.message = 'Enter the correct verification code.';
      return;
    }

    const result = this.memberService.registerMember({
      name: fullName,
      email: this.email.trim().toLowerCase(),
      password: this.password.trim(),
      age: this.details.personal.dobYear ? new Date().getFullYear() - Number(this.details.personal.dobYear) : undefined,
      location: this.details.contact.residenceAddress || this.details.professional.workingCityCountry,
      occupation: this.details.professional.occupationDetails,
      bio: [
        this.details.professional.education && `Education: ${this.details.professional.education}`,
        this.details.professional.occupationDetails && `Occupation: ${this.details.professional.occupationDetails}`,
        this.details.expectations.expectedOccupationIncome && `Expectation: ${this.details.expectations.expectedOccupationIncome}`,
      ].filter(Boolean).join(' | '),
      registrationDetails: {
        ...this.details,
        contact: {
          ...this.details.contact,
          contactEmail: this.email.trim().toLowerCase(),
        },
        accountPassword: this.password.trim(),
        confirmPassword: this.confirmPassword.trim(),
      },
    });

    if (!result.ok) {
      this.isError = true;
      this.message = result.message;
      return;
    }

    this.message = 'Profile registered successfully. Please login.';
    this.router.navigateByUrl('/login');
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
