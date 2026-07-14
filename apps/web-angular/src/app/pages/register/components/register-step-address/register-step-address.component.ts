import { Component, Input } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-register-step-address',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register-step-address.component.html',
  styleUrl: '../../register.css',
})
export class RegisterStepAddressComponent {
  @Input({ required: true }) form!: FormGroup;

  get contact(): FormGroup { return this.form.get('contactDetails') as FormGroup; }
}
