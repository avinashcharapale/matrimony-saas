import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register-step-expectation',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register-step-expectation.component.html',
  styleUrl: '../register.css',
})
export class RegisterStepExpectationComponent {
  @Input({ required: true }) vm!: any;
}
