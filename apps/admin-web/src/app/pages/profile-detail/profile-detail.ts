import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProfileClient, ProfileDetailDto, SubscriptionClient, SubscriptionStatusDto } from '@org/generated';
import { StatusBadgeComponent } from '@org/shared-ui';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { switchMap } from 'rxjs/operators';

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
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, StatusBadgeComponent],
  template: `
    <div class="detail-page">
      <div class="detail-header">
        <a routerLink="/profiles" class="back-link">
          <mat-icon>arrow_back</mat-icon>
          <span>Back to Profiles</span>
        </a>
        <h1>{{ profile()?.fullName ?? 'Profile' }}</h1>
      </div>

      @if (loading()) {
        <div class="loading-state">Loading profile...</div>
      } @else if (profile(); as p) {
        <div class="detail-body">
          <aside class="detail-sidebar">
            <div class="photos-card">
              <div class="photos-header">
                <h3>Photos ({{ (p.photos ?? []).length }})</h3>
                @if (p.photos?.length) {
                  <button class="view-all-btn" (click)="openGallery(0)">View all</button>
                }
              </div>
              @if (p.photos?.length) {
                <div class="photo-grid">
                  @for (photo of p.photos; track photo.photoId; let i = $index) {
                    <div class="photo-thumb" (click)="openGallery(i)">
                      <img [src]="photo.fileUrl" [alt]="photo.fileName" />
                    </div>
                  }
                </div>
              } @else {
                <div class="no-photos">No photos</div>
              }
            </div>

            <div class="section-card">
              <div class="section-card-header">
                <mat-icon class="section-card-icon">card_membership</mat-icon>
                <span>Subscription Plan</span>
              </div>
              @if (userSubscription(); as sub) {
                <div class="section-card-body">
                  <div class="sc-row">
                    <span class="sc-label">Plan</span>
                    <span class="sc-value">{{ sub.planName ?? 'No Plan' }}</span>
                  </div>
                  <div class="sc-row">
                    <span class="sc-label">Status</span>
                    <span class="sc-value">
                      <ui-status-badge [status]="getUserSubStatusText()"></ui-status-badge>
                    </span>
                  </div>
                  <div class="sc-row">
                    <span class="sc-label">Trial</span>
                    <span class="sc-value">{{ sub.isTrial ? 'Yes' : 'No' }}</span>
                  </div>
                  <div class="sc-row">
                    <span class="sc-label">Start Date</span>
                    <span class="sc-value">{{ formatDate(sub.startDate) }}</span>
                  </div>
                  <div class="sc-row">
                    <span class="sc-label">Expiry Date</span>
                    <span class="sc-value">{{ formatDate(sub.expiresAt) }}</span>
                  </div>
                  @if (sub.effectiveFeatures?.length) {
                    <div class="sc-divider"></div>
                    <div class="sc-features">
                      <div class="sc-features-title">Features</div>
                      @for (feat of sub.effectiveFeatures; track feat.code) {
                        <div class="sc-feature-row">
                          <mat-icon class="sc-feature-icon">check_circle</mat-icon>
                          <span>{{ feat.name || feat.code }}</span>
                        </div>
                      }
                    </div>
                  }
                </div>
              } @else {
                <div class="section-card-body sc-empty">
                  <mat-icon>info_outline</mat-icon>
                  <span>No active subscription</span>
                </div>
              }
            </div>
          </aside>

          <main class="detail-main">
            @for (section of profileSections(); track section.title; let i = $index) {
              <div class="section-card" [class.collapsed]="!isSectionOpen(i)">
                <div class="section-card-header clickable" (click)="toggleSection(i)">
                  <span>{{ section.title }}</span>
                  <mat-icon class="collapse-icon">{{ isSectionOpen(i) ? 'expand_less' : 'expand_more' }}</mat-icon>
                </div>
                @if (isSectionOpen(i)) {
                  <div class="section-card-body">
                    @for (field of section.fields; track field.label) {
                      <div class="sc-row">
                        <span class="sc-label">{{ field.label }}</span>
                        <span class="sc-value">{{ field.value }}</span>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </main>
        </div>
      } @else {
        <div class="empty-state">Profile not found</div>
      }

      @if (isGalleryOpen()) {
        <div class="gallery-overlay" (click)="closeGallery()">
          <div class="gallery-modal" (click)="$event.stopPropagation()">
            <button class="gallery-close" (click)="closeGallery()">&times;</button>
            <div class="gallery-container">
              <button class="gallery-nav prev" (click)="prevPhoto()" [disabled]="galleryPhotos().length <= 1">&#8249;</button>
              <div class="gallery-image-wrapper">
                <img [src]="galleryPhotos()[currentGalleryIndex()]" alt="Photo" class="gallery-image" />
              </div>
              <button class="gallery-nav next" (click)="nextPhoto()" [disabled]="galleryPhotos().length <= 1">&#8250;</button>
            </div>
            <div class="gallery-indicators">
              <span class="gallery-counter">{{ currentGalleryIndex() + 1 }} / {{ galleryPhotos().length }}</span>
              <div class="gallery-dots">
                @for (photo of galleryPhotos(); track $index; let i = $index) {
                  <button class="dot" [class.active]="i === currentGalleryIndex()" (click)="goToPhoto(i)"></button>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-page { max-width: 1100px; margin: 0 auto; padding: 1.5rem; }
    .detail-header { margin-bottom: 1.5rem; }
    .detail-header h1 { font-size: 1.5rem; color: #2c003e; margin: 0.5rem 0 0; }
    .back-link { display: inline-flex; align-items: center; gap: 4px; color: #7b1fa2; text-decoration: none; font-size: 0.875rem; font-weight: 500; }
    .back-link:hover { text-decoration: underline; }
    .loading-state, .empty-state { padding: 3rem; text-align: center; color: #888; }

    .detail-body { display: flex; gap: 1.5rem; align-items: flex-start; }
    .detail-sidebar { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; gap: 1rem; position: sticky; top: 1rem; }
    .detail-main { flex: 1; min-width: 0; }

    .photos-card {
      background: #fafafa; border: 1px solid #e8e0f0; border-radius: 8px; padding: 14px;
    }
    .photos-card h3 { margin: 0 0 10px; font-size: 13px; font-weight: 600; color: #5c3d7a; text-transform: uppercase; letter-spacing: 0.5px; }
    .photo-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
    .photo-thumb { aspect-ratio: 1; border-radius: 6px; overflow: hidden; background: #f0ecf3; }
    .photo-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .no-photos { text-align: center; color: #bbb; font-size: 13px; padding: 2rem 0; }

    .section-card {
      background: #fafafa; border: 1px solid #e8e0f0; border-radius: 8px;
      margin-bottom: 12px; overflow: hidden;
    }
    .section-card-header {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px; font-size: 12px; font-weight: 600; color: #5c3d7a;
      text-transform: uppercase; letter-spacing: 0.5px;
      background: #f5f0fa; border-bottom: 1px solid #e8e0f0;
    }
    .section-card-header.clickable { cursor: pointer; }
    .section-card-header.clickable:hover { background: #ede6f5; }
    .section-card-icon { font-size: 18px; width: 18px; height: 18px; color: #7b1fa2; }
    .collapse-icon { margin-left: auto; font-size: 18px; width: 18px; height: 18px; color: #999; }
    .section-card-body { padding: 8px 14px 12px; }
    .section-card.collapsed .section-card-body { display: none; }
    .sc-row {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 5px 0; border-bottom: 1px solid #f0ecf3;
    }
    .sc-row:last-child { border-bottom: none; }
    .sc-label { font-size: 12px; color: #888; white-space: nowrap; }
    .sc-value { font-size: 12px; font-weight: 500; color: #222; text-align: right; padding-left: 12px; }
    .sc-divider { height: 1px; background: #e8e0f0; margin: 6px 0; }
    .sc-features { display: flex; flex-direction: column; gap: 3px; }
    .sc-features-title { font-size: 11px; font-weight: 600; color: #7b1fa2; margin-bottom: 2px; }
    .sc-feature-row { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #555; }
    .sc-feature-icon { font-size: 14px; width: 14px; height: 14px; color: #388e3c; }
    .sc-empty { display: flex; align-items: center; gap: 6px; color: #999; font-size: 12px; }

    .photos-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
    .photos-header h3 { margin: 0; font-size: 13px; font-weight: 600; color: #5c3d7a; text-transform: uppercase; letter-spacing: 0.5px; }
    .view-all-btn { background: none; border: none; color: #7b1fa2; font-size: 11px; font-weight: 600; cursor: pointer; padding: 0; }
    .view-all-btn:hover { text-decoration: underline; }
    .photo-thumb { aspect-ratio: 1; border-radius: 6px; overflow: hidden; background: #f0ecf3; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }
    .photo-thumb:hover { transform: scale(1.03); box-shadow: 0 2px 8px rgba(123,31,162,0.2); }

    .gallery-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: flex;
      align-items: center; justify-content: center; z-index: 1000;
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .gallery-modal {
      position: relative; width: 90%; max-width: 800px; max-height: 90vh;
      display: flex; flex-direction: column; background: #1f1f1f;
      border-radius: 8px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    }
    .gallery-close {
      position: absolute; top: 0.75rem; right: 0.75rem; background: rgba(255,255,255,0.2);
      border: none; color: #fff; font-size: 1.5rem; width: 36px; height: 36px;
      border-radius: 50%; cursor: pointer; display: flex; align-items: center;
      justify-content: center; z-index: 10; line-height: 1;
    }
    .gallery-close:hover { background: rgba(255,255,255,0.3); }
    .gallery-container { display: flex; align-items: center; gap: 0.5rem; padding: 2rem 0.5rem; min-height: 350px; }
    .gallery-image-wrapper { flex: 1; display: flex; align-items: center; justify-content: center; max-height: 70vh; }
    .gallery-image { max-width: 100%; max-height: 70vh; object-fit: contain; border-radius: 4px; }
    .gallery-nav {
      background: rgba(255,255,255,0.15); border: none; color: #fff; font-size: 2rem;
      width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex;
      align-items: center; justify-content: center; flex-shrink: 0; line-height: 1;
    }
    .gallery-nav:hover:not(:disabled) { background: rgba(255,255,255,0.3); }
    .gallery-nav:disabled { opacity: 0.3; cursor: not-allowed; }
    .gallery-indicators { display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 0.75rem; background: rgba(0,0,0,0.3); }
    .gallery-counter { color: #999; font-size: 0.85rem; }
    .gallery-dots { display: flex; gap: 0.4rem; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.3); border: none; cursor: pointer; padding: 0; }
    .dot.active { background: #7b1fa2; }
    .dot:hover:not(.active) { background: rgba(255,255,255,0.5); }

    @media (max-width: 768px) {
      .detail-body { flex-direction: column; }
      .detail-sidebar { width: 100%; position: static; }
    }
  `],
})
export class ProfileDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly profileClient = inject(ProfileClient);
  private readonly subscriptionClient = inject(SubscriptionClient);

  readonly loading = signal(true);
  readonly profile = signal<ProfileDetailDto | null>(null);
  readonly userSubscription = signal<SubscriptionStatusDto | null>(null);
  readonly openSections = signal<Set<number>>(new Set([0, 1]));
  readonly isGalleryOpen = signal(false);
  readonly currentGalleryIndex = signal(0);

  readonly galleryPhotos = computed(() => {
    const p = this.profile();
    if (!p?.photos?.length) return [];
    return p.photos.map(ph => ph.fileUrl).filter(Boolean) as string[];
  });

  readonly profileSections = computed(() => {
    const p = this.profile();
    if (!p) return [];
    const personal = p.personalDetails;
    const career = p.career;
    const family = p.familyInfo;
    const horoscope = p.horoscope;
    const contact = p.contact;
    const partner = p.partnerPreference;

    return [
      {
        title: 'Personal Details',
        fields: [
          this.field('Full Name', p.fullName),
          this.field('Age', p.age),
          this.field('Date of Birth', this.dobText(personal)),
          this.field('Gender', personal?.genderName),
          this.field('Religion', personal?.religionName),
          this.field('Caste', personal?.casteName),
          this.field('Sub Caste', personal?.subCasteName),
          this.field('Marital Status', personal?.maritalStatusName),
          this.field('Bio', p.bio),
          this.field('Location', p.locationText),
          this.field('Height', this.heightText(personal?.heightFt, personal?.heightIn)),
          this.field('Weight', personal?.weightKg ? `${personal.weightKg} kg` : null),
          this.field('Blood Group', personal?.bloodGroupName),
          this.field('Complexion', personal?.complexionName),
          this.field('Diet', personal?.dietName),
          this.field('Personality', personal?.personalityName),
          this.field('Spectacles', this.boolText(personal?.spectacles)),
          this.field('Lens', this.boolText(personal?.lens)),
          this.field('Physical Disability', this.boolText(personal?.physicalDisability)),
          this.field('Disability Detail', personal?.disabilityDetail),
        ],
      },
      {
        title: 'Horoscope & Astrology',
        fields: [
          this.field('Manglik', this.boolText(horoscope?.manglik)),
          this.field('Rashi', horoscope?.rashiName),
          this.field('Nakshatra', horoscope?.nakshatraName),
          this.field('Charan', horoscope?.charanName),
          this.field('Nadi', horoscope?.nadiName),
          this.field('Gan', horoscope?.ganName),
          this.field('Birth Hour', horoscope?.birthHour),
          this.field('Birth Minute', horoscope?.birthMinute),
          this.field('Birth Period', horoscope?.birthPeriod),
          this.field('Devak', horoscope?.devak),
          this.field('Birth State', horoscope?.birthStateName || horoscope?.birthStateOther),
          this.field('Birth District', horoscope?.birthDistrictName || horoscope?.birthDistrictOther),
        ],
      },
      {
        title: 'Career & Education',
        fields: [
          this.field('Education Area', career?.educationAreaName),
          this.field('Education', career?.educationName),
          this.field('Occupation', career?.occupationName),
          this.field('Occupation Details', career?.occupationDetails),
          this.field('Working City', career?.workingCity),
          this.field('Working State', career?.workingStateName || career?.workingStateOther),
          this.field('Working Country', career?.workingCountryName || career?.workingCountryOther),
          this.field('Income Amount', career?.incomeAmount),
          this.field('Income Period', career?.incomePeriodName),
        ],
      },
      {
        title: 'Contact',
        fields: [
          this.field('Email', contact?.contactEmail),
          this.field('Address', contact?.residenceAddress),
          this.field('ID Proof', contact?.idProofNumber),
          this.field('SMS Mobile', this.getPhone('sms_mobile')),
          this.field('Secondary Mobile', this.getPhone('mobile_secondary')),
          this.field('Phone (Primary)', this.getPhone('phone_primary')),
          this.field('Phone (Secondary)', this.getPhone('phone_secondary')),
        ],
      },
      {
        title: 'Family Background',
        fields: [
          this.field('Father', this.boolText(family?.fatherStatus)),
          this.field('Mother', this.boolText(family?.motherStatus)),
          this.field('Brothers', family?.brothers),
          this.field('Married Brothers', family?.marriedBrothers),
          this.field('Sisters', family?.sisters),
          this.field('Married Sisters', family?.marriedSisters),
          this.field('Parents Full Name', family?.parentsFullName),
          this.field('Parents Occupation', family?.parentsOccupation),
          this.field('Parents Resident City', family?.parentsResidentCity),
          this.field('Family Wealth', family?.familyWealth),
          this.field('Mama Surname/Place', family?.mamaSurnamePlace),
          this.field('Native District', family?.nativeDistrictName || family?.nativeDistrictOther),
          this.field('Native Taluka', family?.nativeTalukaName || family?.nativeTalukaOther),
          this.field('Intercast Marriage', this.boolText(family?.intercastMarriage)),
          this.field('Intercast Relation', family?.intercastRelation),
        ],
      },
      {
        title: 'Partner Preferences',
        fields: [
          this.field('Preferred Cities', p.preferredCities?.join(', ')),
          this.field('Interests', p.interests?.join(', ')),
          this.field('Expected Manglik', this.boolText(partner?.expectedManglik)),
          this.field('Max Age Difference', partner?.maxAgeDifference),
          this.field('Expected Height Ft', partner?.expectedHeightFt),
          this.field('Expected Height In', partner?.expectedHeightIn),
          this.field('Divorcee', this.boolText(partner?.divorcee)),
          this.field('Caste No Bar', this.boolText(partner?.expectedCasteNoBar)),
          this.field('Education No Bar', this.boolText(partner?.expectedEducationNoBar)),
          this.field('Occupation No Bar', this.boolText(partner?.expectedOccupationNoBar)),
        ],
      },
    ];
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap((params) => {
        const id = Number(params.get('id'));
        this.loading.set(true);
        return this.profileClient.getById(id);
      }),
    ).subscribe({
      next: (detail) => {
        this.profile.set(detail);
        this.loading.set(false);
        if (detail?.userId) {
          this.subscriptionClient.getUserSubscriptionStatus(detail.userId).subscribe({
            next: (sub) => this.userSubscription.set(sub),
            error: () => this.userSubscription.set(null),
          });
        }
      },
      error: () => this.loading.set(false),
    });
  }

  toggleSection(index: number): void {
    this.openSections.update(set => {
      const next = new Set(set);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  isSectionOpen(index: number): boolean {
    return this.openSections().has(index);
  }

  openGallery(index: number): void {
    if (this.galleryPhotos().length > 0) {
      this.isGalleryOpen.set(true);
      this.currentGalleryIndex.set(index);
    }
  }

  closeGallery(): void {
    this.isGalleryOpen.set(false);
  }

  nextPhoto(): void {
    this.currentGalleryIndex.update(i => (i + 1) % this.galleryPhotos().length);
  }

  prevPhoto(): void {
    this.currentGalleryIndex.update(i => (i - 1 + this.galleryPhotos().length) % this.galleryPhotos().length);
  }

  goToPhoto(index: number): void {
    this.currentGalleryIndex.set(index);
  }

  getUserSubStatusText(): string {
    const s = this.userSubscription();
    if (!s) return 'None';
    if (s.isTrial) return 'Trial';
    if (s.isActive) return 'Active';
    if (s.isExpired) return 'Expired';
    return 'Inactive';
  }

  formatDate(dateStr?: string | null): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private field(label: string, value: unknown): ProfileField {
    const text = `${value ?? ''}`.trim();
    return { label, value: text || '-' };
  }

  private boolText(value: boolean | undefined | null): string {
    if (value === null || value === undefined) return '-';
    return value ? 'Yes' : 'No';
  }

  private heightText(ft?: number | null, inch?: number | null): string {
    if (!ft && !inch) return '-';
    return `${ft ?? 0} ft ${inch ?? 0} in`;
  }

  private dobText(personal: ProfileDetailDto['personalDetails']): string {
    if (!personal) return '-';
    const day = personal.dobDay;
    const month = personal.dobMonth;
    const year = personal.dobYear;
    if (!day && !month && !year) return '-';
    return `${day ?? '?'}/${month ?? '?'}/${year ?? '?'}`;
  }

  private getPhone(phoneType: string): string | null {
    const p = this.profile();
    if (!p?.phoneNumbers) return null;
    const phone = p.phoneNumbers.find(n => n.phoneType === phoneType);
    return phone?.phoneNumber ?? null;
  }
}
