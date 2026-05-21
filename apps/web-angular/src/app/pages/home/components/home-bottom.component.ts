import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventItem, MessageItem } from '../home.models';

@Component({
  selector: 'app-home-bottom',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home-bottom.component.html',
  styleUrl: '../home.css',
})
export class HomeBottomComponent {
  @Input({ required: true }) horoscopeTags!: string[];
  @Input({ required: true }) messages!: MessageItem[];
  @Input({ required: true }) upcomingEvents!: EventItem[];
}
