import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { inject } from '@angular/core';
import { MemberRecord } from '../../services/member.service';
import { MemberService } from '../../services/member.service';

@Component({
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
        @for (profile of profiles; track profile.id) {
        <button type="button" class="tile" (click)="selectedPhoto = getPhoto(profile.email)">
          <img [src]="getPhoto(profile.email)" [alt]="profile.name" />
          <span>{{ profile.name }}</span>
        </button>
        }
      </section>

      @if (selectedPhoto) {
      <div class="overlay" (click)="selectedPhoto = ''">
        <div class="modal" (click)="$event.stopPropagation()">
          <button type="button" class="close" (click)="selectedPhoto = ''">Close</button>
          <img [src]="selectedPhoto" alt="Selected profile photo" />
        </div>
      </div>
      }
    </section>
  `,
  styles: [
    `
      .page-shell { width: min(100%, 980px); margin: 0 auto; display: grid; gap: 1rem; }
      .page-header, .gallery-grid { background: #fff; border: 1px solid #eadfd7; border-radius: 1rem; padding: 1rem; }
      .eyebrow { margin: 0; color: #9a5e45; text-transform: uppercase; font-size: 0.74rem; font-weight: 700; }
      h1 { margin: 0.35rem 0 0; color: #24283a; }
      .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.75rem; }
      .tile { border: 1px solid #e8d9cf; border-radius: 0.8rem; overflow: hidden; background: #fcf8f5; cursor: pointer; padding: 0; }
      .tile img { width: 100%; height: 170px; object-fit: cover; display: block; }
      .tile span { display: block; padding: 0.55rem; color: #394056; font-weight: 600; text-align: center; }
      .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.84); display: grid; place-items: center; z-index: 1000; }
      .modal { width: min(90vw, 520px); background: #fff; padding: 0.8rem; border-radius: 0.8rem; }
      .close { border: none; background: #9a5e45; color: #fff; border-radius: 0.45rem; padding: 0.4rem 0.6rem; margin-bottom: 0.5rem; }
      .modal img { width: 100%; border-radius: 0.6rem; }
    `,
  ],
})
export class PhotoGallery implements OnInit {
  selectedPhoto = '';

  private readonly memberService = inject(MemberService);
  profiles: MemberRecord[] = [];

  async ngOnInit(): Promise<void> {
    this.profiles = (await this.memberService.searchProfiles({ name: '', location: '', occupation: '' })).slice(0, 12);
  }

  getPhoto(seedValue: string): string {
    return `https://i.pravatar.cc/300?u=${encodeURIComponent(seedValue.toLowerCase())}`;
  }
}
