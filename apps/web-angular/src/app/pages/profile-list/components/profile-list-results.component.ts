import { Component, ChangeDetectionStrategy, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemberRecord } from '../../../services/member.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profile-list-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-list-results.component.html',
  styleUrl: '../profile-list.css',
})
export class ProfileListResultsComponent {
  @Input({ required: true }) hasResults!: boolean;
  @Input({ required: true }) currentPage!: number;
  @Input({ required: true }) totalPages!: number;
  @Input({ required: true }) pageNumbers!: number[];
  @Input({ required: true }) pageResults!: MemberRecord[];

  @Input({ required: true }) getProfilePhotoUrl!: (profile: MemberRecord) => string;
  @Input({ required: true }) getReligionLabel!: (profile: MemberRecord) => string;
  @Input({ required: true }) getCasteLabel!: (profile: MemberRecord) => string;
  @Input({ required: true }) onPhotoError!: (event: Event, name: string) => void;

  @Output() readonly pageChange = new EventEmitter<number>();
  @Output() readonly profileSelect = new EventEmitter<MemberRecord>();
}
