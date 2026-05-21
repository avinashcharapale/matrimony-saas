import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatItem } from '../landing.models';

@Component({
  selector: 'app-landing-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-stats.component.html',
  styleUrl: '../landing.css',
})
export class LandingStatsComponent {
  @Input({ required: true }) stats!: StatItem[];
}
