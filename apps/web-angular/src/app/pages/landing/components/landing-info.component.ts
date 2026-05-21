import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureItem } from '../landing.models';

@Component({
  selector: 'app-landing-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-info.component.html',
  styleUrl: '../landing.css',
})
export class LandingInfoComponent {
  @Input({ required: true }) tenantDisplayName!: string;
  @Input({ required: true }) whyChoose!: FeatureItem[];
  @Input({ required: true }) howItWorks!: FeatureItem[];
}
