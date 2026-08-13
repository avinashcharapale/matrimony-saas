import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { SubscriptionClient, SubscriptionFeatureDto } from '@org/generated';
import {
  UserSubscriptionPlanService,
  UserSubscriptionPlanDto,
  CreateUserSubscriptionPlanRequest,
  UpdateUserSubscriptionPlanRequest,
} from '../../services/user-subscription-plan.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-user-subscription-plans',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, PageHeaderComponent, StatusBadgeComponent,
    MatCardModule, MatIconModule, MatProgressSpinnerModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule, MatSelectModule,
  ],
  template: `
    <div class="plans-page">
      <ui-page-header
        title="User Subscription Plans"
        subtitle="Create and manage subscription plans for users"
      />

      <div class="header-actions">
        <button mat-flat-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon>
          Add Plan
        </button>
      </div>

      <div class="filter-bar">
        <button
          class="filter-btn"
          [class.filter-btn--active]="viewFilter() === 'all'"
          (click)="viewFilter.set('all')"
        >All</button>
        <button
          class="filter-btn"
          [class.filter-btn--active]="viewFilter() === 'active'"
          (click)="viewFilter.set('active')"
        >Active</button>
        <button
          class="filter-btn"
          [class.filter-btn--active]="viewFilter() === 'inactive'"
          (click)="viewFilter.set('inactive')"
        >Inactive</button>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading plans...</span>
        </div>
      } @else if (plans().length === 0) {
        <div class="empty-state">
          <mat-icon>inventory_2</mat-icon>
          <span>No subscription plans found</span>
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
                <th>Features</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (plan of visiblePlans(); track plan.id) {
                <tr [class.row-inactive]="!plan.isActive">
                  <td class="cell-code">{{ plan.code }}</td>
                  <td class="cell-bold">{{ plan.name }}</td>
                  <td class="cell-price">{{ plan.price != null ? (plan.currency ?? 'INR') + ' ' + plan.price : '-' }}</td>
                  <td class="cell-center">{{ plan.durationMonths != null ? plan.durationMonths + ' month' + (plan.durationMonths === 1 ? '' : 's') : '-' }}</td>
                  <td class="cell-center">{{ plan.currency ?? 'INR' }}</td>
                  <td class="cell-center">
                    <ui-status-badge [status]="plan.isActive ? 'Active' : 'Inactive'"></ui-status-badge>
                  </td>
                  <td class="cell-center">
                    @if (plan.features?.length) {
                      <button mat-icon-button title="View features" (click)="toggleFeatures(plan.id)">
                        <mat-icon>{{ expandedId() === plan.id ? 'expand_less' : 'expand_more' }}</mat-icon>
                      </button>
                      <span class="feature-count">{{ plan.features?.length }}</span>
                    } @else {
                      <span class="cell-muted">—</span>
                    }
                  </td>
                  <td class="cell-actions">
                    @if (!plan.isActive) {
                      <button mat-icon-button color="primary" title="Reactivate" (click)="reactivate(plan)">
                        <mat-icon>restore</mat-icon>
                      </button>
                    }
                    <button mat-icon-button color="primary" title="Edit" (click)="openEditDialog(plan)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" title="Delete" (click)="confirmDelete(plan)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </tr>
                @if (expandedId() === plan.id) {
                  <tr class="features-row">
                    <td colspan="8">
                      <div class="feature-chips">
                        @for (f of plan.features; track f.code) {
                          <span class="feature-chip">
                            {{ f.name || f.code }}: <strong>{{ f.value }}</strong>
                          </span>
                        }
                      </div>
                    </td>
                  </tr>
                }
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
    .filter-bar { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
    .filter-btn {
      padding: 0.375rem 1rem; border: 1px solid #ddd; border-radius: 9999px;
      background: white; color: #555; font-size: 0.8125rem; font-weight: 500;
      cursor: pointer;
    }
    .filter-btn:hover { border-color: #1976d2; color: #1976d2; }
    .filter-btn--active { background: #1976d2; border-color: #1976d2; color: white; }
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
    .plans-table tbody tr.row-inactive td { color: #9e9e9e; background: #fafafa; }
    .plans-table tbody tr.row-inactive .cell-price { color: #9e9e9e; }
    .plans-table tbody tr.row-inactive .cell-code { color: #9e9e9e; }
    .cell-code { font-family: monospace; color: #1976d2; font-weight: 600; }
    .cell-bold { font-weight: 500; }
    .cell-center { text-align: center; }
    .cell-price { font-weight: 600; color: #2e7d32; }
    .cell-actions { text-align: right; white-space: nowrap; }
    .cell-muted { color: #bdbdbd; }
    .feature-count {
      display: inline-block; min-width: 20px; padding: 1px 6px; border-radius: 10px;
      background: #e3f2fd; color: #1976d2; font-size: 0.75rem; font-weight: 600;
      text-align: center; margin-left: 4px;
    }
    .features-row td { padding: 0.75rem 1rem !important; background: #fafafa; }
    .feature-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .feature-chip {
      padding: 0.25rem 0.625rem; background: #e3f2fd; color: #1976d2;
      border-radius: 12px; font-size: 0.8125rem;
    }
    .feature-chip strong { font-weight: 600; }
  `],
})
export class UserSubscriptionPlans implements OnInit {
  private readonly planService = inject(UserSubscriptionPlanService);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly plans = signal<UserSubscriptionPlanDto[]>([]);
  readonly expandedId = signal<number | null>(null);
  readonly viewFilter = signal<'all' | 'active' | 'inactive'>('all');

