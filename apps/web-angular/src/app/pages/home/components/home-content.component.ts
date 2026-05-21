import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivityItem, InterestItem, MatchItem } from '../home.models';

@Component({
  selector: 'app-home-content',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home-content.component.html',
  styleUrl: '../home.css',
})
export class HomeContentComponent {
  @Input({ required: true }) topMatches!: MatchItem[];
  @Input({ required: true }) interests!: InterestItem[];
  @Input({ required: true }) activities!: ActivityItem[];
}
