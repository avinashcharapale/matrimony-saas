import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SubscriptionClient, SubscriptionFeatureDto, SubscriptionFeatureCategoryDto, CreateSubscriptionFeatureRequest } from '@org/generated';
import { createSort, createPagination } from '@org/shared-ui';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-features',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatCheckboxModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Feature Catalog</h1>
          <p class="subtitle">Manage the shared feature catalog used by user subscription plans. Global features are editable; tenant-created features are shown read-only.</p>
        </div>
        <button mat-flat-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon>
          Add Feature
        </button>
      </div>

      @if (loading()) {
        <div class="loading-state">Loading features...</div>
      } @else if (features().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">F</div>
          <p>No features in the catalog.</p>
        </div>
      } @else {
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th class="sortable" (click)="sort.toggleSort('code')">Code <mat-icon class="sort-icon">{{ sort.sortIcon('code') }}</mat-icon></th>
                <th class="sortable" (click)="sort.toggleSort('name')">Name <mat-icon class="sort-icon">{{ sort.sortIcon('name') }}</mat-icon></th>
                <th class="sortable" (click)="sort.toggleSort('category')">Category <mat-icon class="sort-icon">{{ sort.sortIcon('category') }}</mat-icon></th>
                <th class="sortable" (click)="sort.toggleSort('dataType')">Data Type <mat-icon class="sort-icon">{{ sort.sortIcon('dataType') }}</mat-icon></th>
                <th class="sortable" (click)="sort.toggleSort('defaultValue')">Default <mat-icon class="sort-icon">{{ sort.sortIcon('defaultValue') }}</mat-icon></th>
                <th>Scope</th>
                <th class="sortable" (click)="sort.toggleSort('isActive')">Status <mat-icon class="sort-icon">{{ sort.sortIcon('isActive') }}</mat-icon></th>
              </tr>
            </thead>
            <tbody>
              @for (feature of pagination.paginated(); track feature.id) {
                <tr>
                  <td class="cell-code">{{ feature.code }}</td>
                  <td class="cell-bold">{{ feature.name }}</td>
                  <td>{{ feature.category }}</td>
                  <td class="cell-center">{{ feature.dataType }}</td>
                  <td class="cell-center">{{ feature.defaultValue ?? '—' }}</td>
                  <td class="cell-center">
                    <span class="badge" [class.tenant]="feature.tenantId != null">
                      {{ feature.tenantId != null ? 'Tenant' : 'Global' }}
                    </span>
                  </td>
                  <td class="cell-center">
                    <span class="badge" [class.active]="feature.isActive" [class.inactive]="!feature.isActive">
                      {{ feature.isActive ? 'Active' : 'Inactive' }}
                    </span>
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
    .page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.5rem; color: #2c003e; margin-bottom: 0.25rem; }
    .subtitle { color: #666; font-size: 0.875rem; }
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
    .cell-code { font-family: monospace; color: #7b1fa2; font-weight: 600; }
    .cell-bold { font-weight: 500; }
    .cell-center { text-align: center; }
    .badge {
      display: inline-block; padding: 0.2rem 0.625rem; border-radius: 12px;
      font-size: 0.75rem; font-weight: 600;
    }
    .badge.active { background: #e8f5e9; color: #2e7d32; }
    .badge.inactive { background: #fbe9e7; color: #c62828; }
    .badge.tenant { background: #fff3e0; color: #e65100; }
    .sortable { cursor: pointer; user-select: none; }
    .sortable:hover { background: #f0ecf3; }
    .sort-icon { font-size: 1rem; width: 1rem; height: 1rem; vertical-align: middle; line-height: 1; }
  `],
})
export class Features implements OnInit {
  private readonly subscriptionClient = inject(SubscriptionClient);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly features = signal<SubscriptionFeatureDto[]>([]);
  readonly categories = signal<SubscriptionFeatureCategoryDto[]>([]);
  readonly errorMessage = signal('');

  readonly sort = createSort();

  readonly sorted = computed(() => {
    const col = this.sort.sortColumn();
    if (!col) return this.features();
    const dir = this.sort.sortDirection();
    const data = [...this.features()];
    data.sort((a, b) => {
      let cmp = 0;
      switch (col) {
        case 'code': cmp = (a.code ?? '').localeCompare(b.code ?? ''); break;
        case 'name': cmp = (a.name ?? '').localeCompare(b.name ?? ''); break;
        case 'category': cmp = (a.category ?? '').localeCompare(b.category ?? ''); break;
        case 'dataType': cmp = (a.dataType ?? '').localeCompare(b.dataType ?? ''); break;
        case 'defaultValue': cmp = (a.defaultValue ?? '').localeCompare(b.defaultValue ?? ''); break;
        case 'isActive': cmp = (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0); break;
      }
      return dir === 'asc' ? cmp : -cmp;
    });
    return data;
  });

  readonly pagination = createPagination(this.sorted);

  ngOnInit(): void {
    this.loadFeatures();
    this.loadCategories();
  }

  loadFeatures(): void {
    this.loading.set(true);
    this.subscriptionClient.getAllSubscriptionFeaturesIncludingTenant().subscribe({
      next: (data) => {
        this.features.set(data ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadCategories(): void {
    this.subscriptionClient.getAllSubscriptionFeatureCategories().subscribe({
      next: (data) => this.categories.set(data ?? []),
      error: () => this.categories.set([]),
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(FeatureFormDialogComponent, {
      width: '480px',
      disableClose: true,
      data: { categories: this.categories() },
    });

    dialogRef.afterClosed().subscribe((result: CreateSubscriptionFeatureRequest | undefined) => {
      if (!result) return;
      this.subscriptionClient.createSubscriptionFeature(result).subscribe({
        next: () => this.loadFeatures(),
        error: (err) => {
          this.errorMessage.set(err.error?.error ?? 'Failed to create feature.');
        },
      });
    });
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-feature-form-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatCheckboxModule,
  ],
  template: `
    <h2 mat-dialog-title>Add Feature</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Code</mat-label>
          <input matInput formControlName="code" placeholder="e.g. ProfileBadge" />
          @if (form.get('code')?.hasError('required') && form.get('code')?.touched) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="e.g. Profile Badge" />
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="2" placeholder="Optional description"></textarea>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Category</mat-label>
            <mat-select formControlName="category">
              @for (cat of categories(); track cat.categoryCode) {
                <mat-option [value]="cat.categoryCode">
                  {{ cat.categoryName !== cat.categoryCode ? cat.categoryName + ' (' + cat.categoryCode + ')' : cat.categoryName }}
                </mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Data Type</mat-label>
            <mat-select formControlName="dataType">
              <mat-option value="bool">bool</mat-option>
              <mat-option value="int">int</mat-option>
              <mat-option value="decimal">decimal</mat-option>
              <mat-option value="string">string</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Default Value</mat-label>
          <input matInput formControlName="defaultValue" placeholder="e.g. false or 0" />
        </mat-form-field>

        <div class="checkbox-row">
          <mat-checkbox formControlName="isActive" color="primary">Active</mat-checkbox>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="submit()">Create</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 4px; }
    .half-width { width: 48%; }
    .form-row { display: flex; gap: 4%; }
    .checkbox-row { margin: 12px 0; }
    mat-dialog-content { min-width: 420px; padding-top: 16px !important; }
  `],
})
export class FeatureFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<FeatureFormDialogComponent>);

  readonly categories = signal<SubscriptionFeatureCategoryDto[]>(inject<{ categories: SubscriptionFeatureCategoryDto[] }>(MAT_DIALOG_DATA).categories ?? []);

  readonly form = this.fb.nonNullable.group({
    code: ['', [Validators.required]],
    name: ['', [Validators.required]],
    description: [''],
    category: ['Capabilities'],
    dataType: ['bool'],
    defaultValue: ['false'],
    isActive: [true],
  });

  submit(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    this.dialogRef.close({
      code: raw.code,
      name: raw.name,
      description: raw.description || undefined,
      category: raw.category,
      dataType: raw.dataType,
      defaultValue: raw.defaultValue || undefined,
      isActive: raw.isActive,
    });
  }
}
