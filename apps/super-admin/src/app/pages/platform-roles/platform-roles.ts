import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PlatformRoleService, PlatformRoleDto } from '../../services/platform-role.service';
import { PlatformPermissionService, PlatformPermissionDto } from '../../services/platform-permission.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-platform-roles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Platform Roles</h1>
          <p class="subtitle">Manage platform roles and their permission assignments.</p>
        </div>
        <button class="btn-primary" (click)="openDialog()">
          <span class="btn-icon">+</span> Add Role
        </button>
      </div>

      <div class="search-bar">
        <input type="text" placeholder="Search by role name..." [value]="searchTerm()" (input)="onSearch($event)" />
      </div>

      @if (loading()) {
        <div class="loading-state">Loading roles...</div>
      } @else if (filtered().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">R</div>
          <p>No roles found.</p>
        </div>
      } @else {
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Role Name</th>
                <th>Permissions</th>
                <th>Admins</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (role of filtered(); track role.platformRoleId) {
                <tr>
                  <td class="cell-id">{{ role.platformRoleId }}</td>
                  <td class="cell-bold">{{ role.roleName }}</td>
                  <td class="cell-center">
                    {{ role.permissionCount }}
                    <button class="btn-link" (click)="openAssignPermissions(role)" title="Assign Permissions">Edit</button>
                  </td>
                  <td class="cell-center">{{ role.adminCount }}</td>
                  <td class="cell-center">
                    <span class="badge" [class.active]="role.isActive" [class.inactive]="!role.isActive">
                      {{ role.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="cell-actions">
                    <button class="btn-icon-sm" title="Edit" (click)="openDialog(role)">E</button>
                    <button class="btn-icon-sm danger" title="Delete" (click)="confirmDelete(role)">D</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (dialogOpen()) {
        <div class="dialog-overlay" (click)="closeDialog()">
          <div class="dialog" (click)="$event.stopPropagation()">
            <div class="dialog-header">
              <h2>{{ editing() ? 'Edit Role' : 'Add Role' }}</h2>
              <button class="btn-close" (click)="closeDialog()">&times;</button>
            </div>
            <form [formGroup]="form" (ngSubmit)="save()">
              <div class="dialog-body">
                <div class="field">
                  <label>Role Name</label>
                  <input formControlName="roleName" placeholder="e.g. Support" />
                  @if (form.get('roleName')?.touched && form.get('roleName')?.errors?.['required']) {
                    <span class="field-error">Required</span>
                  }
                </div>
                <div class="field field-checkbox">
                  <label><input type="checkbox" formControlName="isActive" /> Active</label>
                </div>
              </div>
              @if (dialogError()) {
                <div class="dialog-error">{{ dialogError() }}</div>
              }
              <div class="dialog-footer">
                <button type="button" class="btn-secondary" (click)="closeDialog()">Cancel</button>
                <button type="submit" class="btn-primary" [disabled]="form.invalid || saving()">
                  @if (saving()) { Saving... } @else { Save }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      @if (assignPermDialogOpen()) {
        <div class="dialog-overlay" (click)="closeAssignPermDialog()">
          <div class="dialog dialog-lg" (click)="$event.stopPropagation()">
            <div class="dialog-header">
              <h2>Assign Permissions: {{ assigningRole()?.roleName }}</h2>
              <button class="btn-close" (click)="closeAssignPermDialog()">&times;</button>
            </div>
            <div class="dialog-body">
              @if (permLoading()) {
                <p>Loading permissions...</p>
              } @else {
                <div class="perm-list">
                  @for (perm of allPermissions(); track perm.platformPermissionId) {
                    <label class="perm-item">
                      <input type="checkbox" [checked]="isPermSelected(perm.platformPermissionId!)" (change)="togglePerm(perm.platformPermissionId!)" />
                      <span class="perm-label">{{ perm.displayName }}</span>
                      <span class="perm-code">{{ perm.permissionCode }}</span>
                    </label>
                  }
                </div>
              }
            </div>
            @if (assignPermError()) {
              <div class="dialog-error">{{ assignPermError() }}</div>
            }
            <div class="dialog-footer">
              <button class="btn-secondary" (click)="closeAssignPermDialog()">Cancel</button>
              <button class="btn-primary" [disabled]="permLoading()" (click)="savePermissions()">Save</button>
            </div>
          </div>
        </div>
      }

      @if (deleteDialogOpen()) {
        <div class="dialog-overlay" (click)="cancelDelete()">
          <div class="dialog dialog-small" (click)="$event.stopPropagation()">
            <div class="dialog-header">
              <h2>Confirm Delete</h2>
              <button class="btn-close" (click)="cancelDelete()">&times;</button>
            </div>
            <div class="dialog-body">
              <p>Are you sure you want to delete <strong>{{ deletingItem()?.roleName }}</strong>?</p>
            </div>
            @if (deleteError()) {
              <div class="dialog-error">{{ deleteError() }}</div>
            }
            <div class="dialog-footer">
              <button class="btn-secondary" (click)="cancelDelete()">Cancel</button>
              <button class="btn-danger" [disabled]="deleting()" (click)="deleteRole()">
                @if (deleting()) { Deleting... } @else { Delete }
              </button>
            </div>
          </div>
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
    .search-bar input { width: 100%; max-width: 400px; padding: 0.625rem 1rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.875rem; outline: none; }
    .search-bar input:focus { border-color: #7b1fa2; box-shadow: 0 0 0 3px rgba(123,31,162,0.1); }
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
    .badge { display: inline-block; padding: 0.2rem 0.625rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .badge.active { background: #e8f5e9; color: #2e7d32; }
    .badge.inactive { background: #fbe9e7; color: #c62828; }
    .btn-link { background: none; border: none; color: #7b1fa2; cursor: pointer; font-size: 0.75rem; text-decoration: underline; padding: 0; }
    .btn-primary { padding: 0.625rem 1.25rem; background: #7b1fa2; color: white; border: none; border-radius: 6px; font-size: 0.875rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 0.375rem; transition: background 0.2s; }
    .btn-primary:hover:not(:disabled) { background: #6a1b9a; }
    .btn-primary:disabled { background: #b39dba; cursor: not-allowed; }
    .btn-secondary { padding: 0.625rem 1.25rem; background: white; color: #555; border: 1px solid #ddd; border-radius: 6px; font-size: 0.875rem; cursor: pointer; transition: background 0.2s; }
    .btn-secondary:hover { background: #f5f5f5; }
    .btn-danger { padding: 0.625rem 1.25rem; background: #e53935; color: white; border: none; border-radius: 6px; font-size: 0.875rem; font-weight: 500; cursor: pointer; }
    .btn-danger:hover:not(:disabled) { background: #c62828; }
    .btn-danger:disabled { background: #ef9a9a; cursor: not-allowed; }
    .btn-icon-sm { width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer; font-size: 0.75rem; font-weight: 600; color: #555; transition: all 0.2s; }
    .btn-icon-sm:hover { background: #f3e5f5; border-color: #7b1fa2; color: #7b1fa2; }
    .btn-icon-sm.danger:hover { background: #ffebee; border-color: #e53935; color: #e53935; }
    .btn-icon { font-size: 1.125rem; line-height: 1; }
    .btn-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999; line-height: 1; padding: 0; }
    .btn-close:hover { color: #333; }
    .dialog-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .dialog { background: white; border-radius: 12px; width: 100%; max-width: 480px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto; }
    .dialog-lg { max-width: 560px; }
    .dialog-small { max-width: 400px; }
    .dialog-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #eee; }
    .dialog-header h2 { font-size: 1.125rem; color: #2c003e; margin: 0; }
    .dialog-body { padding: 1.5rem; max-height: 50vh; overflow-y: auto; }
    .dialog-body p { color: #555; line-height: 1.6; }
    .dialog-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #eee; }
    .dialog-error { background: #ffebee; color: #c62828; padding: 0.75rem 1.5rem; font-size: 0.875rem; }
    .field { margin-bottom: 1rem; }
    .field label { display: block; font-size: 0.875rem; font-weight: 500; color: #333; margin-bottom: 0.375rem; }
    .field input[type="text"] { width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.875rem; outline: none; box-sizing: border-box; }
    .field input:focus { border-color: #7b1fa2; box-shadow: 0 0 0 3px rgba(123,31,162,0.1); }
    .field-checkbox label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
    .field-checkbox input[type="checkbox"] { width: auto; }
    .field-error { color: #c62828; font-size: 0.75rem; margin-top: 0.25rem; }
    .perm-list { display: flex; flex-direction: column; gap: 6px; }
    .perm-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; cursor: pointer; border-bottom: 1px solid #f0f0f0; }
    .perm-label { font-size: 14px; }
    .perm-code { font-size: 12px; color: #888; margin-left: auto; }
  `],
})
export class PlatformRoles implements OnInit {
  private readonly roleService = inject(PlatformRoleService);
  private readonly permService = inject(PlatformPermissionService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly deletingItem = signal<PlatformRoleDto | null>(null);
  readonly roles = signal<PlatformRoleDto[]>([]);
  readonly searchTerm = signal('');
  readonly dialogOpen = signal(false);
  readonly deleteDialogOpen = signal(false);
  readonly editing = signal<PlatformRoleDto | null>(null);
  readonly dialogError = signal<string | null>(null);
  readonly deleteError = signal<string | null>(null);

  readonly assignPermDialogOpen = signal(false);
  readonly assigningRole = signal<PlatformRoleDto | null>(null);
  readonly permLoading = signal(false);
  readonly allPermissions = signal<PlatformPermissionDto[]>([]);
  readonly selectedPermIds = signal<Set<number>>(new Set());
  readonly assignPermError = signal<string | null>(null);

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.roles();
    return this.roles().filter(r => r.roleName?.toLowerCase().includes(term));
  });

  readonly form = this.fb.nonNullable.group({
    roleName: ['', Validators.required],
    isActive: [true],
  });

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading.set(true);
    this.roleService.getAll().subscribe({
      next: (data) => { this.roles.set(data ?? []); this.loading.set(false); this.cdr.markForCheck(); },
      error: () => { this.loading.set(false); this.cdr.markForCheck(); },
    });
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  openDialog(role?: PlatformRoleDto): void {
    if (role) {
      this.editing.set(role);
      this.form.patchValue({ roleName: role.roleName ?? '', isActive: role.isActive ?? true });
    } else {
      this.editing.set(null);
      this.form.reset({ roleName: '', isActive: true });
    }
    this.dialogError.set(null);
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
    this.editing.set(null);
    this.dialogError.set(null);
  }

  save(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    this.saving.set(true);
    this.dialogError.set(null);

    const edit = this.editing();
    const request$ = edit?.platformRoleId
      ? this.roleService.update(edit.platformRoleId, { roleName: val.roleName, isActive: val.isActive })
      : this.roleService.create(val);

    request$.subscribe({
      next: () => { this.saving.set(false); this.closeDialog(); this.loadRoles(); },
      error: (err) => { this.saving.set(false); this.dialogError.set(err?.error?.message ?? err?.error ?? 'Failed to save.'); this.cdr.markForCheck(); },
    });
  }

  openAssignPermissions(role: PlatformRoleDto): void {
    this.assigningRole.set(role);
    this.assignPermError.set(null);
    this.permLoading.set(true);
    this.selectedPermIds.set(new Set());
    this.assignPermDialogOpen.set(true);

    this.roleService.getById(role.platformRoleId).subscribe({
      next: (detail) => {
        this.permLoading.set(false);
        this.loadAllPerms();
        this.cdr.markForCheck();
      },
      error: () => { this.permLoading.set(false); this.cdr.markForCheck(); },
    });
  }

  loadAllPerms(): void {
    this.permService.getAll().subscribe({
      next: (perms) => { this.allPermissions.set(perms ?? []); this.permLoading.set(false); this.cdr.markForCheck(); },
      error: () => { this.permLoading.set(false); this.cdr.markForCheck(); },
    });
  }

  closeAssignPermDialog(): void {
    this.assignPermDialogOpen.set(false);
    this.assigningRole.set(null);
    this.selectedPermIds.set(new Set());
  }

  isPermSelected(id: number): boolean {
    return this.selectedPermIds().has(id);
  }

  togglePerm(id: number): void {
    const set = new Set(this.selectedPermIds());
    if (set.has(id)) set.delete(id); else set.add(id);
    this.selectedPermIds.set(set);
  }

  savePermissions(): void {
    const role = this.assigningRole();
    if (!role) return;
    this.permLoading.set(true);
    this.assignPermError.set(null);

    this.roleService.assignPermissions(role.platformRoleId, Array.from(this.selectedPermIds())).subscribe({
      next: () => { this.permLoading.set(false); this.closeAssignPermDialog(); this.loadRoles(); },
      error: (err) => { this.permLoading.set(false); this.assignPermError.set(err?.error?.message ?? err?.error ?? 'Failed to assign permissions.'); this.cdr.markForCheck(); },
    });
  }

  confirmDelete(role: PlatformRoleDto): void {
    this.deletingItem.set(role);
    this.deleteError.set(null);
    this.deleteDialogOpen.set(true);
  }

  cancelDelete(): void {
    this.deleteDialogOpen.set(false);
    this.deletingItem.set(null);
    this.deleteError.set(null);
  }

  deleteRole(): void {
    const role = this.deletingItem();
    if (!role?.platformRoleId) return;
    this.deleting.set(true);
    this.roleService.delete(role.platformRoleId).subscribe({
      next: () => { this.deleting.set(false); this.cancelDelete(); this.loadRoles(); },
      error: (err) => { this.deleting.set(false); this.deleteError.set(err?.error?.message ?? err?.error ?? 'Failed to delete.'); this.cdr.markForCheck(); },
    });
  }
}