  readonly visiblePlans = computed(() => {
    const filter = this.viewFilter();
    return this.plans().filter(p =>
      filter === 'all' ? true : filter === 'active' ? p.isActive : !p.isActive);
  });

  toggleFeatures(planId: number | undefined): void {
    this.expandedId.update(id => (id === planId ? null : (planId ?? null)));
  }

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
      width: '520px',
      disableClose: true,
      data: { mode: 'create' },
    });
    ref.afterClosed().subscribe((result: CreateUserSubscriptionPlanRequest | undefined) => {
      if (!result) return;
      this.planService.create(result).subscribe(() => this.loadPlans());
    });
  }

  openEditDialog(plan: UserSubscriptionPlanDto): void {
    const ref = this.dialog.open(PlanFormDialogComponent, {
      width: '520px',
      disableClose: true,
      data: { mode: 'edit', plan },
    });
    ref.afterClosed().subscribe((result: UpdateUserSubscriptionPlanRequest | undefined) => {
      if (!result || plan.id == null) return;
      this.planService.update(plan.id, result).subscribe(() => this.loadPlans());
    });
  }

  confirmDelete(plan: UserSubscriptionPlanDto): void {
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

  reactivate(plan: UserSubscriptionPlanDto): void {
    if (plan.id == null) return;
    this.planService.update(plan.id, { isActive: true }).subscribe(() => this.loadPlans());
  }
}

interface PlanFeatureRow {
  code: string;
  name: string;
  category: string;
  dataType: string;
  value: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-plan-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add Plan' : 'Edit Plan' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        @if (data.mode === 'create') {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Code</mat-label>
            <input matInput formControlName="code" placeholder="e.g. BASIC_MONTHLY" />
            @if (form.get('code')?.hasError('required') && form.get('code')?.touched) {
              <mat-error>Required</mat-error>
            }
          </mat-form-field>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="e.g. Basic Monthly" />
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

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Currency</mat-label>
          <input matInput formControlName="currency" placeholder="INR" />
        </mat-form-field>

        <div class="checkbox-row">
          <mat-checkbox formControlName="isActive" color="primary">Active</mat-checkbox>
        </div>

        <div class="features-editor">
          <div class="features-header">
            <span class="features-title">Plan Features</span>
            <mat-form-field appearance="outline" class="add-feature">
              <mat-label>Add feature</mat-label>
              <mat-select
                [value]="addFeatureSelection()"
                (selectionChange)="onAddFeature($event.value)"
              >
                @for (group of catalogGroups(); track group.category) {
                  <mat-optgroup [label]="group.category">
                    @for (f of group.items; track f.code) {
                      <mat-option [value]="f">{{ f.name || f.code }}</mat-option>
                    }
                  </mat-optgroup>
                }
              </mat-select>
            </mat-form-field>
          </div>

