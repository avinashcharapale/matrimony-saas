import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MemberRecord, MemberService } from '../../services/member.service';

interface ProfileField {
  label: string;
  value: string;
}

interface ProfileSection {
  title: string;
  fields: ProfileField[];
}

@Component({
  selector: 'app-profile-detail',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './profile-detail.html',
  styleUrl: './profile-detail.css',
})
export class ProfileDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly memberService = inject(MemberService);

  profile: MemberRecord | null = null;
  currentPhotoIndex = 0;
  isGalleryOpen = false;
  currentGalleryIndex = 0;

  ngOnInit(): void {
    const profileId = this.route.snapshot.paramMap.get('id');
    this.profile = profileId ? this.memberService.getProfileById(profileId) : null;
  }

  getProfilePhoto(secondary: boolean = false): string {
    if (!this.profile) return '';
    const seed = encodeURIComponent((this.profile.email || this.profile.id || this.profile.name).toLowerCase());
    return `https://i.pravatar.cc/300?u=${seed}${secondary ? '-alt' : ''}`;
  }

  getMemberId(): string {
    if (!this.profile) return '';
    const seed = this.hashSeed(this.profile);
    const code = 10000 + (seed % 89999);
    return `MBU${code}`;
  }

  nextPhoto(): void {
    if ((this.profile?.registrationDetails?.photos.length ?? 0) > 1) {
      this.currentPhotoIndex = (this.currentPhotoIndex + 1) % 2;
    }
  }

  prevPhoto(): void {
    if ((this.profile?.registrationDetails?.photos.length ?? 0) > 1) {
      this.currentPhotoIndex = (this.currentPhotoIndex - 1 + 2) % 2;
    }
  }

  get galleryPhotos(): string[] {
    const photos: string[] = [this.getProfilePhoto()];
    if ((this.profile?.registrationDetails?.photos.length ?? 0) > 1) {
      photos.push(this.getProfilePhoto(true));
    }
    if ((this.profile?.registrationDetails?.photos.length ?? 0) > 2 && photos.length < 3) {
      photos.push(this.getProfilePhoto());
    }
    return photos.slice(0, 3);
  }

  openGallery(): void {
    this.isGalleryOpen = true;
    this.currentGalleryIndex = 0;
  }

  closeGallery(): void {
    this.isGalleryOpen = false;
  }

  nextGalleryPhoto(): void {
    this.currentGalleryIndex = (this.currentGalleryIndex + 1) % this.galleryPhotos.length;
  }

  prevGalleryPhoto(): void {
    this.currentGalleryIndex = (this.currentGalleryIndex - 1 + this.galleryPhotos.length) % this.galleryPhotos.length;
  }

  get sections(): ProfileSection[] {
    const details = this.profile?.registrationDetails;
    const personal = details?.personal;
    const horoscope = details?.horoscope;
    const professional = details?.professional;
    const contact = details?.contact;
    const family = details?.family;
    const expectations = details?.expectations;

    return [
      {
        title: 'Personal Details',
        fields: [
          this.field('Full Name', this.profile?.name || this.joinNames(personal?.firstName, personal?.middleName, personal?.lastName)),
          this.field('Date of Birth', this.dateText(personal?.dobDay, personal?.dobMonth, personal?.dobYear)),
          this.field('Age', this.profile?.age),
          this.field('Height', this.heightText(personal?.heightFt, personal?.heightIn)),
          this.field('Weight', personal?.weightKg),
          this.field('Gender', personal?.gender),
          this.field('Religion', personal?.religion),
          this.field('Blood Group', personal?.bloodGroup),
          this.field('Complexion', personal?.complexion),
          this.field('Diet', personal?.diet),
          this.field('Marital Status', personal?.maritalStatus),
        ],
      },
      {
        title: 'Horoscope',
        fields: [
          this.field('Manglik', horoscope?.manglik),
          this.field('Rashi', horoscope?.rashi),
          this.field('Nakshatra', horoscope?.nakshatra),
          this.field('Birth Time', this.timeText(horoscope?.birthHour, horoscope?.birthMinute, horoscope?.birthPeriod)),
          this.field('Birth District', horoscope?.birthDistrict),
        ],
      },
      {
        title: 'Education & Occupation',
        fields: [
          this.field('Education', professional?.education || this.profile?.bio),
          this.field('Occupation', professional?.occupationDetails || this.profile?.occupation),
          this.field('Working City', professional?.workingCityCountry),
          this.field('Income', professional?.incomeAmount),
        ],
      },
      {
        title: 'Address & Contact',
        fields: [
          this.field('Address', contact?.residenceAddress || this.profile?.location),
          this.field('Email', contact?.contactEmail || this.profile?.email),
          this.field('Mobile', contact?.smsMobile),
          this.field('Phone', contact?.phonePrimary),
        ],
      },
      {
        title: 'Family Background',
        fields: [
          this.field('Father', family?.fatherStatus),
          this.field('Mother', family?.motherStatus),
          this.field('Brothers', family?.brothers),
          this.field('Sisters', family?.sisters),
          this.field('Native District', family?.nativeDistrict),
          this.field('Native Taluka', family?.nativeTaluka),
        ],
      },
      {
        title: 'Expectations',
        fields: [
          this.field('Preferred Cities', expectations?.preferredCities),
          this.field('Expected Caste', expectations?.expectedCaste),
          this.field('Expected Height', this.heightText(expectations?.expectedHeightFt, expectations?.expectedHeightIn)),
          this.field('Expected Education', expectations?.expectedEducation),
          this.field('Expected Occupation', expectations?.expectedOccupationIncome),
        ],
      },
    ];
  }

  private field(label: string, value: unknown): ProfileField {
    const text = `${value ?? ''}`.trim();
    return { label, value: text || '-' };
  }

  private dateText(day?: string, month?: string, year?: string): string {
    const parts = [day, month, year].filter(Boolean);
    return parts.length ? parts.join('/') : '-';
  }

  private timeText(hour?: string, minute?: string, period?: string): string {
    if (!hour && !minute && !period) {
      return '-';
    }
    return `${hour || '00'}:${minute || '00'} ${period || ''}`.trim();
  }

  private heightText(ft?: string, inch?: string): string {
    if (!ft && !inch) {
      return '-';
    }
    return `${ft || '0'} ft ${inch || '0'} in`;
  }

  private joinNames(first?: string, middle?: string, last?: string): string {
    return [first, middle, last].filter(Boolean).join(' ');
  }

  private hashSeed(profile: any): number {
    const source = `${profile.id}-${profile.email}-${profile.name}`.toLowerCase();
    let hash = 0;
    for (let i = 0; i < source.length; i += 1) {
      hash = (hash << 5) - hash + source.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}
