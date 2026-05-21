import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-cta-footer',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './landing-cta-footer.component.html',
  styleUrl: '../landing.css',
})
export class LandingCtaFooterComponent {
  @Input({ required: true }) tenant!: {
    displayName: string;
    supportPhone: string;
    supportEmail: string;
    supportAddress: string;
    copyrightText: string;
  };
}
