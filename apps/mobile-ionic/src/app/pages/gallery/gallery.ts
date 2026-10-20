import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProfileClient } from '@org/generated';
import { resolvePhotoUrl } from '../../utils/default-avatar';

interface GalleryItem {
  profileId: number;
  name: string;
  photoUrl: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-gallery',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css',
})
export class Gallery implements OnInit {
  private readonly profileClient = inject(ProfileClient);

  readonly items = signal<GalleryItem[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly galleryIndex = signal<number | null>(null);

  ngOnInit(): void {
    this.profileClient.searchPublic({ pageSize: 200, sortBy: 'createdAt', sortDescending: true }).subscribe({
      next: (response) => {
        this.items.set(
          (response.items ?? [])
            .filter((m) => m.thumbnailUrl)
            .map((m) => ({
              profileId: m.profileId ?? 0,
              name: m.fullName ?? m.publicDisplayName ?? 'Member',
              photoUrl: resolvePhotoUrl(m.thumbnailUrl, m.fullName ?? m.publicDisplayName, m.genderId),
            })),
        );
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load the gallery.');
        this.isLoading.set(false);
      },
    });
  }

  currentPhotoUrl(): string {
    const i = this.galleryIndex();
    if (i === null) return '';
    return this.items()[i]?.photoUrl ?? '';
  }

  currentName(): string {
    const i = this.galleryIndex();
    if (i === null) return '';
    return this.items()[i]?.name ?? '';
  }

  currentProfileId(): number {
    const i = this.galleryIndex();
    if (i === null) return 0;
    return this.items()[i]?.profileId ?? 0;
  }

  galleryPosition(): number {
    return (this.galleryIndex() ?? 0) + 1;
  }

  openGallery(item: GalleryItem): void {
    const index = this.items().findIndex((x) => x.profileId === item.profileId);
    if (index < 0) return;
    this.galleryIndex.set(index);
  }

  galleryNext(): void {
    const items = this.items();
    if (items.length === 0) return;
    this.galleryIndex.update((i) => (i === null ? 0 : (i + 1) % items.length));
  }

  galleryPrev(): void {
    const items = this.items();
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

  profileLink(): string {
    return `/profiles/${this.currentProfileId()}`;
  }
}