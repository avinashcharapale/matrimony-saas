import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-stepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './register-stepper.component.html',
  styleUrl: '../register.css',
})
export class RegisterStepperComponent {
  @Input({ required: true }) steps!: Array<{ title: string }>;
  @Input({ required: true }) currentStep!: number;
}
