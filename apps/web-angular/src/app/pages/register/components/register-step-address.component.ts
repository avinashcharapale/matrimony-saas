import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register-step-address',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register-step-address.component.html',
  styleUrl: '../register.css',
})
export class RegisterStepAddressComponent {
  @Input({ required: true }) vm!: any;

  sanitizePhoneInput(field: 'smsMobile' | 'mobile2' | 'phone1' | 'phone2'): void {
    const current = (this.vm?.[field] ?? '').toString();
    // Keep only phone-friendly characters; final strict validation still runs in parent step logic.
    this.vm[field] = current.replace(/[^\d+\-\s]/g, '');
  }
}
