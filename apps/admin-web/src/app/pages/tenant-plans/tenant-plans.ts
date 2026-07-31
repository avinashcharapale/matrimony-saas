import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PageHeaderComponent, StatusBadgeComponent } from '@org/shared-ui';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  SubscriptionPlanDto,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
} from '@org/generated';
import { TenantPlanService } from '../../services/tenant-plan.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-tenant-plans',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, PageHeaderComponent, StatusBadgeComponent,
    MatCardModule, MatIconModule, MatProgressSpinnerModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule,
  ],
  template: `
    <div class="plans-page">
      <ui-page-header
        title="Tenant Plans"
        subtitle="Create and manage your tenant's own subscription plans"
      />

      <div class="header-actions">
        <button mat-flat-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon>
          Add Plan
        </button>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading plans...</span>
        </div>
      } @else if (plans().length === 0) {
        <div class="empty-state">
          <mat-icon>inventory_2</mat-icon>
          <span>No plans found. Create your first plan to get started.</span>
        </div>
      } @else {
        <div class="table-wrapper">
          <table class="plans-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Currency</th>
                <th>Status</th>
                <th>Popular</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (plan of plans(); track plan.id) {
                <tr>
                  <td class="cell-code">{{ plan.code }}</td>
                  <td class="cell-bold">{{ plan.name }}</td>
                  <td class="cell-price">{{ plan.price != null ? (plan.currency ?? 'INR') + ' ' + plan.price : '-' }}</td>
                  <td class="cell-center">{{ plan.durationMonths != null ? plan.durationMonths + ' month' + (plan.durationMonths === 1 ? '' : 's') : '-' }}</td>
                  <td class="cell-center">{{ plan.currency ?? 'INR' }}</td>
                  <td class="cell-center">
                    <ui-status-badge [status]="plan.isActive ? 'Active' : 'Inactive'"></ui-status-badge>
                  </td>
                  <td class="cell-center">
                    @if (plan.isPopular) {
                      <mat-icon class="popular-icon">star</mat-icon>
                    } @else {
                      <span class="cell-muted">—</span>
                    }
                  </td>
                  <td class="cell-actions">
                    <button mat-icon-button color="primary" title="Edit" (click)="openEditDialog(plan)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" title="Delete" (click)="confirmDelete(plan)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .plans-page { position: relative; }
    .header-actions { margin-bottom: 1.5rem; }
    .loading-state, .empty-state {
      display: flex; flex-direction: column; align-items: center; gap: 12px;
      padding: 3rem; color: #757575; font-size: 14px;
      background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .table-wrapper {
      background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      overflow-x: auto;
    }
    .plans-table { width: 100%; border-collapse: collapse; }
    .plans-table th {
      padding: 0.875rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 600;
      color: #666; text-transform: uppercase; letter-spacing: 0.5px;
      border-bottom: 2px solid #eee; background: #fafafa;
    }
    .plans-table td {
      padding: 0.875rem 1rem; font-size: 0.875rem; color: #333;
      border-bottom: 1px solid #f0f0f0;
    }
    .plans-table tbody tr:hover { background: #f5f5f5; }
    .cell-code { font-family: monospace; color: #1976d2; font-weight: 600; }
    .cell-bold { font-weight: 500; }
    .cell-center { text-align: center; }
    .cell-price { font-weight: 600; color: #2e7d32; }
    .cell-actions { text-align: right; white-space: nowrap; }
    .cell-muted { color: #bdbdbd; }
    .popular-icon { color: #f9a825; font-size: 18px; width: 18px; height: 18px; }
  `],
})
export class TenantPlans implements OnInit {
  private readonly planService = inject(TenantPlanService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly plans = signal<SubscriptionPlanDto[]>([]);

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.loading.set(true);
    this.planService.getAll().subscribe({
      next: (data) => { this.plans.set(data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openAddDialog(): void {
    const ref = this.dialog.open(PlanFormDialogComponent, {
      width: '560px',
      disableClose: true,
      data: { mode: 'create' },
    });
    ref.afterClosed().subscribe((result: CreateSubscriptionPlanRequest | undefined) => {
      if (!result) return;
      this.planService.create(result).subscribe(() => this.loadPlans());
    });
  }

  openEditDialog(plan: SubscriptionPlanDto): void {
    const ref = this.dialog.open(PlanFormDialogComponent, {
      width: '560px',
      disableClose: true,
      data: { mode: 'edit', plan },
    });
    ref.afterClosed().subscribe((result: UpdateSubscriptionPlanRequest | undefined) => {
      if (!result || plan.id == null) return;
      this.planService.update(plan.id, result).subscribe(() => this.loadPlans());
    });
  }

  confirmDelete(plan: SubscriptionPlanDto): void {
    const ref = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '400px',
      disableClose: true,
      data: { planName: plan.name },
    });
    ref.afterClosed().subscribe((confirmed: boolean | undefined) => {
      if (confirmed && plan.id != null) {
        this.planService.delete(plan.id).subscribe(() => this.loadPlans());
      }
    });
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-plan-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add Plan' : 'Edit Plan' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        @if (data.mode === 'create') {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Code</mat-label>
            <input matInput formControlName="code" placeholder="e.g. TENANT_PREMIUM" />
            @if (form.get('code')?.hasError('required') && form.get('code')?.touched) {
              <mat-error>Required</mat-error>
            }
          </mat-form-field>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="e.g. Premium Monthly" />
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="2" placeholder="Plan description"></textarea>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Price</mat-label>
            <input matInput type="number" formControlName="price" placeholder="0" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Duration (months)</mat-label>
            <input matInput type="number" formControlName="durationMonths" placeholder="1" />
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Currency</mat-label>
            <input matInput formControlName="currency" placeholder="INR" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Display order</mat-label>
            <input matInput type="number" formControlName="displayOrder" placeholder="0" />
          </mat-form-field>
        </div>

        <div class="checkbox-row">
          <mat-checkbox formControlName="isPopular" color="primary">Popular</mat-checkbox>
          <mat-checkbox formControlName="isActive" color="primary">Active</mat-checkbox>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="submit()">
        {{ data.mode === 'create' ? 'Create' : 'Update' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 4px; }
    .half-width { width: 48%; }
    .form-row { display: flex; gap: 4%; }
    .checkbox-row { margin: 12px 0; display: flex; gap: 24px; }
    mat-dialog-content { min-width: 500px; padding-top: 16px !important; }
  `],
})
export class PlanFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<PlanFormDialogComponent>);
  readonly data = inject<{ mode: 'create' | 'edit'; plan?: SubscriptionPlanDto }>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    code: [this.data.plan?.code ?? '', this.data.mode === 'create' ? [Validators.required] : []],
    name: [this.data.plan?.name ?? '', [Validators.required]],
    description: [this.data.plan?.description ?? ''],
    price: [this.data.plan?.price ?? null as number | null],
    durationMonths: [this.data.plan?.durationMonths ?? null as number | null],
    currency: [this.data.plan?.currency ?? 'INR'],
    displayOrder: [this.data.plan?.displayOrder ?? 0],
    isPopular: [this.data.plan?.isPopular ?? false],
    isActive: [this.data.plan?.isActive ?? true],
  });

  submit(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    this.dialogRef.close({
      code: raw.code || undefined,
      name: raw.name,
      description: raw.description || undefined,
      price: raw.price ?? undefined,
      durationMonths: raw.durationMonths ?? undefined,
      currency: raw.currency || undefined,
      displayOrder: raw.displayOrder ?? undefined,
      isPopular: raw.isPopular,
      isActive: raw.isActive,
    });
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Delete Plan</h2>
    <mat-dialog-content>
      <p>Are you sure you want to delete <strong>{{ data.planName }}</strong>? This action cannot be undone.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `,
})
export class DeleteConfirmDialogComponent {
  readonly data = inject<{ planName: string }>(MAT_DIALOG_DATA);
}
