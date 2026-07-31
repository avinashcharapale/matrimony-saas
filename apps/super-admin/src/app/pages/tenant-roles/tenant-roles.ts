import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TenantRoleService, TenantRoleDto } from '../../services/tenant-role.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ConfirmDialogComponent, ConfirmDialogData, PaginatorComponent, createSort, createPagination } from '@org/shared-ui';
import { RoleFormDialogComponent } from './role-form-dialog/role-form-dialog.component';
import { AssignPermissionsDialogComponent } from './assign-permissions-dialog/assign-permissions-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-tenant-roles',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    PaginatorComponent,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <div class="breadcrumb">
            <a routerLink="/tenants">Tenants</a>
            <span class="sep">/</span>
            <span>Tenant #{{ tenantId() }} Roles</span>
          </div>
          <h1>Tenant Roles</h1>
          <p class="subtitle">Manage roles and their permission assignments for this tenant.</p>
        </div>
        <button mat-flat-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon>
          Add Role
        </button>
      </div>

      <div class="search-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search by role name...</mat-label>
          <input matInput type="text" placeholder="Search by role name..." [value]="searchTerm()" (input)="onSearch($event)" />
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>
      </div>

      @if (loading()) {
        <div class="loading-state">Loading roles...</div>
      } @else if (filtered().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">R</div>
          <p>No roles found for this tenant.</p>
        </div>
      } @else {
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th class="sortable" (click)="sort.toggleSort('roleId')">ID<mat-icon class="sort-icon">{{ sort.sortIcon('roleId') }}</mat-icon></th>
                <th class="sortable" (click)="sort.toggleSort('roleName')">Role Name<mat-icon class="sort-icon">{{ sort.sortIcon('roleName') }}</mat-icon></th>
                <th class="sortable" (click)="sort.toggleSort('permissionCount')">Permissions<mat-icon class="sort-icon">{{ sort.sortIcon('permissionCount') }}</mat-icon></th>
                <th class="sortable" (click)="sort.toggleSort('userCount')">Users<mat-icon class="sort-icon">{{ sort.sortIcon('userCount') }}</mat-icon></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (role of pagination.paginated(); track role.roleId) {
                <tr>
                  <td class="cell-id">{{ role.roleId }}</td>
                  <td class="cell-bold">
                    {{ role.roleName }}
                    @if (role.isSystem) {
                      <span class="badge system">System</span>
                    }
                  </td>
                  <td class="cell-center">
                    {{ role.permissionCount }}
                    <button class="btn-link" [disabled]="role.isSystem" (click)="openAssignPermissions(role)" title="Assign Permissions">Edit</button>
                  </td>
                  <td class="cell-center">{{ role.userCount }}</td>
                  <td class="cell-actions">
                    <button mat-icon-button title="Edit" [disabled]="role.isSystem" (click)="openEditDialog(role)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button title="Delete" [disabled]="role.isSystem" (click)="confirmDelete(role)">
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
          ></ui-paginator>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.5rem; color: #2c003e; margin-bottom: 0.25rem; }
    .subtitle { color: #666; font-size: 0.875rem; }
    .breadcrumb { font-size: 0.8125rem; color: #888; margin-bottom: 0.5rem; }
    .breadcrumb a { color: #7b1fa2; text-decoration: none; }
    .breadcrumb a:hover { text-decoration: underline; }
    .breadcrumb .sep { margin: 0 0.375rem; }
    .search-bar { margin-bottom: 1.5rem; }
    .search-field { width: 360px; }
    .loading-state { padding: 3rem; text-align: center; color: #888; }
    .empty-state { padding: 3rem; text-align: center; color: #888; }
    .empty-icon { width: 48px; height: 48px; background: #f3e5f5; color: #7b1fa2; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 700; margin: 0 auto 1rem; }
    .table-wrapper { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { padding: 0.875rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #eee; background: #fafafa; }
    .data-table td { padding: 0.875rem 1rem; font-size: 0.875rem; color: #333; border-bottom: 1px solid #f0f0f0; }
    .data-table tbody tr:hover { background: #f9f5fc; }
    .cell-id { color: #999; font-family: monospace; }
    .cell-bold { font-weight: 500; }
    .cell-center { text-align: center; }
    .cell-actions { text-align: right; white-space: nowrap; }
    .badge.system { display: inline-block; padding: 0.2rem 0.625rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; background: #ede7f6; color: #4527a0; margin-left: 0.5rem; }
    .btn-link { background: none; border: none; color: #7b1fa2; cursor: pointer; font-size: 0.75rem; text-decoration: underline; padding: 0; }
    .sortable { cursor: pointer; user-select: none; }
    .sortable:hover { background: #f0ecf3; }
    .sort-icon { font-size: 16px; vertical-align: middle; margin-left: 4px; }
  `],
})
export class TenantRoles implements OnInit {
  private readonly roleService = inject(TenantRoleService);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);

  readonly tenantId = signal<number>(0);
  readonly loading = signal(true);
  readonly roles = signal<TenantRoleDto[]>([]);
  readonly searchTerm = signal('');

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.roles();
    return this.roles().filter(r => r.roleName?.toLowerCase().includes(term));
  });

  readonly sort = createSort();

  private readonly sorted = computed(() => {
    const col = this.sort.sortColumn();
    if (!col) return this.filtered();
    const dir = this.sort.sortDirection();
    const data = [...this.filtered()];
    data.sort((a, b) => {
      let cmp = 0;
      switch (col) {
        case 'roleId': cmp = (a.roleId ?? 0) - (b.roleId ?? 0); break;
        case 'roleName': cmp = (a.roleName || '').localeCompare(b.roleName || ''); break;
        case 'permissionCount': cmp = (a.permissionCount ?? 0) - (b.permissionCount ?? 0); break;
        case 'userCount': cmp = (a.userCount ?? 0) - (b.userCount ?? 0); break;
      }
      return dir === 'asc' ? cmp : -cmp;
    });
    return data;
  });

  readonly pagination = createPagination(this.sorted);

  ngOnInit(): void {
    const tid = Number(this.route.snapshot.paramMap.get('tenantId'));
    if (tid) {
      this.tenantId.set(tid);
      this.loadRoles();
    }
  }

  loadRoles(): void {
    this.loading.set(true);
    this.roleService.getAll(this.tenantId()).subscribe({
      next: (data) => { this.roles.set(data ?? []); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.pagination.goToPage(1);
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(RoleFormDialogComponent, {
      width: '500px',
      data: { mode: 'create' },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((roleName: string | undefined) => {
      if (roleName) {
        this.loading.set(true);
        this.roleService.create(this.tenantId(), { roleName }).subscribe({
          next: () => this.loadRoles(),
          error: () => this.loading.set(false),
        });
      }
    });
  }

  openEditDialog(role: TenantRoleDto): void {
    const dialogRef = this.dialog.open(RoleFormDialogComponent, {
      width: '500px',
      data: { mode: 'edit', role },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((roleName: string | undefined) => {
      if (roleName && role.roleId) {
        this.loading.set(true);
        this.roleService.update(this.tenantId(), role.roleId, { roleName }).subscribe({
          next: () => this.loadRoles(),
          error: () => this.loading.set(false),
        });
      }
    });
  }

  openAssignPermissions(role: TenantRoleDto): void {
    const dialogRef = this.dialog.open(AssignPermissionsDialogComponent, {
      width: '560px',
      data: { tenantId: this.tenantId(), roleId: role.roleId, roleName: role.roleName },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((changed: boolean | undefined) => {
      if (changed) {
        this.loadRoles();
      }
    });
  }

  confirmDelete(role: TenantRoleDto): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Role',
        message: `Are you sure you want to delete "${role.roleName}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      } satisfies ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && role.roleId) {
        this.loading.set(true);
        this.roleService.delete(this.tenantId(), role.roleId).subscribe({
          next: () => this.loadRoles(),
          error: () => this.loading.set(false),
        });
      }
    });
  }
}
