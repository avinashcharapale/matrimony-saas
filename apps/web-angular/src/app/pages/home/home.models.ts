export interface NotificationCard {
  label: string;
  value: string;
  hint: string;
  icon: string;
  tone: 'orange' | 'gold' | 'green' | 'purple';
}

export interface MatchItem {
  id: string;
  name: string;
  detail: string;
  score: number;
  badge: string;
  photoUrl?: string;
}

export interface InterestItem {
  id: string;
  name: string;
  detail: string;
  profileId?: number;
  photoUrl?: string;
  status?: string;
}

export interface ActivityItem {
  text: string;
  time: string;
}

export interface MessageItem {
  name: string;
  text: string;
  unread?: number;
  photoUrl?: string;
  conversationId?: number;
}

export interface ShortlistItem {
  profileId: number;
  name: string;
  detail: string;
  photoUrl?: string;
}
