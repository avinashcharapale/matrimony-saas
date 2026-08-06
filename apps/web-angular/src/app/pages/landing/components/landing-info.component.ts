import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureItem } from '../landing.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-landing-info',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './landing-info.component.html',
  styleUrl: '../landing.css',
})
export class LandingInfoComponent {
  @Input({ required: true }) tenantDisplayName!: string;
  @Input({ required: true }) whyChoose!: FeatureItem[];
  @Input({ required: true }) howItWorks!: FeatureItem[];
}
