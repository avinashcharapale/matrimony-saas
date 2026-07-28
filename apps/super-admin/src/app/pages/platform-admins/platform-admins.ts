import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PlatformAdminService, PlatformAdminDto, PlatformRoleDto } from '../../services/platform-admin.service';
import { PlatformRoleService } from '../../services/platform-role.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-platform-admins',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Platform Admins</h1>
          <p class="subtitle">Manage platform administrators and their role assignments.</p>
        </div>
        <button class="btn-primary" (click)="openDialog()">
          <span class="btn-icon">+</span> Add Admin
        </button>
      </div>

      <div class="search-bar">
        <input type="text" placeholder="Search by email..." [value]="searchTerm()" (input)="onSearch($event)" />
      </div>

      @if (loading()) {
        <div class="loading-state">Loading admins...</div>
      } @else if (filtered().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">A</div>
          <p>No admins found.</p>
        </div>
      } @else {
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Display Name</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (admin of filtered(); track admin.platformAdminId) {
                <tr>
                  <td class="cell-id">{{ admin.platformAdminId }}</td>
                  <td class="cell-bold">{{ admin.email }}</td>
                  <td>{{ admin.displayName || '—' }}</td>
                  <td>
                    @for (role of admin.roles; track role.platformRoleId) {
                      <span class="role-tag">{{ role.roleName }}</span>
                    }
                  </td>
                  <td class="cell-center">
                    <span class="badge" [class.active]="admin.isActive" [class.inactive]="!admin.isActive">
                      {{ admin.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>{{ admin.createdAt ? (admin.createdAt | date:'shortDate') : '—' }}</td>
                  <td class="cell-actions">
                    <button class="btn-icon-sm" title="Edit" (click)="openDialog(admin)">E</button>
                    <button class="btn-icon-sm danger" title="Deactivate" (click)="confirmDelete(admin)">D</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (dialogOpen()) {
        <div class="dialog-overlay" (click)="closeDialog()">
          <div class="dialog dialog-lg" (click)="$event.stopPropagation()">
            <div class="dialog-header">
              <h2>{{ editing() ? 'Edit Admin' : 'Add Admin' }}</h2>
              <button class="btn-close" (click)="closeDialog()">&times;</button>
            </div>
            <form [formGroup]="form" (ngSubmit)="save()">
              <div class="dialog-body">
                <div class="field">
                  <label>Email</label>
                  <input formControlName="email" type="email" placeholder="admin@example.com" />
                  @if (form.get('email')?.touched && form.get('email')?.errors?.['required']) {
                    <span class="field-error">Required</span>
                  }
                  @if (form.get('email')?.touched && form.get('email')?.errors?.['email']) {
                    <span class="field-error">Invalid email</span>
                  }
                </div>
                @if (!editing()) {
                  <div class="field">
                    <label>Password</label>
                    <input formControlName="password" type="password" placeholder="Min 6 characters" />
                    @if (form.get('password')?.touched && form.get('password')?.errors?.['required']) {
                      <span class="field-error">Required</span>
                    }
                    @if (form.get('password')?.touched && form.get('password')?.errors?.['minlength']) {
                      <span class="field-error">Minimum 6 characters</span>
                    }
                  </div>
                }
                <div class="field">
                  <label>Display Name</label>
                  <input formControlName="displayName" placeholder="Optional display name" />
                </div>
                <div class="field">
                  <label>Roles</label>
                  <div class="role-checkbox-list">
                    @for (role of availableRoles(); track role.platformRoleId) {
                      <label class="role-checkbox-item">
                        <input type="checkbox" [checked]="selectedRoleIds().has(role.platformRoleId)" (change)="toggleRole(role.platformRoleId)" />
                        <span>{{ role.roleName }}</span>
                      </label>
                    }
                  </div>
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

      @if (deleteDialogOpen()) {
        <div class="dialog-overlay" (click)="cancelDelete()">
          <div class="dialog dialog-small" (click)="$event.stopPropagation()">
            <div class="dialog-header">
              <h2>Deactivate Admin</h2>
              <button class="btn-close" (click)="cancelDelete()">&times;</button>
            </div>
            <div class="dialog-body">
              <p>Are you sure you want to deactivate <strong>{{ deletingItem()?.email }}</strong>?</p>
            </div>
            @if (deleteError()) {
              <div class="dialog-error">{{ deleteError() }}</div>
            }
            <div class="dialog-footer">
              <button class="btn-secondary" (click)="cancelDelete()">Cancel</button>
              <button class="btn-danger" [disabled]="deleting()" (click)="deleteAdmin()">
                @if (deleting()) { Deactivating... } @else { Deactivate }
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
    .cell-actions { text-align: right; white-space: nowrap; }
    .badge { display: inline-block; padding: 0.2rem 0.625rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .badge.active { background: #e8f5e9; color: #2e7d32; }
    .badge.inactive { background: #fbe9e7; color: #c62828; }
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
    .dialog-body { padding: 1.5rem; max-height: 60vh; overflow-y: auto; }
    .dialog-body p { color: #555; line-height: 1.6; }
    .dialog-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #eee; }
    .dialog-error { background: #ffebee; color: #c62828; padding: 0.75rem 1.5rem; font-size: 0.875rem; }
    .field { margin-bottom: 1rem; }
    .field label { display: block; font-size: 0.875rem; font-weight: 500; color: #333; margin-bottom: 0.375rem; }
    .field input[type="text"], .field input[type="email"], .field input[type="password"] { width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.875rem; outline: none; box-sizing: border-box; }
    .field input:focus { border-color: #7b1fa2; box-shadow: 0 0 0 3px rgba(123,31,162,0.1); }
    .field-checkbox label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
    .field-checkbox input[type="checkbox"] { width: auto; }
    .field-error { color: #c62828; font-size: 0.75rem; margin-top: 0.25rem; }
    .role-tag { display: inline-block; padding: 2px 8px; background: #f3e5f5; color: #7b1fa2; border-radius: 4px; font-size: 0.75rem; font-weight: 500; margin: 1px 2px; }
    .role-checkbox-list { display: flex; flex-direction: column; gap: 4px; max-height: 200px; overflow-y: auto; padding: 8px; border: 1px solid #ddd; border-radius: 6px; }
    .role-checkbox-item { display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.875rem; padding: 4px 0; }
    .role-checkbox-item input[type="checkbox"] { width: auto; margin: 0; }
  `],
})
export class PlatformAdmins implements OnInit {
  private readonly adminService = inject(PlatformAdminService);
  private readonly roleService = inject(PlatformRoleService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly deletingItem = signal<PlatformAdminDto | null>(null);
  readonly admins = signal<PlatformAdminDto[]>([]);
  readonly availableRoles = signal<PlatformRoleDto[]>([]);
  readonly selectedRoleIds = signal<Set<number>>(new Set());
  readonly searchTerm = signal('');
  readonly dialogOpen = signal(false);
  readonly deleteDialogOpen = signal(false);
  readonly editing = signal<PlatformAdminDto | null>(null);
  readonly dialogError = signal<string | null>(null);
  readonly deleteError = signal<string | null>(null);

  readonly filtered = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.admins();
    return this.admins().filter(a => a.email?.toLowerCase().includes(term));
  });

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(6)]],
    displayName: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    this.loadAdmins();
    this.loadRoles();
  }

  loadAdmins(): void {
    this.loading.set(true);
    this.adminService.getAll().subscribe({
      next: (data) => { this.admins.set(data ?? []); this.loading.set(false); this.cdr.markForCheck(); },
      error: () => { this.loading.set(false); this.cdr.markForCheck(); },
    });
  }

  loadRoles(): void {
    this.roleService.getAll().subscribe({
      next: (data) => { this.availableRoles.set(data ?? []); this.cdr.markForCheck(); },
      error: () => { this.cdr.markForCheck(); },
    });
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  toggleRole(id: number): void {
    const set = new Set(this.selectedRoleIds());
    if (set.has(id)) set.delete(id); else set.add(id);
    this.selectedRoleIds.set(set);
  }

  openDialog(admin?: PlatformAdminDto): void {
    if (admin) {
      this.editing.set(admin);
      this.form.patchValue({
        email: admin.email ?? '',
        password: '',
        displayName: admin.displayName ?? '',
        isActive: admin.isActive ?? true,
      });
      this.selectedRoleIds.set(new Set(admin.roles.map(r => r.platformRoleId)));
    } else {
      this.editing.set(null);
      this.form.reset({ email: '', password: '', displayName: '', isActive: true });
      this.selectedRoleIds.set(new Set());
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
    const roleIds = Array.from(this.selectedRoleIds());

    const edit = this.editing();
    const request$ = edit?.platformAdminId
      ? this.adminService.update(edit.platformAdminId, {
          displayName: val.displayName || undefined,
          isActive: val.isActive,
          roleIds,
        })
      : this.adminService.create({
          email: val.email,
          password: val.password,
          displayName: val.displayName || undefined,
          roleIds,
        });

    request$.subscribe({
      next: () => { this.saving.set(false); this.closeDialog(); this.loadAdmins(); },
      error: (err) => { this.saving.set(false); this.dialogError.set(err?.error?.message ?? err?.error ?? 'Failed to save.'); this.cdr.markForCheck(); },
    });
  }

  confirmDelete(admin: PlatformAdminDto): void {
    this.deletingItem.set(admin);
    this.deleteError.set(null);
    this.deleteDialogOpen.set(true);
  }

  cancelDelete(): void {
    this.deleteDialogOpen.set(false);
    this.deletingItem.set(null);
    this.deleteError.set(null);
  }

  deleteAdmin(): void {
    const admin = this.deletingItem();
    if (!admin?.platformAdminId) return;
    this.deleting.set(true);
    this.adminService.delete(admin.platformAdminId).subscribe({
      next: () => { this.deleting.set(false); this.cancelDelete(); this.loadAdmins(); },
      error: (err) => { this.deleting.set(false); this.deleteError.set(err?.error?.message ?? err?.error ?? 'Failed to deactivate.'); this.cdr.markForCheck(); },
    });
  }
}
