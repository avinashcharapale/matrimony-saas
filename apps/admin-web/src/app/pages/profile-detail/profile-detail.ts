import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProfileClient, ProfileDetailDto, SubscriptionClient, SubscriptionStatusDto, UserSubscriptionHistoryItemDto, PlanFeatureValueDto, PaymentTransactionHistoryDto, InvoiceDto } from '@org/generated';
import { BillingRepository } from '@org/data-access-billing';
import { NotificationService } from '@org/core';
import { ConfirmDialogComponent, ConfirmDialogData, StatusBadgeComponent } from '@org/shared-ui';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpErrorResponse } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';

interface ProfileField {
  label: string;
  value: string;
}

interface ProfileSection {
  title: string;
  fields: ProfileField[];
}

interface InfoRow {
  icon: string;
  label: string;
  value: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profile-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatDialogModule, MatTabsModule, StatusBadgeComponent],
  templateUrl: './profile-detail.html',
  styleUrl: './profile-detail.css',
})
export class ProfileDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly profileClient = inject(ProfileClient);
  private readonly subscriptionClient = inject(SubscriptionClient);
  private readonly billing = inject(BillingRepository);
  private readonly dialog = inject(MatDialog);
  private readonly notifications = inject(NotificationService);

  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly selectedTab = signal(0);
  readonly profile = signal<ProfileDetailDto | null>(null);
  readonly userSubscription = signal<SubscriptionStatusDto | null>(null);
  readonly subscriptionHistory = signal<UserSubscriptionHistoryItemDto[]>([]);
  readonly historyLoading = signal(false);
  readonly userPayments = signal<PaymentTransactionHistoryDto[]>([]);
  readonly userInvoices = signal<InvoiceDto[]>([]);
  readonly paymentsLoading = signal(false);
  readonly openSections = signal<Set<number>>(new Set([0, 1]));
  readonly isGalleryOpen = signal(false);
  readonly currentGalleryIndex = signal(0);

  readonly hasSuccessfulPayment = computed(() =>
    this.userPayments().some((p) => (p.status ?? '').toLowerCase() === 'success'),
  );

  readonly primaryPhoto = computed(() => {
    const photos = this.profile()?.photos ?? [];
    const primary = photos.find((ph) => ph.isPrimary);
    return (primary?.fileUrl ?? photos[0]?.fileUrl ?? null) as string | null;
  });

  readonly initials = computed(() => {
    const name = this.profile()?.fullName?.trim() ?? '';
    if (!name) return '?';
    const parts = name.split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
    return (first + last).toUpperCase();
  });

  readonly aboutChips = computed(() => {
    const p = this.profile();
    if (!p) return [];
    const personal = p.personalDetails;
    const chips: InfoRow[] = [];
    if (p.age) chips.push({ icon: 'cake', label: 'Age', value: `${p.age}` });
    if (personal?.genderName) chips.push({ icon: 'wc', label: 'Gender', value: personal.genderName });
    if (personal?.religionName) chips.push({ icon: 'church', label: 'Religion', value: personal.religionName });
    if (personal?.casteName) chips.push({ icon: 'people', label: 'Caste', value: personal.casteName });
    if (personal?.maritalStatusName) chips.push({ icon: 'favorite', label: 'Marital Status', value: personal.maritalStatusName });
    if (p.locationText) chips.push({ icon: 'place', label: 'Location', value: p.locationText });
    return chips;
  });

  readonly aboutRows = computed(() => {
    const p = this.profile();
    if (!p) return [];
    const personal = p.personalDetails;
    return [
      { icon: 'cake', label: 'Age', value: this.valueText(p.age) },
      { icon: 'wc', label: 'Gender', value: this.valueText(personal?.genderName) },
      { icon: 'event', label: 'Date of Birth', value: this.dobText(personal) },
      { icon: 'church', label: 'Religion', value: this.valueText(personal?.religionName) },
      { icon: 'people', label: 'Caste', value: this.valueText(personal?.casteName) },
      { icon: 'group', label: 'Sub Caste', value: this.valueText(personal?.subCasteName) },
      { icon: 'favorite', label: 'Marital Status', value: this.valueText(personal?.maritalStatusName) },
      { icon: 'height', label: 'Height', value: this.heightText(personal?.heightFt, personal?.heightIn) },
      { icon: 'monitor_weight', label: 'Weight', value: personal?.weightKg ? `${personal.weightKg} kg` : '-' },
      { icon: 'bloodtype', label: 'Blood Group', value: this.valueText(personal?.bloodGroupName) },
      { icon: 'restaurant', label: 'Diet', value: this.valueText(personal?.dietName) },
      { icon: 'work', label: 'Occupation', value: this.valueText(p.occupationText) },
      { icon: 'place', label: 'Location', value: this.valueText(p.locationText) },
    ];
  });

  readonly topFeatures = computed(() => (this.userSubscription()?.effectiveFeatures ?? []).slice(0, 5));

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
          this.loadSubscriptionHistory(detail.userId);
          this.loadPayments(detail.userId);
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

  goToTab(index: number): void {
    this.selectedTab.set(index);
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

  goToEdit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id != null) {
      this.router.navigate(['/profiles', id, 'edit']);
    }
  }

  toggleActive(): void {
    const p = this.profile();
    if (!p?.profileId) return;
    const activating = !p.isActive;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: activating ? 'Activate Profile' : 'Deactivate Profile',
        message: activating
          ? `Activate "${p.fullName}"? The profile will appear in search results again.`
          : `Deactivate "${p.fullName}"? The profile will be hidden from search results and cannot be matched.`,
        confirmText: activating ? 'Activate' : 'Deactivate',
        cancelText: 'Cancel',
      } satisfies ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.busy.set(true);
      const action = activating
        ? this.profileClient.activate(p.profileId!)
        : this.profileClient.deactivate(p.profileId!);
      action.subscribe({
        next: () => {
          this.profile.update((cur) => (cur ? { ...cur, isActive: activating } : cur));
          this.busy.set(false);
        },
        error: () => this.busy.set(false),
      });
    });
  }

  toggleVerified(): void {
    const p = this.profile();
    if (!p?.profileId) return;
    const verifying = !p.isVerified;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: verifying ? 'Mark as Verified' : 'Mark as Unverified',
        message: verifying
          ? `Mark "${p.fullName}" as verified?`
          : `Mark "${p.fullName}" as unverified?`,
        confirmText: verifying ? 'Verify' : 'Unverify',
        cancelText: 'Cancel',
      } satisfies ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.busy.set(true);
      this.profileClient.setVerification(p.profileId!, { isVerified: verifying }).subscribe({
        next: () => {
          this.profile.update((cur) => (cur ? { ...cur, isVerified: verifying } : cur));
          this.busy.set(false);
        },
        error: (err: HttpErrorResponse) => {
          if (err?.status === 409) {
            this.notifications.error((err.error as { message?: string } | null)?.message ?? 'Profile could not be verified.');
          }
          this.busy.set(false);
        },
      });
    });
  }

  onPhotoSelected(event: Event): void {
    const p = this.profile();
    if (!p?.profileId) return;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const usedSlots = new Set((p.photos ?? []).map((ph) => ph.photoSlot));
    let slot = 1;
    while (usedSlots.has(slot)) slot++;
    this.busy.set(true);
    this.profileClient.uploadProfilePhoto(p.profileId, slot, file).subscribe({
      next: () => {
        this.busy.set(false);
        input.value = '';
        this.reloadProfile();
      },
      error: () => {
        this.busy.set(false);
        input.value = '';
      },
    });
  }

  confirmDeletePhoto(photoId: number): void {
    const p = this.profile();
    if (!p?.profileId) return;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Photo',
        message: 'Are you sure you want to delete this photo?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      } satisfies ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      const photo = (p.photos ?? []).find((ph) => ph.photoId === photoId);
      if (!photo) return;
      this.busy.set(true);
      this.profileClient.deleteProfilePhoto(p.profileId!, photo.photoSlot!).subscribe({
        next: () => {
          this.busy.set(false);
          this.reloadProfile();
        },
        error: () => this.busy.set(false),
      });
    });
  }

  private reloadProfile(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.profileClient.getById(id).subscribe((detail) => this.profile.set(detail));
  }

  getUserSubStatusText(): string {
    const s = this.userSubscription();
    if (!s) return 'None';
    if (s.isTrial) return 'Trial';
    if (s.isActive) return 'Active';
    if (s.isExpired) return 'Expired';
    return 'Inactive';
  }

  featureEnabled(feat: PlanFeatureValueDto): boolean {
    const value = (feat.value ?? '').trim().toLowerCase();
    return value !== 'false';
  }

  featureIcon(feat: PlanFeatureValueDto): string {
    const value = (feat.value ?? '').trim().toLowerCase();
    return value === 'false' ? 'block' : 'check_circle';
  }

  featureValueText(feat: PlanFeatureValueDto): string {
    const value = (feat.value ?? '').trim();
    if (!value) return '';
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === 'false') return '';
    return value;
  }

  private loadPayments(userId: number): void {
    this.paymentsLoading.set(true);
    this.billing.getUserPaymentTransactions(userId).subscribe({
      next: (payments) => {
        this.userPayments.set(payments ?? []);
        this.paymentsLoading.set(false);
      },
      error: () => this.paymentsLoading.set(false),
    });
    this.billing.getUserInvoices(userId).subscribe({
      next: (invoices) => this.userInvoices.set(invoices ?? []),
      error: () => this.userInvoices.set([]),
    });
  }

  private loadSubscriptionHistory(userId: number): void {
    this.historyLoading.set(true);
    this.subscriptionClient.getUserSubscriptionHistory(userId).subscribe({
      next: (history) => {
        this.subscriptionHistory.set(history ?? []);
        this.historyLoading.set(false);
      },
      error: () => this.historyLoading.set(false),
    });
  }

  historyStatusText(item: UserSubscriptionHistoryItemDto): string {
    const status = (item.userSubscriptionStatus ?? '').toLowerCase();
    if (status === 'active') {
      if (item.isTrial) return 'trial';
      return item.isActive ? 'active' : 'expired';
    }
    if (status === 'cancelled') return 'cancelled';
    if (status === 'expired') return 'expired';
    return status || 'unknown';
  }

  statusText(status?: string): string {
    return status ?? 'Unknown';
  }

  formatCurrency(amount?: number): string {
    return `₹${(amount ?? 0).toFixed(2)}`;
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

  private valueText(value: unknown): string {
    const text = `${value ?? ''}`.trim();
    return text || '-';
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
