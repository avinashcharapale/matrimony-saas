import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationCard } from '../home.models';

@Component({
  selector: 'app-home-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-stats.component.html',
  styleUrl: '../home.css',
})
export class HomeStatsComponent {
  @Input({ required: true }) stats!: NotificationCard[];
}
