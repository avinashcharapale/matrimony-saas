import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TrustCardItem } from '../landing.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-landing-trust',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './landing-trust.component.html',
  styleUrl: '../landing.css',
})
export class LandingTrustComponent {
  @Input({ required: true }) tenantDisplayName!: string;
  @Input({ required: true }) trustCards!: TrustCardItem[];
}
