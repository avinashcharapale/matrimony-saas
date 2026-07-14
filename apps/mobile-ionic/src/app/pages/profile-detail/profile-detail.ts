import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject, signal, computed } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profile-detail',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './profile-detail.html',
  styleUrl: './profile-detail.css',
})
export class ProfileDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly memberService = inject(MemberService);

  readonly profile = signal<MemberRecord | null>(null);
  readonly currentPhotoIndex = signal(0);
  readonly isGalleryOpen = signal(false);
  readonly currentGalleryIndex = signal(0);

  readonly galleryPhotos = computed(() => {
    const p = this.profile();
    const photos: string[] = [this.getProfilePhoto()];
    if ((p?.registrationDetails?.photos.length ?? 0) > 1) {
      photos.push(this.getProfilePhoto(true));
    }
    if ((p?.registrationDetails?.photos.length ?? 0) > 2 && photos.length < 3) {
      photos.push(this.getProfilePhoto());
    }
    return photos.slice(0, 3);
  });

  readonly sections = computed(() => {
    const p = this.profile();
    const details = p?.registrationDetails;
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
          this.field('Full Name', p?.name || this.joinNames(personal?.firstName, personal?.middleName, personal?.lastName)),
          this.field('Date of Birth', this.dateText(personal?.dobDay, personal?.dobMonth, personal?.dobYear)),
          this.field('Age', p?.age),
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
          this.field('Education', professional?.education || p?.bio),
          this.field('Occupation', professional?.occupationDetails || p?.occupation),
          this.field('Working City', professional?.workingCityCountry),
          this.field('Income', professional?.incomeAmount),
        ],
      },
      {
        title: 'Address & Contact',
        fields: [
          this.field('Address', contact?.residenceAddress || p?.location),
          this.field('Email', contact?.contactEmail || p?.email),
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
  });

  ngOnInit(): void {
    const profileId = this.route.snapshot.paramMap.get('id');
    if (profileId) {
      this.profile.set(this.memberService.getProfileById(profileId));
    }
  }

  getProfilePhoto(secondary = false): string {
    const p = this.profile();
    if (!p) return '';
    const seed = encodeURIComponent((p.email || p.id || p.name).toLowerCase());
    return `https://i.pravatar.cc/300?u=${seed}${secondary ? '-alt' : ''}`;
  }

  getMemberId(): string {
    const p = this.profile();
    if (!p) return '';
    const seed = this.hashSeed(p);
    const code = 10000 + (seed % 89999);
    return `MBU${code}`;
  }

  nextPhoto(): void {
    if ((this.profile()?.registrationDetails?.photos.length ?? 0) > 1) {
      this.currentPhotoIndex.update(i => (i + 1) % 2);
    }
  }

  prevPhoto(): void {
    if ((this.profile()?.registrationDetails?.photos.length ?? 0) > 1) {
      this.currentPhotoIndex.update(i => (i - 1 + 2) % 2);
    }
  }

  openGallery(): void {
    this.isGalleryOpen.set(true);
    this.currentGalleryIndex.set(0);
  }

  closeGallery(): void {
    this.isGalleryOpen.set(false);
  }

  nextGalleryPhoto(): void {
    this.currentGalleryIndex.update(i => (i + 1) % this.galleryPhotos().length);
  }

  prevGalleryPhoto(): void {
    this.currentGalleryIndex.update(i => (i - 1 + this.galleryPhotos().length) % this.galleryPhotos().length);
  }

  goToGalleryPhoto(index: number): void {
    this.currentGalleryIndex.set(index);
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

  private hashSeed(profile: MemberRecord): number {
    const source = `${profile.id}-${profile.email}-${profile.name}`.toLowerCase();
    let hash = 0;
    for (let i = 0; i < source.length; i += 1) {
      hash = (hash << 5) - hash + source.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}
