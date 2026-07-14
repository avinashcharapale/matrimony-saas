import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TenantService } from '../../services/tenant.service';
import { HomeSidebarComponent } from './components/home-sidebar.component';
import { HomeHeaderComponent } from './components/home-header.component';
import { HomeStatsComponent } from './components/home-stats.component';
import { HomeContentComponent } from './components/home-content.component';
import { HomeBottomComponent } from './components/home-bottom.component';
import { ActivityItem, EventItem, InterestItem, MatchItem, MessageItem, NotificationCard } from './home.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  standalone: true,
  imports: [
    HomeSidebarComponent,
    HomeHeaderComponent,
    HomeStatsComponent,
    HomeContentComponent,
    HomeBottomComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  readonly tenant = inject(TenantService).tenant;

  get brandMark(): string {
    return this.tenant.logoText
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  quickStats: NotificationCard[] = [
    {
      label: 'Profile Views',
      value: '86',
      hint: '+12 today',
      tone: 'orange',
    },
    {
      label: 'Matched Profiles',
      value: '24',
      hint: '3 new',
      tone: 'gold',
    },
    {
      label: 'Interests Received',
      value: '4',
      hint: '2 today',
      tone: 'green',
    },
    {
      label: 'Unread Messages',
      value: '3',
      hint: 'new',
      tone: 'purple',
    },
  ];

  topMatches: MatchItem[] = [
    {
      id: 'MBL113801',
      name: 'Priya Shinde',
      detail: '29 y, 5ft 4in, Engineer, Pune',
      score: 93,
      badge: 'verified',
    },
    {
      id: 'MBL113460',
      name: 'Snehal Deshmukh',
      detail: '27 y, 5ft 3in, Analyst, Nashik',
      score: 88,
      badge: 'active',
    },
    {
      id: 'MBL113302',
      name: 'Kavya Jadhav',
      detail: '26 y, 5ft 5in, Designer, Satara',
      score: 85,
      badge: 'new',
    },
  ];

  interests: InterestItem[] = [
    {
      name: 'Anita Patil',
      detail: 'Viewed your profile 1h ago',
    },
    {
      name: 'Pooja More',
      detail: 'Sent interest 3h ago',
    },
    {
      name: 'Rutuja Pawar',
      detail: 'Shortlisted your profile',
    },
  ];

  activities: ActivityItem[] = [
    {
      text: 'MBL113901 viewed your profile',
      time: '10m ago',
    },
    {
      text: 'You sent interest to MBL112250',
      time: '35m ago',
    },
    {
      text: 'MBL113312 shortlisted you',
      time: '1h ago',
    },
  ];

  messages: MessageItem[] = [
    {
      name: 'Priya Shinde',
      text: 'Can we talk this weekend?',
      unread: 2,
    },
    {
      name: 'Snehal Deshmukh',
      text: 'Thanks for sharing details.',
      unread: 1,
    },
    {
      name: 'AM Support',
      text: 'Your profile has been verified.',
    },
  ];

  upcomingEvents: EventItem[] = [
    {
      day: '19',
      month: 'APR',
      title: 'Maratha Meet - Pune',
      time: '11:00 AM',
    },
    {
      day: '26',
      month: 'APR',
      title: 'Virtual Meet - Maharashtra',
      time: '7:00 PM',
    },
    {
      day: '05',
      month: 'MAY',
      title: 'Navi Mumbai Session',
      time: '4:30 PM',
    },
  ];

  horoscopeTags: string[] = ['Reliable', 'Mature', 'Family Value', 'Kind'];
}
