import { Component, ChangeDetectionStrategy, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RegisterLookupOption } from '../../../services/register-master-data.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profile-list-search-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './profile-list-search-panel.component.html',
  styleUrl: '../profile-list.css',
})
export class ProfileListSearchPanelComponent {
  showAdvanced = false;

  @Input({ required: true }) filters!: Record<string, any>;
  @Input({ required: true }) sortBy!: string;
  @Input({ required: true }) resultsCount!: number;
  @Input() error = '';
  @Input() isAuthenticated = false;
  @Input() religionOptions: RegisterLookupOption[] = [];
  @Input() casteOptions: RegisterLookupOption[] = [];
  @Input() educationOptions: RegisterLookupOption[] = [];
  @Input() maritalStatusOptions: RegisterLookupOption[] = [];
  @Input() occupationOptions: RegisterLookupOption[] = [];

  @Output() readonly searchRequested = new EventEmitter<NgForm | undefined>();
  @Output() readonly sortByChange = new EventEmitter<string>();
  @Output() readonly religionChange = new EventEmitter<void>();

  get activeFilterCount(): number {
    let count = 0;
    if (this.filters['religion']) count++;
    if (this.filters['caste']) count++;
    if (this.filters['education']) count++;
    if (this.filters['maritalStatus']) count++;
    if (this.filters['occupationId']) count++;
    if (this.filters['workingCity']) count++;
    if (this.filters['nativePlace']) count++;
    if (this.filters['annualIncomeFrom']) count++;
    if (this.filters['height'] && this.filters['height'] !== 'Any') count++;
    return count;
  }

  clearFilters(): void {
    this.filters['religion'] = '';
    this.filters['caste'] = '';
    this.filters['education'] = '';
    this.filters['maritalStatus'] = '';
    this.filters['occupationId'] = '';
    this.filters['workingCity'] = '';
    this.filters['nativePlace'] = '';
    this.filters['annualIncomeFrom'] = '';
    this.filters['height'] = 'Any';
  }
}
