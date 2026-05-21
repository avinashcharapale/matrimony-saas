import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TenantService } from '../../services/tenant.service';

interface MobileProfile {
  name: string;
  age: number;
  occupation: string;
  location: string;
  icon: string;
}

const DUMMY_PROFILES: MobileProfile[] = [
  {
    name: 'Rajesh Patil',
    age: 32,
    occupation: 'Civil Engineer',
    location: 'Pune, Maharashtra',
    icon: '👨',
  },
  {
    name: 'Priya Shinde',
    age: 29,
    occupation: 'IT Professional',
    location: 'Nashik, Maharashtra',
    icon: '👩',
  },
  {
    name: 'Akash Gaikwad',
    age: 30,
    occupation: 'Doctor',
    location: 'Mumbai, Maharashtra',
    icon: '👨',
  },
];

const QUICK_STATS = [
  { value: '5,967', label: 'Grooms' },
  { value: '5,509', label: 'Brides' },
  { value: '28,000+', label: 'Weddings Complete' },
];

const WHY_US = [
  '26+ years of trusted service in the Maratha community.',
  'Verified profiles for safer and meaningful matchmaking.',
  'Affordable yearly membership with personal support.',
];

const HOW_IT_WORKS = [
  { title: 'Register', description: 'Create your profile in minutes.' },
  { title: 'Enroll', description: 'Activate your account with yearly membership.' },
  { title: 'Search', description: 'Filter and browse relevant verified matches.' },
  { title: 'Connect', description: 'Get details and start the conversation.' },
];

const TRUST_CARDS = [
  { value: '11,000+', title: 'Genuine Profiles', icon: '🪪' },
  { value: '26+ Years', title: 'Most Trusted', icon: '🏆' },
  { value: 'Smart Match', title: 'Advanced Search', icon: '🔎' },
  { value: '28,000+', title: 'Success Stories', icon: '💍' },
];

const CTA_TEXT = {
  heading: 'Begin Your Journey Today',
  subheading: 'Join families who found their perfect match with us.',
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  readonly tenant = inject(TenantService).tenant;

  profiles = DUMMY_PROFILES;
  stats = QUICK_STATS;
  whyUs = WHY_US;
  howItWorks = HOW_IT_WORKS;
  trustCards = TRUST_CARDS;
  ctaText = CTA_TEXT;

  get heroText() {
    return {
      heading: `Welcome to ${this.tenant.displayName} Marriage Bureau`,
      subheading:
        'Trusted Vadhhu Var Suchak Kendra for the Maratha community with verified profiles and thoughtful matching.',
    };
  }
}
