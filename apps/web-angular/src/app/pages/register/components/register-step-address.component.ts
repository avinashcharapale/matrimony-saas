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
}
