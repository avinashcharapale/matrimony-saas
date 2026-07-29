import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { TenantClient, TenantDto } from '@org/generated';
import { PageHeaderComponent } from '@org/shared-ui';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
  DataTableComponent,
  TableColumn,
} from '@org/shared-ui';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-tenant-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add New Tenant' : 'Edit Tenant' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tenant Name</mat-label>
          <input matInput formControlName="tenantName" placeholder="e.g. Matrimony India" />
          <mat-icon matPrefix>business</mat-icon>
          @if (form.get('tenantName')?.hasError('required') && form.get('tenantName')?.touched) {
            <mat-error>Tenant name is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Domain</mat-label>
          <input matInput formControlName="domainName" placeholder="e.g. example.com" />
          <mat-icon matPrefix>language</mat-icon>
          @if (form.get('domainName')?.hasError('required') && form.get('domainName')?.touched) {
            <mat-error>Domain is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Trial End Date</mat-label>
          <input
            matInput
            [matDatepicker]="picker"
            formControlName="trialEndDate"
            placeholder="Choose a date"
          />
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <div class="toggle-row">
          <mat-slide-toggle formControlName="isActive" color="primary">
            Active
          </mat-slide-toggle>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="form.invalid"
        (click)="submit()"
      >
        {{ data.mode === 'create' ? 'Create' : 'Update' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 4px;
    }

    .toggle-row {
      margin: 12px 0;
    }

    mat-dialog-content {
      min-width: 400px;
    }
  `],
})
export class TenantFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TenantFormDialogComponent>);
  readonly data = inject<{
    mode: 'create' | 'edit';
    tenant?: TenantDto;
  }>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    tenantName: [this.data.tenant?.tenantName ?? '', [Validators.required]],
    domainName: [this.data.tenant?.domainName ?? '', [Validators.required]],
    trialEndDate: [this.data.tenant?.trialEndDate ? new Date(this.data.tenant.trialEndDate) : null],
    isActive: [this.data.tenant?.isActive ?? true],
  });

  submit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    const dto: TenantDto = {
      tenantId: this.data.tenant?.tenantId,
      tenantName: val.tenantName,
      domainName: val.domainName,
      trialEndDate: val.trialEndDate ? val.trialEndDate.toISOString() : undefined,
      isActive: val.isActive,
    };
    this.dialogRef.close(dto);
  }
}

interface TenantRow extends Record<string, unknown> {
  tenantId?: number;
  tenantName?: string;
  domainName?: string;
  isActive?: boolean;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  trialEndDate?: string;
  isActiveLabel: string;
  subscriptionStartDateFormatted: string;
  subscriptionEndDateFormatted: string;
  trialEndDateFormatted: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-tenants',
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
    MatSlideToggleModule,
    TenantFormDialogComponent,
  ],
  template: `
    <div class="tenants-page">
      <ui-page-header title="Tenant Management" subtitle="Configure and manage tenant instances">
        <button mat-flat-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon>
          Add Tenant
        </button>
      </ui-page-header>

      <div class="search-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search tenants</mat-label>
          <input
            matInput
            [(ngModel)]="searchTerm"
            placeholder="Search by name or domain..."
          />
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>
      </div>

      <ui-data-table
        [columns]="columns"
        [data]="displayRows()"
        [loading]="loading()"
        emptyMessage="No tenants found"
        (rowEdit)="openEditDialog($event)"
        (rowDelete)="confirmDelete($event)"
      ></ui-data-table>
    </div>
  `,
  styles: [`
    .tenants-page {
      position: relative;
    }

    .search-bar {
      margin-bottom: 1.5rem;
    }

    .search-field {
      width: 360px;
    }
  `],
})
export class Tenants implements OnInit {
  private readonly tenantClient = inject(TenantClient);
  private readonly dialog = inject(MatDialog);

  searchTerm = '';
  readonly tenants = signal<TenantDto[]>([]);
  readonly loading = signal(false);

  readonly columns: TableColumn[] = [
    { key: 'tenantId', label: 'ID', type: 'text' },
    { key: 'tenantName', label: 'Tenant Name', type: 'text' },
    { key: 'domainName', label: 'Domain', type: 'text' },
    { key: 'subscriptionStartDateFormatted', label: 'Start Date', type: 'date' },
    { key: 'subscriptionEndDateFormatted', label: 'End Date', type: 'date' },
    { key: 'trialEndDateFormatted', label: 'Trial End Date', type: 'date' },
    { key: 'isActiveLabel', label: 'Status', type: 'badge' },
  ];

  readonly displayRows = computed<TenantRow[]>(() => {
    const list = this.tenants();
    const term = this.searchTerm.toLowerCase();
    const mapped = list.map((t) => this.toRow(t));
    if (!term) return mapped;
    return mapped.filter((r) => {
      const name = r.tenantName ?? '';
      const domain = r.domainName ?? '';
      return name.toLowerCase().includes(term) || domain.toLowerCase().includes(term);
    });
  });

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.loading.set(true);
    this.tenantClient.getAll().subscribe({
      next: (tenants) => {
        this.tenants.set(tenants ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private toRow(tenant: TenantDto): TenantRow {
    return {
      tenantId: tenant.tenantId,
      tenantName: tenant.tenantName,
      domainName: tenant.domainName,
      isActive: tenant.isActive,
      subscriptionStartDate: tenant.subscriptionStartDate,
      subscriptionEndDate: tenant.subscriptionEndDate,
      trialEndDate: tenant.trialEndDate,
      isActiveLabel: tenant.isActive ? 'Active' : 'Inactive',
      subscriptionStartDateFormatted: tenant.subscriptionStartDate
        ? new Date(tenant.subscriptionStartDate).toLocaleDateString()
        : '-',
      subscriptionEndDateFormatted: tenant.subscriptionEndDate
        ? new Date(tenant.subscriptionEndDate).toLocaleDateString()
        : '-',
      trialEndDateFormatted: tenant.trialEndDate
        ? new Date(tenant.trialEndDate).toLocaleDateString()
        : '-',
    };
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(TenantFormDialogComponent, {
      width: '500px',
      data: { mode: 'create' as const },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loading.set(true);
        this.tenantClient.create(result).subscribe({
          next: () => {
            this.loadTenants();
          },
          error: () => {
            this.loading.set(false);
          },
        });
      }
    });
  }

  openEditDialog(row: Record<string, unknown>): void {
    const tenant = row as unknown as TenantDto;
    const dialogRef = this.dialog.open(TenantFormDialogComponent, {
      width: '500px',
      data: { mode: 'edit' as const, tenant },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && tenant.tenantId != null) {
        this.loading.set(true);
        this.tenantClient.update(tenant.tenantId, result).subscribe({
          next: () => {
            this.loadTenants();
          },
          error: () => {
            this.loading.set(false);
          },
        });
      }
    });
  }

  confirmDelete(row: Record<string, unknown>): void {
    const tenant = row as unknown as TenantDto;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Tenant',
        message: `Are you sure you want to delete tenant "${tenant.tenantName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      } satisfies ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && tenant.tenantId != null) {
        this.loading.set(true);
        this.tenantClient.delete(tenant.tenantId).subscribe({
          next: () => {
            this.loadTenants();
          },
          error: () => {
            this.loading.set(false);
          },
        });
      }
    });
  }
}
