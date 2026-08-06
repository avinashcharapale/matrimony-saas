import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { MemberRecord } from '../../services/member.service';
import { MemberService } from '../../services/member.service';
import { getDefaultAvatar } from '../../utils/default-avatar';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <p class="eyebrow">Visual Profiles</p>
        <h1>Photo Gallery</h1>
      </header>

      <section class="gallery-grid">
        @for (profile of profiles(); track profile.id) {
        <button type="button" class="tile" (click)="selectedPhoto.set(getPhoto(profile.email))">
          <img [src]="getPhoto(profile.email)" [alt]="profile.name" />
          <span>{{ profile.name }}</span>
        </button>
        }
      </section>

      @if (selectedPhoto()) {
      <div class="overlay" (click)="selectedPhoto.set('')">
        <div class="modal" (click)="$event.stopPropagation()">
          <button type="button" class="close" (click)="selectedPhoto.set('')">Close</button>
          <img [src]="selectedPhoto()" alt="Selected profile photo" />
        </div>
      </div>
      }
    </section>
  `,
  styleUrl: './photo-gallery.css',
})
export class PhotoGallery implements OnInit {
  readonly selectedPhoto = signal('');

  private readonly memberService = inject(MemberService);
  readonly profiles = signal<MemberRecord[]>([]);

  ngOnInit(): void {
    this.memberService.searchProfiles({ name: '', location: '', occupation: '' }).subscribe((profiles) => {
      this.profiles.set(profiles.slice(0, 12));
    });
  }

  getPhoto(seedValue: string): string {
    return getDefaultAvatar(seedValue);
  }
}
