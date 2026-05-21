import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrustCardItem } from '../landing.models';

@Component({
  selector: 'app-landing-trust',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-trust.component.html',
  styleUrl: '../landing.css',
})
export class LandingTrustComponent {
  @Input({ required: true }) tenantDisplayName!: string;
  @Input({ required: true }) trustCards!: TrustCardItem[];
}
