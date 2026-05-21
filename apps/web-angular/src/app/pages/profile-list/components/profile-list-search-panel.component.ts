import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MasterDataItem } from '../../../services/master-data.service';

@Component({
  selector: 'app-profile-list-search-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-list-search-panel.component.html',
  styleUrl: '../profile-list.css',
})
export class ProfileListSearchPanelComponent {
  @Input({ required: true }) filters!: Record<string, any>;
  @Input({ required: true }) sortBy!: string;
  @Input({ required: true }) resultsCount!: number;
  @Input() error = '';
  @Input() religionOptions: MasterDataItem[] = [];
  @Input() casteOptions: MasterDataItem[] = [];

  @Output() readonly searchRequested = new EventEmitter<NgForm | undefined>();
  @Output() readonly sortByChange = new EventEmitter<string>();
}
