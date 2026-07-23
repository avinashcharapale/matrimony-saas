export interface NotificationCard {
  label: string;
  value: string;
  hint: string;
  tone: 'orange' | 'gold' | 'green' | 'purple';
}

export interface MatchItem {
  id: string;
  name: string;
  detail: string;
  score: number;
  badge: string;
}

export interface InterestItem {
  id: string;
  name: string;
  detail: string;
  profileId?: number;
}

export interface ActivityItem {
  text: string;
  time: string;
}

export interface MessageItem {
  name: string;
  text: string;
  unread?: number;
}

export interface EventItem {
  day: string;
  month: string;
  title: string;
  time: string;
}
