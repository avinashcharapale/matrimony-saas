import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProfileItem } from '../landing.models';

@Component({
  selector: 'app-landing-recent-profiles',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-recent-profiles.component.html',
  styleUrl: '../landing.css',
})
export class LandingRecentProfilesComponent {
  @Input({ required: true }) profiles!: ProfileItem[];
}
