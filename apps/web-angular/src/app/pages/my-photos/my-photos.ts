import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MemberService } from '../../services/member.service';
import { AuthService } from '../../services/auth.service';
import { SubscriptionStore } from '@org/data-access-subscription';
import { SharedSidebarComponent } from '../../components/shared-sidebar/shared-sidebar.component';
import { getDefaultAvatar, resolvePhotoUrl } from '../../utils/default-avatar';
import { ProfileClient, ProfileDetailDto, ProfilePhotoDto } from '@org/generated';
import { finalize } from 'rxjs/operators';

const MAX_PHOTOS = 6;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-my-photos',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedSidebarComponent],
  templateUrl: './my-photos.html',
  styleUrl: './my-photos.css',
})
export class MyPhotos implements OnInit {
  private readonly memberService = inject(MemberService);
  private readonly profileClient = inject(ProfileClient);
  private readonly authService = inject(AuthService);
  private readonly subscriptionStore = inject(SubscriptionStore);

  @ViewChild('replaceFileInput') replaceFileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('addFileInput') addFileInput!: ElementRef<HTMLInputElement>;

  readonly profile = signal<ProfileDetailDto | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly isGalleryOpen = signal(false);
  readonly currentGalleryIndex = signal(0);
  readonly isUploading = signal(false);
  readonly replacingSlot = signal<number | null>(null);
  readonly deletingSlot = signal<number | null>(null);

  readonly userName = signal('');
  readonly userPhotoUrl = signal('');
  readonly userOccupation = signal('');
  readonly subscriptionStatus = this.subscriptionStore.status;
  readonly subscriptionLoading = computed(() => this.subscriptionStore.loading());

  readonly photos = computed(() => {
    const p = this.profile();
    if (!p) return [] as ProfilePhotoDto[];
    return (p.photos ?? []).sort((a, b) => (a.photoSlot ?? 0) - (b.photoSlot ?? 0));
  });

  readonly photoCount = computed(() => this.photos().length);
  readonly canAddPhoto = computed(() => this.photoCount() < MAX_PHOTOS);

  readonly nextSlot = computed(() => {
    const slots = this.photos().map(p => p.photoSlot ?? 0);
    if (slots.length === 0) return 1;
    for (let i = 1; i <= MAX_PHOTOS; i++) {
      if (!slots.includes(i)) return i;
    }
    return MAX_PHOTOS;
  });

  readonly galleryPhotos = computed(() => {
    const p = this.profile();
    if (!p) return [];
    const genderId = p.personalDetails?.genderId ?? null;
    const photos = (p.photos ?? []).map(ph => resolvePhotoUrl(ph.fileUrl, p.fullName, genderId));
    return photos.length > 0 ? photos : [this.getProfilePhoto()];
  });

  ngOnInit(): void {
    const userId = this.authService.getSession()?.userId ?? 0;
    if (userId) {
      this.subscriptionStore.loadSubscriptionStatus(userId).subscribe();
    }
    this.loadMyProfile();
  }

  loadMyProfile(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.memberService.getMyProfile().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.populateSidebar(profile);
      },
      error: (err) => {
        console.error('Failed to load my photos:', err);
        this.error.set('Failed to load photos. Please try again.');
      },
    });
  }

  private populateSidebar(profile: ProfileDetailDto): void {
    const fullName = profile.fullName ?? '';
    const genderId = profile.personalDetails?.genderId ?? null;
    const primaryPhoto = (profile.photos ?? []).find(ph => ph.isPrimary) ?? profile.photos?.[0];
    this.userName.set(fullName);
    this.userPhotoUrl.set(
      primaryPhoto
        ? resolvePhotoUrl(primaryPhoto.fileUrl, fullName, genderId)
        : getDefaultAvatar(fullName, genderId),
    );
    this.userOccupation.set(profile.occupationText ?? '');
  }

  getProfilePhoto(): string {
    const p = this.profile();
    if (!p) return '';
    const genderId = p.personalDetails?.genderId ?? null;
    const photos = (p.photos ?? []).filter(ph => ph.fileUrl);
    return photos.length > 0 ? resolvePhotoUrl(photos[0].fileUrl, p.fullName, genderId) : getDefaultAvatar(p.fullName, genderId);
  }

  getPhotoUrl(photo: ProfilePhotoDto): string {
    const p = this.profile();
    if (!p) return '';
    const genderId = p.personalDetails?.genderId ?? null;
    return resolvePhotoUrl(photo.fileUrl, p.fullName, genderId);
  }

  openGallery(index?: number): void {
    if (this.galleryPhotos().length > 0) {
      this.isGalleryOpen.set(true);
      this.currentGalleryIndex.set(index ?? 0);
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

  triggerAddPhoto(): void {
    if (!this.canAddPhoto() || this.isUploading()) return;
    this.addFileInput.nativeElement.click();
  }

  triggerReplacePhoto(slot: number, event: Event): void {
    event.stopPropagation();
    if (this.isUploading()) return;
    this.replacingSlot.set(slot);
    this.replaceFileInput.nativeElement.click();
  }

  deletePhoto(slot: number, event: Event): void {
    event.stopPropagation();
    if (this.deletingSlot() !== null) return;

    this.deletingSlot.set(slot);
    this.error.set(null);

    this.profileClient.deletePhoto(slot)
      .pipe(finalize(() => this.deletingSlot.set(null)))
      .subscribe({
        next: () => this.loadMyProfile(),
        error: (err) => {
          console.error('Photo delete failed', err);
          this.error.set('Failed to delete photo. Please try again.');
        },
      });
  }

  onAddPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error.set('Please select a valid image file.');
      input.value = '';
      return;
    }

    const slot = this.nextSlot();
    this.uploadPhoto(slot, file, input);
  }

  onReplacePhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const slot = this.replacingSlot();
    if (!file || slot === null) {
      this.replacingSlot.set(null);
      input.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.error.set('Please select a valid image file.');
      this.replacingSlot.set(null);
      input.value = '';
      return;
    }

    this.uploadPhoto(slot, file, input);
    this.replacingSlot.set(null);
  }

  private uploadPhoto(slot: number, file: File, input: HTMLInputElement): void {
    this.isUploading.set(true);
    this.error.set(null);

    this.profileClient.uploadPhoto(slot, file)
      .pipe(finalize(() => {
        this.isUploading.set(false);
        input.value = '';
      }))
      .subscribe({
        next: () => this.loadMyProfile(),
        error: (err) => {
          console.error('Photo upload failed', err);
          this.error.set('Failed to upload photo. Please try again.');
        },
      });
  }
}
