import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MemberRecord, MemberService } from '../../services/member.service';

@Component({
  selector: 'app-profile-list',
  standalone: true,
  imports: [IonicModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './profile-list.html',
  styleUrl: './profile-list.css',
})
export class ProfileList {
  private readonly memberService = inject(MemberService);
  private readonly router = inject(Router);

  profiles: MemberRecord[] = [];

  ngOnInit(): void {
    this.loadProfiles();
  }

  loadProfiles(): void {
    this.profiles = this.memberService.searchProfiles({
      name: '',
      location: '',
      occupation: '',
    });
  }

  getProfilePhotoUrl(profile: MemberRecord): string {
    const seed = encodeURIComponent((profile.email || profile.id || profile.name).toLowerCase());
    return `https://i.pravatar.cc/150?u=${seed}`;
  }

  openProfile(profile: MemberRecord): void {
    this.router.navigate(['/profiles', profile.id]);
  }
}
