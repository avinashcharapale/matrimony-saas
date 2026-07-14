import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-landing-hero',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './landing-hero.component.html',
  styleUrl: '../landing.css',
})
export class LandingHeroComponent {
  @Input({ required: true }) tenantDisplayName!: string;
}
