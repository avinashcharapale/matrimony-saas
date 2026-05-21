import { Component, inject } from '@angular/core';
import { TenantService } from '../../services/tenant.service';
import { FeatureItem, ProfileItem, StatItem, TrustCardItem } from './landing.models';
import { LandingSectionsComponent } from './components/landing-sections.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [LandingSectionsComponent],
  templateUrl: './landing.html',
})
export class Landing {
  readonly tenant = inject(TenantService).tenant;

  readonly stats: StatItem[] = [
    { value: '5,967', label: 'Grooms', icon: '👨', accent: 'stat-blue' },
    { value: '5,509', label: 'Brides', icon: '👰', accent: 'stat-pink' },
    { value: '398', label: 'Divorcee Grooms', icon: '🧔', accent: 'stat-teal' },
    { value: '425', label: 'Divorcee Brides', icon: '👩', accent: 'stat-orange' },
  ];

  readonly whyChoose: FeatureItem[] = [
    {
      title: '26+ Years of Experience',
      description:
        'Decades of trusted matrimony service with deep roots in the Maratha community.',
    },
    {
      title: 'Exclusive for Marathas',
      description:
        'A focused platform for Marathas, including families, brides and grooms.',
    },
    {
      title: 'Verified Profiles',
      description:
        'Every profile is carefully verified for authenticity and better trust.',
    },
    {
      title: 'Affordable Membership',
      description:
        'A low yearly plan that keeps quality matchmaking accessible for everyone.',
    },
  ];

  readonly howItWorks: FeatureItem[] = [
    {
      title: 'Register & Create Profile',
      description:
        'Sign up and tell us your details including profession, education, and family background.',
    },
    {
      title: 'Enroll & Pay',
      description:
        'Activate your account with an affordable yearly membership.',
    },
    {
      title: 'Search Matches',
      description:
        'Browse verified profiles filtered by age, location, education and occupation.',
    },
    {
      title: 'Connect & Meet',
      description:
        'Exchange contacts and start your journey with confidence.',
    },
  ];

  readonly recentProfiles: ProfileItem[] = [
    {
      name: 'Rajesh Patil',
      age: 32,
      occupation: 'Civil Engineer',
      location: 'Pune, Maharashtra',
      status: 'Verified',
      icon: '👨',
      photoUrl: 'https://i.pravatar.cc/240?u=rajesh-patil',
    },
    {
      name: 'Priya Shinde',
      age: 29,
      occupation: 'IT Professional',
      location: 'Nashik, Maharashtra',
      status: 'Verified',
      icon: '👩',
      photoUrl: 'https://i.pravatar.cc/240?u=priya-shinde',
    },
    {
      name: 'Akash Gaikwad',
      age: 30,
      occupation: 'Doctor',
      location: 'Mumbai, Maharashtra',
      status: 'Verified',
      icon: '👨',
      photoUrl: 'https://i.pravatar.cc/240?u=akash-gaikwad',
    },
    {
      name: 'Snehal Deshmukh',
      age: 27,
      occupation: 'Data Analyst',
      location: 'Satara, Maharashtra',
      status: 'Verified',
      icon: '👩',
      photoUrl: 'https://i.pravatar.cc/240?u=snehal-deshmukh',
    },
    {
      name: 'Nikhil Jadhav',
      age: 31,
      occupation: 'Bank Manager',
      location: 'Kolhapur, Maharashtra',
      status: 'Verified',
      icon: '👨',
      photoUrl: 'https://i.pravatar.cc/240?u=nikhil-jadhav',
    },
    {
      name: 'Vaishnavi More',
      age: 26,
      occupation: 'Architect',
      location: 'Pune, Maharashtra',
      status: 'Verified',
      icon: '👩',
      photoUrl: 'https://i.pravatar.cc/240?u=vaishnavi-more',
    },
    {
      name: 'Sagar Powar',
      age: 33,
      occupation: 'Entrepreneur',
      location: 'Sangli, Maharashtra',
      status: 'Verified',
      icon: '👨',
      photoUrl: 'https://i.pravatar.cc/240?u=sagar-powar',
    },
    {
      name: 'Pooja Bhosale',
      age: 28,
      occupation: 'Teacher',
      location: 'Aurangabad, Maharashtra',
      status: 'Verified',
      icon: '👩',
      photoUrl: 'https://i.pravatar.cc/240?u=pooja-bhosale',
    },
    {
      name: 'Rohit Salunkhe',
      age: 30,
      occupation: 'Software Engineer',
      location: 'Thane, Maharashtra',
      status: 'Verified',
      icon: '👨',
      photoUrl: 'https://i.pravatar.cc/240?u=rohit-salunkhe',
    },
    {
      name: 'Aarti Chavan',
      age: 27,
      occupation: 'Pharmacist',
      location: 'Nagpur, Maharashtra',
      status: 'Verified',
      icon: '👩',
      photoUrl: 'https://i.pravatar.cc/240?u=aarti-chavan',
    },
  ];

  get autoScrollProfiles(): ProfileItem[] {
    return [...this.recentProfiles, ...this.recentProfiles];
  }

  readonly trustCards: TrustCardItem[] = [
    {
      value: '11,000+',
      title: 'Genuine Profiles',
      description: 'Every profile is verified by our team for authenticity and trust.',
      icon: '🪪',
    },
    {
      value: '26+ Years',
      title: 'Most Trusted',
      description: 'The most trusted Maratha matrimony service in Maharashtra.',
      icon: '🏆',
    },
    {
      value: 'AI + Manual',
      title: 'Smart Match',
      description: 'Find matches by preferences, location, education and more.',
      icon: '🔎',
    },
    {
      value: '28,000+',
      title: 'Weddings Complete',
      description: 'Thousands of happy families and success stories every year.',
      icon: '💍',
    },
  ];

}
