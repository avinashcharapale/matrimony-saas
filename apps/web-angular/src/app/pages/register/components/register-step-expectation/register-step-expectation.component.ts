import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-register-step-expectation',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './register-step-expectation.component.html',
  styleUrl: '../../register.css',
})
export class RegisterStepExpectationComponent {
  @Input({ required: true }) form!: FormGroup;
  @Output() photoSelected = new EventEmitter<Event>();
  @Output() photo2Selected = new EventEmitter<Event>();
  @Output() refreshCaptcha = new EventEmitter<void>();

  get partner(): FormGroup { return this.form.get('partnerPreference') as FormGroup; }
  get verification(): FormGroup { return this.form.get('verification') as FormGroup; }
  get account(): FormGroup { return this.form.get('account') as FormGroup; }
  get photos(): FormGroup { return this.form.get('photos') as FormGroup; }
  get preferredCitiesCtrl(): FormControl { return this.form.get('preferredCities') as FormControl; }

  onPhoto(event: Event): void { this.photoSelected.emit(event); }
  onPhoto2(event: Event): void { this.photo2Selected.emit(event); }
  onRefreshCaptcha(): void { this.refreshCaptcha.emit(); }
}
