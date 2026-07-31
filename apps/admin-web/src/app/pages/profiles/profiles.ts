import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProfileClient, ProfileListItemDto } from '@org/generated';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
  PaginatorComponent,
  createSort,
  createPagination,
} from '@org/shared-ui';

interface ProfileRow {
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
    RouterModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    PaginatorComponent,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Profile Management</h1>
          <p class="subtitle">View and manage member profiles across your tenant.</p>
        </div>
      </div>

      <div class="search-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search profiles</mat-label>
          <input
            matInput
            type="text"
            placeholder="Search by name or code..."
            [value]="searchTerm()"
            (input)="onSearch($event)"
          />
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>
      </div>

      @if (loading()) {
        <div class="loading-state">Loading profiles...</div>
      } @else if (displayRows().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">P</div>
          <p>No profiles found.</p>
        </div>
      } @else {
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th class="sortable" (click)="sort.toggleSort('profileCode')">Code <mat-icon class="sort-icon">{{ sort.sortIcon('profileCode') }}</mat-icon></th>
                <th class="sortable" (click)="sort.toggleSort('fullName')">Name <mat-icon class="sort-icon">{{ sort.sortIcon('fullName') }}</mat-icon></th>
                <th class="sortable" (click)="sort.toggleSort('genderLabel')">Gender <mat-icon class="sort-icon">{{ sort.sortIcon('genderLabel') }}</mat-icon></th>
                <th class="sortable" (click)="sort.toggleSort('locationText')">City <mat-icon class="sort-icon">{{ sort.sortIcon('locationText') }}</mat-icon></th>
                <th class="sortable" (click)="sort.toggleSort('verifiedLabel')">Status <mat-icon class="sort-icon">{{ sort.sortIcon('verifiedLabel') }}</mat-icon></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (row of pagination.paginated(); track row.profileId) {
                <tr (click)="onRowClick(row)" class="clickable-row">
                  <td class="cell-id">{{ row.profileCode }}</td>
                  <td class="cell-bold">{{ row.fullName }}</td>
                  <td>{{ row.genderLabel }}</td>
                  <td>{{ row.locationText }}</td>
                  <td>
                    <span class="status-badge" [class.verified]="row.verifiedLabel === 'Verified'" [class.pending]="row.verifiedLabel === 'Pending'">
                      {{ row.verifiedLabel }}
                    </span>
                  </td>
                  <td class="cell-actions">
                    <button mat-icon-button title="Delete" (click)="$event.stopPropagation(); confirmDelete(row)" (dblclick)="$event.stopPropagation()">
                      <mat-icon color="warn">delete</mat-icon>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
          <ui-paginator
            [totalItems]="pagination.totalItems()"
            [totalPages]="pagination.totalPages()"
            [currentPage]="pagination.currentPage()"
            [pageSize]="pagination.pageSize()"
            (pageChange)="pagination.goToPage($event)"
            (pageSizeChange)="pagination.onPageSizeChange($event)"
          />
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.5rem; color: #2c003e; margin-bottom: 0.25rem; }
    .subtitle { color: #666; font-size: 0.875rem; }
    .search-bar { margin-bottom: 1.5rem; }
    .search-field { width: 360px; }

    .loading-state { padding: 3rem; text-align: center; color: #888; }
    .empty-state { padding: 3rem; text-align: center; color: #888; }
    .empty-icon {
      width: 48px; height: 48px; background: #f3e5f5; color: #7b1fa2; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; font-size: 1.25rem;
      font-weight: 700; margin: 0 auto 1rem;
    }

    .table-wrapper {
      background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      overflow-x: auto;
    }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      padding: 0.875rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 600;
      color: #666; text-transform: uppercase; letter-spacing: 0.5px;
      border-bottom: 2px solid #eee; background: #fafafa;
    }
    .data-table td {
      padding: 0.875rem 1rem; font-size: 0.875rem; color: #333;
      border-bottom: 1px solid #f0f0f0;
    }
    .data-table tbody tr:hover { background: #f9f5fc; }
    .clickable-row { cursor: pointer; }
    .cell-id { color: #999; font-family: monospace; }
    .cell-bold { font-weight: 500; }
    .cell-actions { text-align: right; white-space: nowrap; }
    .sortable { cursor: pointer; user-select: none; }
    .sortable:hover { background: #f0ecf3; }
    .sort-icon { font-size: 1rem; width: 1rem; height: 1rem; vertical-align: middle; line-height: 1; }

    .status-badge {
      display: inline-block; padding: 2px 10px; border-radius: 9999px;
      font-size: 0.75rem; font-weight: 600;
    }
    .status-badge.verified { background: #e8f5e9; color: #2e7d32; }
    .status-badge.pending { background: #fff3e0; color: #e65100; }
    .status-badge.expired { background: #fce4ec; color: #c62828; }
  `],
})
export class Profiles implements OnInit {
  private readonly profileClient = inject(ProfileClient);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(false);
  readonly profiles = signal<ProfileListItemDto[]>([]);
  readonly searchTerm = signal('');

  readonly sort = createSort();

  readonly displayRows = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const list = this.profiles();
    let filtered = list;
    if (term) {
      filtered = list.filter(
        (p) =>
          (p.fullName?.toLowerCase().includes(term)) ||
          (p.profileCode?.toLowerCase().includes(term)),
      );
    }
    return filtered.map((p) => ({
      profileId: p.profileId,
      profileCode: p.profileCode,
      fullName: p.fullName,
      locationText: p.locationText,
      genderLabel: p.genderId === 1 ? 'Male' : p.genderId === 2 ? 'Female' : '-',
      verifiedLabel: p.isVerified ? 'Verified' : 'Pending',
    } as ProfileRow));
  });

  readonly sortedRows = computed(() => {
    const col = this.sort.sortColumn();
    if (!col) return this.displayRows();
    const dir = this.sort.sortDirection();
    const data = [...this.displayRows()];
    data.sort((a, b) => {
      let cmp = 0;
      switch (col) {
        case 'profileCode': cmp = (a.profileCode ?? '').localeCompare(b.profileCode ?? ''); break;
        case 'fullName': cmp = (a.fullName ?? '').localeCompare(b.fullName ?? ''); break;
        case 'genderLabel': cmp = a.genderLabel.localeCompare(b.genderLabel); break;
        case 'locationText': cmp = (a.locationText ?? '').localeCompare(b.locationText ?? ''); break;
        case 'verifiedLabel': cmp = a.verifiedLabel.localeCompare(b.verifiedLabel); break;
      }
      return dir === 'asc' ? cmp : -cmp;
    });
    return data;
  });

  readonly pagination = createPagination(this.sortedRows);

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
      error: () => this.loading.set(false),
    });
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.pagination.goToPage(1);
  }

  onRowClick(row: ProfileRow): void {
    if (row.profileId != null) {
      this.router.navigate(['/profiles', row.profileId]);
    }
  }

  confirmDelete(row: ProfileRow): void {
    const profileId = row.profileId;
    const fullName = row.fullName ?? 'Unknown';
    const profileCode = row.profileCode ?? '-';
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
        });
      }
    });
  }
}
