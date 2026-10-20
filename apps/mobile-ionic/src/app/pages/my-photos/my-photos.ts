import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, computed, inject, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ProfileClient, ProfilePhotoDto } from '@org/generated';
import { isImageFile } from '@org/shared-utils';
import { resolvePhotoUrl } from '../../utils/default-avatar';

const MAX_SLOTS = 6;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-my-photos',
  standalone: true,
  imports: [IonicModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './my-photos.html',
  styleUrl: './my-photos.css',
})
export class MyPhotos implements OnInit {
  private readonly profileClient = inject(ProfileClient);

  readonly photos = signal<ProfilePhotoDto[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly busySlot = signal<number | null>(null);
  readonly galleryIndex = signal<number | null>(null);

  readonly slots = Array.from({ length: MAX_SLOTS }, (_, i) => i + 1);
  readonly maxSlots = MAX_SLOTS;

  readonly sortedPhotos = computed(() =>
    [...this.photos()].sort((a, b) => (a.photoSlot ?? 99) - (b.photoSlot ?? 99)),
  );

  readonly photoCount = computed(() => this.photos().length);

  readonly primarySlot = computed(() => this.sortedPhotos()[0]?.photoSlot ?? 1);

  readonly heroUrl = computed(() => {
    const first = this.sortedPhotos()[0];
    return resolvePhotoUrl(first?.fileUrl ?? '', 'My Photo');
  });

  photoForSlot(slot: number): ProfilePhotoDto | null {
    return this.photos().find((p) => p.photoSlot === slot) ?? null;
  }

  photoName(slot: number): string {
    return this.photoForSlot(slot)?.fileName ?? '';
  }

  slotPhotoUrl(slot: number): string {
    const p = this.photoForSlot(slot);
    return resolvePhotoUrl(p?.fileUrl ?? '', 'Photo');
  }

  currentGalleryUrl(): string {
    const i = this.galleryIndex();
    if (i === null) return '';
    const p = this.sortedPhotos()[i];
    return resolvePhotoUrl(p?.fileUrl ?? '', 'Photo');
  }

  galleryPosition(): number {
    return (this.galleryIndex() ?? 0) + 1;
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.profileClient.getMyProfile().subscribe({
      next: (profile) => {
        this.photos.set((profile.photos ?? []).filter((p) => p.fileUrl));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load your photos.');
        this.isLoading.set(false);
      },
    });
  }

  onSlotFileChange(event: Event, slot: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (!isImageFile(file.name)) {
      this.errorMessage.set('Only JPG, JPEG, PNG or WEBP images are allowed.');
      this.successMessage.set('');
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.busySlot.set(slot);
    this.profileClient.uploadPhoto(slot, file).subscribe({
      next: () => {
        this.busySlot.set(null);
        this.successMessage.set(`Photo ${slot} saved.`);
        this.loadProfile();
      },
      error: () => {
        this.busySlot.set(null);
        this.errorMessage.set('Upload failed. Please try again.');
      },
    });
  }

  deleteSlot(slot: number): void {
    if (this.busySlot()) return;
    if (!window.confirm(`Delete photo ${slot}? This cannot be undone.`)) return;

    this.busySlot.set(slot);
    this.profileClient.deletePhoto(slot).subscribe({
      next: () => {
        this.busySlot.set(null);
        this.successMessage.set(`Photo ${slot} deleted.`);
        this.loadProfile();
      },
      error: () => {
        this.busySlot.set(null);
        this.errorMessage.set('Delete failed. Please try again.');
      },
    });
  }

  openGallery(index: number): void {
    const count = this.sortedPhotos().length;
    if (count === 0) return;
    this.galleryIndex.set(Math.min(Math.max(0, index), count - 1));
  }

  openTileGallery(slot: number): void {
    const index = this.sortedPhotos().findIndex((p) => p.photoSlot === slot);
    this.openGallery(index);
  }

  galleryNext(): void {
    const items = this.sortedPhotos();
    if (items.length === 0) return;
    this.galleryIndex.update((i) => (i === null ? 0 : (i + 1) % items.length));
  }

  galleryPrev(): void {
    const items = this.sortedPhotos();
    if (items.length === 0) return;
    this.galleryIndex.update((i) => (i === null ? 0 : (i - 1 + items.length) % items.length));
  }

  closeGallery(): void {
    this.galleryIndex.set(null);
  }

  onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeGallery();
    }
  }
}