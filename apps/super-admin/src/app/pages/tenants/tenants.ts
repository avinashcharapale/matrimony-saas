import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TenantClient, TenantDto } from '@org/generated';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-tenants',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Tenant Management</h1>
          <p class="subtitle">Create, configure, and manage all tenant instances across the platform.</p>
        </div>
        <button class="btn-primary" (click)="openDialog()">
          <span class="btn-icon">+</span> Add Tenant
        </button>
      </div>

      <div class="search-bar">
        <input
          type="text"
          placeholder="Search by name or domain..."
          [value]="searchTerm()"
          (input)="onSearch($event)"
        />
      </div>

      @if (loading()) {
        <div class="loading-state">Loading tenants...</div>
      } @else if (filteredTenants().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">T</div>
          <p>No tenants found.</p>
        </div>
      } @else {
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tenant Name</th>
                <th>Domain</th>
                <th>Users</th>
                <th>Status</th>
                <th>Trial End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (tenant of filteredTenants(); track tenant.tenantId) {
                <tr>
                  <td class="cell-id">{{ tenant.tenantId }}</td>
                  <td class="cell-bold">{{ tenant.name || tenant.tenantCode }}</td>
                  <td>{{ tenant.domain }}</td>
                  <td class="cell-center">{{ tenant.userCount ?? 0 }}</td>
                  <td class="cell-center">
                    <span class="badge" [class.active]="tenant.isActive" [class.inactive]="!tenant.isActive">
                      {{ tenant.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>{{ tenant.trialEndDate ? (tenant.trialEndDate | date:'mediumDate') : '—' }}</td>
                  <td class="cell-actions">
                    <button class="btn-icon-sm" title="Permissions" (click)="navigateToPerms(tenant.tenantId!)">P</button>
                    <button class="btn-icon-sm" title="Roles" (click)="navigateToRoles(tenant.tenantId!)">R</button>
                    <button class="btn-icon-sm" title="Plan" (click)="navigateToPlan(tenant.tenantId!)">P</button>
                    <button class="btn-icon-sm" title="Edit" (click)="openDialog(tenant)">E</button>
                    <button class="btn-icon-sm danger" title="Delete" (click)="confirmDelete(tenant)">D</button>
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
              <h2>{{ editingTenant() ? 'Edit Tenant' : 'Add Tenant' }}</h2>
              <button class="btn-close" (click)="closeDialog()">&times;</button>
            </div>
            <form [formGroup]="tenantForm" (ngSubmit)="saveTenant()">
              <div class="dialog-body">
                <div class="field">
                  <label>Tenant Code</label>
                  <input formControlName="tenantCode" placeholder="Enter tenant code" />
                  @if (tenantForm.get('tenantCode')?.touched && tenantForm.get('tenantCode')?.errors?.['required']) {
                    <span class="field-error">Required</span>
                  }
                </div>
                <div class="field">
                  <label>Domain</label>
                  <input formControlName="domain" placeholder="example.com" />
                  @if (tenantForm.get('domain')?.touched && tenantForm.get('domain')?.errors?.['required']) {
                    <span class="field-error">Required</span>
                  }
                </div>
                <div class="field">
                  <label>Trial End Date</label>
                  <input type="date" formControlName="trialEndDate" />
                </div>
                <div class="field field-checkbox">
                  <label>
                    <input type="checkbox" formControlName="isActive" /> Active
                  </label>
                </div>
              </div>
              @if (dialogError()) {
                <div class="dialog-error">{{ dialogError() }}</div>
              }
              <div class="dialog-footer">
                <button type="button" class="btn-secondary" (click)="closeDialog()">Cancel</button>
                <button type="submit" class="btn-primary" [disabled]="tenantForm.invalid || saving()">
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
              <h2>Confirm Delete</h2>
              <button class="btn-close" (click)="cancelDelete()">&times;</button>
            </div>
            <div class="dialog-body">
              <p>Are you sure you want to delete <strong>{{ deletingTenant()?.name || deletingTenant()?.tenantCode }}</strong>? This action cannot be undone.</p>
            </div>
            @if (deleteError()) {
              <div class="dialog-error">{{ deleteError() }}</div>
            }
            <div class="dialog-footer">
              <button class="btn-secondary" (click)="cancelDelete()">Cancel</button>
              <button class="btn-danger" [disabled]="deleting()" (click)="deleteTenant()">
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
    .search-bar input {
      width: 100%; max-width: 400px; padding: 0.625rem 1rem; border: 1px solid #ddd;
      border-radius: 6px; font-size: 0.875rem; outline: none;
    }
    .search-bar input:focus { border-color: #7b1fa2; box-shadow: 0 0 0 3px rgba(123, 31, 162, 0.1); }
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
    .cell-id { color: #999; font-family: monospace; }
    .cell-bold { font-weight: 500; }
    .cell-center { text-align: center; }
    .cell-actions { text-align: right; white-space: nowrap; }
    .badge {
      display: inline-block; padding: 0.2rem 0.625rem; border-radius: 12px;
      font-size: 0.75rem; font-weight: 600;
    }
    .badge.active { background: #e8f5e9; color: #2e7d32; }
    .badge.inactive { background: #fbe9e7; color: #c62828; }
    .btn-primary {
      padding: 0.625rem 1.25rem; background: #7b1fa2; color: white; border: none;
      border-radius: 6px; font-size: 0.875rem; font-weight: 500; cursor: pointer;
      display: flex; align-items: center; gap: 0.375rem; transition: background 0.2s;
    }
    .btn-primary:hover:not(:disabled) { background: #6a1b9a; }
    .btn-primary:disabled { background: #b39dba; cursor: not-allowed; }
    .btn-secondary {
      padding: 0.625rem 1.25rem; background: white; color: #555; border: 1px solid #ddd;
      border-radius: 6px; font-size: 0.875rem; cursor: pointer; transition: background 0.2s;
    }
    .btn-secondary:hover { background: #f5f5f5; }
    .btn-danger {
      padding: 0.625rem 1.25rem; background: #e53935; color: white; border: none;
      border-radius: 6px; font-size: 0.875rem; font-weight: 500; cursor: pointer;
    }
    .btn-danger:hover:not(:disabled) { background: #c62828; }
    .btn-danger:disabled { background: #ef9a9a; cursor: not-allowed; }
    .btn-icon-sm {
      width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center;
      border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer;
      font-size: 0.75rem; font-weight: 600; color: #555; transition: all 0.2s;
    }
    .btn-icon-sm:hover { background: #f3e5f5; border-color: #7b1fa2; color: #7b1fa2; }
    .btn-icon-sm.danger:hover { background: #ffebee; border-color: #e53935; color: #e53935; }
    .btn-icon { font-size: 1.125rem; line-height: 1; }
    .btn-close {
      background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999;
      line-height: 1; padding: 0;
    }
    .btn-close:hover { color: #333; }
    .dialog-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .dialog {
      background: white; border-radius: 12px; width: 100%; max-width: 480px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto;
    }
    .dialog-small { max-width: 400px; }
    .dialog-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.25rem 1.5rem; border-bottom: 1px solid #eee;
    }
    .dialog-header h2 { font-size: 1.125rem; color: #2c003e; margin: 0; }
    .dialog-body { padding: 1.5rem; }
    .dialog-body p { color: #555; line-height: 1.6; }
    .dialog-footer {
      display: flex; justify-content: flex-end; gap: 0.75rem;
      padding: 1rem 1.5rem; border-top: 1px solid #eee;
    }
    .dialog-error {
      background: #ffebee; color: #c62828; padding: 0.75rem 1.5rem; font-size: 0.875rem;
    }
    .field { margin-bottom: 1rem; }
    .field label { display: block; font-size: 0.875rem; font-weight: 500; color: #333; margin-bottom: 0.375rem; }
    .field input[type="text"], .field input[type="date"] {
      width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #ddd; border-radius: 6px;
      font-size: 0.875rem; outline: none; box-sizing: border-box;
    }
    .field input:focus { border-color: #7b1fa2; box-shadow: 0 0 0 3px rgba(123, 31, 162, 0.1); }
    .field-checkbox label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
    .field-checkbox input[type="checkbox"] { width: auto; }
    .field-error { color: #c62828; font-size: 0.75rem; margin-top: 0.25rem; }
  `],
})
export class Tenants implements OnInit {
  private readonly tenantClient = inject(TenantClient);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly tenants = signal<TenantDto[]>([]);
  readonly searchTerm = signal('');
  readonly dialogOpen = signal(false);
  readonly deleteDialogOpen = signal(false);
  readonly editingTenant = signal<TenantDto | null>(null);
  readonly deletingTenant = signal<TenantDto | null>(null);
  readonly dialogError = signal<string | null>(null);
  readonly deleteError = signal<string | null>(null);

  readonly filteredTenants = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.tenants();
    return this.tenants().filter(
      (t) =>
        (t.tenantCode?.toLowerCase().includes(term)) ||
        (t.domain?.toLowerCase().includes(term)),
    );
  });

  readonly tenantForm = this.fb.nonNullable.group({
    tenantCode: ['', Validators.required],
    domain: ['', Validators.required],
    trialEndDate: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.loading.set(true);
    this.tenantClient.getAll().subscribe({
      next: (data) => {
        this.tenants.set(data);
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  navigateToPerms(tenantId: number): void {
    this.router.navigate(['/tenants', tenantId, 'permissions']);
  }

  navigateToRoles(tenantId: number): void {
    this.router.navigate(['/tenants', tenantId, 'roles']);
  }

  navigateToPlan(tenantId: number): void {
    this.router.navigate(['/tenants', tenantId, 'plan']);
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  openDialog(tenant?: TenantDto): void {
    if (tenant) {
      this.editingTenant.set(tenant);
      this.tenantForm.patchValue({
        tenantCode: tenant.tenantCode ?? '',
        domain: tenant.domain ?? '',
        trialEndDate: tenant.trialEndDate ? tenant.trialEndDate.substring(0, 10) : '',
        isActive: tenant.isActive ?? true,
      });
    } else {
      this.editingTenant.set(null);
      this.tenantForm.reset({ tenantCode: '', domain: '', trialEndDate: '', isActive: true });
    }
    this.dialogError.set(null);
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
    this.editingTenant.set(null);
    this.dialogError.set(null);
  }

  saveTenant(): void {
    if (this.tenantForm.invalid) return;

    const formValue = this.tenantForm.getRawValue();
    const dto: TenantDto = {
      tenantCode: formValue.tenantCode,
      domain: formValue.domain,
      trialEndDate: formValue.trialEndDate || undefined,
      isActive: formValue.isActive,
    };

    this.saving.set(true);
    this.dialogError.set(null);

    const editing = this.editingTenant();
    const request$ = editing?.tenantId
      ? this.tenantClient.update(editing.tenantId, dto)
      : this.tenantClient.create(dto);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeDialog();
        this.loadTenants();
      },
      error: (err) => {
        this.saving.set(false);
        this.dialogError.set(err?.error?.message ?? err?.error ?? 'Failed to save tenant.');
        this.cdr.markForCheck();
      },
    });
  }

  confirmDelete(tenant: TenantDto): void {
    this.deletingTenant.set(tenant);
    this.deleteError.set(null);
    this.deleteDialogOpen.set(true);
  }

  cancelDelete(): void {
    this.deleteDialogOpen.set(false);
    this.deletingTenant.set(null);
    this.deleteError.set(null);
  }

  deleteTenant(): void {
    const tenant = this.deletingTenant();
    if (!tenant?.tenantId) return;

    this.deleting.set(true);
    this.tenantClient.delete(tenant.tenantId).subscribe({
      next: () => {
        this.deleting.set(false);
        this.cancelDelete();
        this.loadTenants();
      },
      error: (err) => {
        this.deleting.set(false);
        this.deleteError.set(err?.error?.message ?? err?.error ?? 'Failed to delete tenant.');
        this.cdr.markForCheck();
      },
    });
  }
}
