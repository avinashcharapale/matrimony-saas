import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileClient, ProfileListItemDto, ProfileDetailDto } from '@org/generated';
import { PageHeaderComponent } from '@org/shared-ui';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
  DataTableComponent,
  TableColumn,
} from '@org/shared-ui';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface ProfileRow extends Record<string, unknown> {
  profileId?: number;
  profileCode?: string;
  fullName?: string;
  genderLabel: string;
  locationText?: string;
  verifiedLabel: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profiles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    DataTableComponent,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="profiles-page">
      <ui-page-header title="Profile Management" subtitle="View and manage member profiles" />

      <div class="search-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search profiles</mat-label>
          <input
            matInput
            [(ngModel)]="searchTerm"
            placeholder="Search by name or code..."
          />
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>
      </div>

      <div class="content-layout">
        <div class="table-section" [class.with-detail]="selectedProfile()">
          <ui-data-table
            [columns]="columns"
            [data]="displayRows()"
            [loading]="loading()"
            emptyMessage="No profiles found"
            (rowClick)="onRowClick($event)"
            (rowDelete)="confirmDelete($event)"
          ></ui-data-table>
        </div>

        @if (selectedProfile()) {
          <div class="detail-panel">
            <div class="detail-header">
              <h3>Profile Details</h3>
              <button mat-icon-button (click)="closeDetail()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <div class="detail-content">
              <div class="detail-section">
                <h4>Basic Info</h4>
                <div class="detail-row">
                  <span class="detail-label">ID</span>
                  <span class="detail-value">{{ selectedProfile()?.profileId }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Code</span>
                  <span class="detail-value">{{ selectedProfile()?.profileCode }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Name</span>
                  <span class="detail-value">{{ selectedProfile()?.fullName }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Age</span>
                  <span class="detail-value">{{ selectedProfile()?.age ?? '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Verified</span>
                  <span class="detail-value">
                    {{ selectedProfile()?.isVerified ? 'Yes' : 'No' }}
                  </span>
                </div>
              </div>

              <div class="detail-section">
                <h4>Personal Details</h4>
                <div class="detail-row">
                  <span class="detail-label">Gender</span>
                  <span class="detail-value">{{ selectedProfile()?.personalDetails?.genderName ?? '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Religion</span>
                  <span class="detail-value">{{ selectedProfile()?.personalDetails?.religionName ?? '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Caste</span>
                  <span class="detail-value">{{ selectedProfile()?.personalDetails?.casteName ?? '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Height</span>
                  <span class="detail-value">
                    @if (selectedProfile()?.personalDetails?.heightFt) {
                      {{ selectedProfile()?.personalDetails?.heightFt }}'{{ selectedProfile()?.personalDetails?.heightIn ?? 0 }}"
                    } @else {
                      -
                    }
                  </span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Marital Status</span>
                  <span class="detail-value">{{ selectedProfile()?.personalDetails?.maritalStatusName ?? '-' }}</span>
                </div>
              </div>

              <div class="detail-section">
                <h4>Career</h4>
                <div class="detail-row">
                  <span class="detail-label">Education</span>
                  <span class="detail-value">{{ selectedProfile()?.career?.educationName ?? '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Occupation</span>
                  <span class="detail-value">{{ selectedProfile()?.career?.occupationName ?? '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Working City</span>
                  <span class="detail-value">{{ selectedProfile()?.career?.workingCity ?? '-' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Income</span>
                  <span class="detail-value">
                    @if (selectedProfile()?.career?.incomeAmount) {
                      {{ selectedProfile()?.career?.incomeAmount }} {{ selectedProfile()?.career?.incomePeriodName }}
                    } @else {
                      -
                    }
                  </span>
                </div>
              </div>

              @if (selectedProfile()?.bio) {
                <div class="detail-section">
                  <h4>Bio</h4>
                  <p class="detail-bio">{{ selectedProfile()?.bio }}</p>
                </div>
              }

              @if (selectedProfile()?.photos?.length) {
                <div class="detail-section">
                  <h4>Photos ({{ selectedProfile()?.photos?.length }})</h4>
                  <div class="photo-grid">
                    @for (photo of selectedProfile()?.photos; track photo.photoId) {
                      <div class="photo-thumb">
                        <img [src]="photo.fileUrl" [alt]="photo.fileName" />
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .profiles-page {
      position: relative;
    }

    .search-bar {
      margin-bottom: 1.5rem;
    }

    .search-field {
      width: 360px;
    }

    .content-layout {
      display: flex;
      gap: 1.5rem;
    }

    .table-section {
      flex: 1;
      min-width: 0;
    }

    .detail-panel {
      width: 400px;
      flex-shrink: 0;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      max-height: calc(100vh - 200px);
      overflow-y: auto;
      position: sticky;
      top: 1rem;
    }

    .detail-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .detail-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .detail-content {
      padding: 1rem 1.25rem;
    }

    .detail-section {
      margin-bottom: 1.25rem;
    }

    .detail-section h4 {
      margin: 0 0 8px;
      font-size: 13px;
      font-weight: 600;
      color: #757575;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #f5f5f5;
    }

    .detail-label {
      font-size: 13px;
      color: #757575;
    }

    .detail-value {
      font-size: 13px;
      font-weight: 500;
      color: #1a1a1a;
      text-align: right;
    }

    .detail-bio {
      font-size: 13px;
      color: #424242;
      line-height: 1.6;
      margin: 0;
    }

    .photo-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .photo-thumb {
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
      background: #f5f5f5;
    }

    .photo-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `],
})
export class Profiles implements OnInit {
  private readonly profileClient = inject(ProfileClient);
  private readonly dialog = inject(MatDialog);

  searchTerm = '';
  readonly profiles = signal<ProfileListItemDto[]>([]);
  readonly selectedProfile = signal<ProfileDetailDto | null>(null);
  readonly loading = signal(false);

  readonly columns: TableColumn[] = [
    { key: 'profileCode', label: 'Code', type: 'text' },
    { key: 'fullName', label: 'Name', type: 'text' },
    { key: 'genderLabel', label: 'Gender', type: 'text' },
    { key: 'locationText', label: 'City', type: 'text' },
    { key: 'verifiedLabel', label: 'Status', type: 'badge' },
  ];

  readonly displayRows = computed<ProfileRow[]>(() => {
    const list = this.profiles();
    const term = this.searchTerm.toLowerCase();
    const mapped = list.map((p) => this.toRow(p));
    if (!term) return mapped;
    return mapped.filter((r) => {
      const fullName = r.fullName ?? '';
      const code = r.profileCode ?? '';
      return fullName.toLowerCase().includes(term) || code.toLowerCase().includes(term);
    });
  });

  ngOnInit(): void {
    this.loadProfiles();
  }

  loadProfiles(): void {
    this.loading.set(true);
    this.profileClient.getByTenant().subscribe({
      next: (profiles) => {
        this.profiles.set(profiles ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private toRow(profile: ProfileListItemDto): ProfileRow {
    return {
      profileId: profile.profileId,
      profileCode: profile.profileCode,
      fullName: profile.fullName,
      locationText: profile.locationText,
      genderLabel: profile.genderId === 1 ? 'Male' : profile.genderId === 2 ? 'Female' : '-',
      verifiedLabel: profile.isVerified ? 'Verified' : 'Pending',
    };
  }

  onRowClick(row: Record<string, unknown>): void {
    const profileId = row['profileId'] as number | undefined;
    if (profileId != null) {
      this.profileClient.getById(profileId).subscribe((detail) => {
        this.selectedProfile.set(detail);
      });
    }
  }

  closeDetail(): void {
    this.selectedProfile.set(null);
  }

  confirmDelete(row: Record<string, unknown>): void {
    const profileId = row['profileId'] as number | undefined;
    const fullName = (row['fullName'] as string) ?? 'Unknown';
    const profileCode = (row['profileCode'] as string) ?? '-';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Profile',
        message: `Are you sure you want to delete profile "${fullName}" (${profileCode})? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      } satisfies ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && profileId != null) {
        this.profileClient.delete(profileId).subscribe(() => {
          this.profiles.set(
            this.profiles().filter((p) => p.profileId !== profileId),
          );
          if (this.selectedProfile()?.profileId === profileId) {
            this.selectedProfile.set(null);
          }
        });
      }
    });
  }
}
