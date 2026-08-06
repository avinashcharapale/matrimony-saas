import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { StatItem } from '../landing.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-landing-stats',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './landing-stats.component.html',
  styleUrl: '../landing.css',
})
export class LandingStatsComponent {
  @Input({ required: true }) stats!: StatItem[];
}