          @if (features().length === 0) {
            <div class="features-empty">No features selected yet.</div>
          } @else {
            <div class="feature-list">
              @for (f of features(); track f.code; let i = $index) {
                <div class="feature-row">
                  <span class="feature-name" [title]="f.code">{{ f.name || f.code }}</span>
                  @if (f.dataType === 'bool') {
                    <mat-checkbox
                      color="primary"
                      [checked]="f.value === 'true'"
                      (change)="setFeatureBool(i, $event.checked)"
                    >Enabled</mat-checkbox>
                  } @else if (f.dataType === 'int') {
                    <input
                      class="feature-value"
                      type="number"
                      placeholder="0"
                      [value]="f.value"
                      (input)="onFeatureValueInput(i, $event)"
                    />
                  } @else {
                    <input
                      class="feature-value"
                      type="text"
                      placeholder="Value"
                      [value]="f.value"
                      (input)="onFeatureValueInput(i, $event)"
                    />
                  }
                  <button mat-icon-button color="warn" title="Remove" (click)="removeFeature(i)">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
              }
            </div>
          }
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
    .checkbox-row { margin: 12px 0; }
    mat-dialog-content { min-width: 460px; padding-top: 16px !important; }
    .features-editor {
      border: 1px solid #eee; border-radius: 8px; padding: 0.75rem;
      margin-top: 0.5rem;
    }
    .features-header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; margin-bottom: 0.5rem;
    }
    .features-title { font-size: 0.875rem; font-weight: 600; color: #333; }
    .add-feature { width: 200px; margin-bottom: -1.25em; }
    .features-empty { font-size: 0.8125rem; color: #9e9e9e; padding: 0.25rem 0; }
    .feature-list { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; }
    .feature-row {
      display: flex; align-items: center; gap: 8px;
      background: #fafafa; border: 1px solid #f0f0f0; border-radius: 6px;
      padding: 0.25rem 0.5rem;
    }
    .feature-name { flex: 1; font-size: 0.8125rem; font-weight: 500; color: #424242; }
    .feature-value {
      width: 110px; padding: 0.4rem 0.5rem; border: 1px solid #ddd;
      border-radius: 6px; font-size: 0.8125rem; outline: none;
    }
    .feature-value:focus { border-color: #1976d2; }
  `],
})
export class PlanFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<PlanFormDialogComponent>);
  private readonly subscriptionClient = inject(SubscriptionClient);
  readonly data = inject<{ mode: 'create' | 'edit'; plan?: UserSubscriptionPlanDto }>(MAT_DIALOG_DATA);

  readonly catalog = signal<SubscriptionFeatureDto[]>([]);
  readonly features = signal<PlanFeatureRow[]>([]);
  readonly addFeatureSelection = signal<SubscriptionFeatureDto | null>(null);

  readonly form = this.fb.nonNullable.group({
    code: [this.data.plan?.code ?? '', this.data.mode === 'create' ? [Validators.required] : []],
    name: [this.data.plan?.name ?? '', [Validators.required]],
    description: [this.data.plan?.description ?? ''],
    price: [this.data.plan?.price ?? null as number | null],
    durationMonths: [this.data.plan?.durationMonths ?? null as number | null],
    currency: [this.data.plan?.currency ?? 'INR'],
    isActive: [this.data.plan?.isActive ?? true],
  });

  readonly availableFeatures = computed(() => {
    const used = new Set(this.features().map(f => f.code));
    return this.catalog().filter(f => !used.has(f.code ?? ''));
  });

  readonly catalogGroups = computed(() => {
    const groups = new Map<string, SubscriptionFeatureDto[]>();
    for (const f of this.availableFeatures()) {
      const category = f.category || 'General';
      const list = groups.get(category) ?? [];
      list.push(f);
      groups.set(category, list);
    }
    return [...groups.entries()].map(([category, items]) => ({ category, items }));
  });

  ngOnInit(): void {
    this.features.set((this.data.plan?.features ?? []).map(f => ({
      code: f.code ?? '',
      name: f.name ?? '',
      category: f.category ?? '',
      dataType: f.dataType ?? '',
      value: f.value ?? '',
    })));
    this.subscriptionClient.getAllTenantOwnFeatures().subscribe({
      next: (catalog) => this.catalog.set(catalog ?? []),
    });
  }

  onAddFeature(feature: SubscriptionFeatureDto | null): void {
    if (feature?.code) {
      this.features.update(list => [
        ...list,
        {
          code: feature.code!,
          name: feature.name ?? feature.code!,
          category: feature.category ?? '',
          dataType: feature.dataType ?? '',
          value: feature.defaultValue ?? '',
        },
      ]);
    }
    this.addFeatureSelection.set(null);
  }

  removeFeature(index: number): void {
    this.features.update(list => list.filter((_, i) => i !== index));
  }

  setFeatureValue(index: number, value: string): void {
    this.features.update(list => list.map((f, i) => (i === index ? { ...f, value } : f)));
  }

  onFeatureValueInput(index: number, event: Event): void {
    this.setFeatureValue(index, (event.target as HTMLInputElement).value);
  }

  setFeatureBool(index: number, checked: boolean): void {
    this.features.update(list => list.map((f, i) => (i === index ? { ...f, value: checked ? 'true' : 'false' } : f)));
  }

  submit(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const features = this.features()
      .filter(f => f.code && f.value !== '')
      .map(f => ({ featureCode: f.code, value: f.value }));
    this.dialogRef.close({
      code: raw.code || undefined,
      name: raw.name,
      description: raw.description || undefined,
      price: raw.price ?? undefined,
      durationMonths: raw.durationMonths ?? undefined,
      currency: raw.currency || undefined,
      isActive: raw.isActive,
      features,
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