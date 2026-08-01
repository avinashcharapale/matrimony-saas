import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PageHeaderComponent, StatusBadgeComponent } from '@org/shared-ui';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TenantClient, MasterCategoryDto, TenantMasterDataDto, CreateMasterCategoryRequest, UpdateMasterCategoryRequest } from '@org/generated';
import { NotificationService } from '@org/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-master-data',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, PageHeaderComponent, StatusBadgeComponent,
    MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule,
  ],
  template: `
    <div class="master-data-page">
      <ui-page-header title="Master Data" subtitle="Manage categories and tenant master data options">
        <div class="header-actions">
          <button mat-stroked-button color="primary" (click)="loadAll()">
            <mat-icon>refresh</mat-icon>
            Refresh
          </button>
          <button mat-flat-button color="primary" (click)="openCategoryDialog()">
            <mat-icon>add</mat-icon>
            Add Category
          </button>
        </div>
      </ui-page-header>

      <div class="grid">
        <section class="panel">
          <div class="panel-header">
            <h3>Categories</h3>
            <span class="panel-count">{{ categories().length }}</span>
          </div>

          @if (loadingCategories()) {
            <div class="loading-inline">
              <mat-spinner diameter="24"></mat-spinner>
            </div>
          } @else if (categories().length === 0) {
            <div class="panel-empty">No categories</div>
          } @else {
            <div class="category-list">
              @for (cat of categories(); track cat.masterCategoryId) {
                <div class="category-row" [class.category-row--active]="cat.isActive">
                  <div class="category-info">
                    <span class="category-name">{{ cat.categoryName }}</span>
                    <span class="category-code">{{ cat.categoryCode }}</span>
                  </div>
                  <div class="category-actions">
                    <ui-status-badge [status]="cat.isActive ? 'Active' : 'Inactive'"></ui-status-badge>
                    <button mat-icon-button color="primary" title="Edit" (click)="openCategoryDialog(cat)">
                      <mat-icon>edit</mat-icon>
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </section>

        <section class="panel">
          <div class="panel-header">
            <h3>Tenant Master Data</h3>
            <mat-form-field appearance="outline" class="category-filter">
              <mat-label>Filter by category</mat-label>
              <mat-select [value]="selectedCategoryId()" (selectionChange)="onCategoryFilter($event.value)">
                <mat-option [value]="undefined">All categories</mat-option>
                @for (cat of categories(); track cat.masterCategoryId) {
                  <mat-option [value]="cat.masterCategoryId">{{ cat.categoryName }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          @if (loadingItems()) {
            <div class="loading-inline">
              <mat-spinner diameter="24"></mat-spinner>
            </div>
          } @else if (items().length === 0) {
            <div class="panel-empty">No master data items for this tenant</div>
          } @else {
            <div class="items-table-wrap">
              <table class="items-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Category</th>
                    <th>Master</th>
                    <th>Sort</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of items(); track item.tenantMasterDataId) {
                    <tr>
                      <td class="cell-mono">{{ item.masterId }}</td>
                      <td>{{ item.categoryName ?? '—' }}</td>
                      <td class="cell-muted">{{ item.parentMasterId != null ? 'Sub: ' + item.parentMasterId : 'Root' }}</td>
                      <td class="cell-center">{{ item.sortOrder }}</td>
                      <td class="cell-center">
                        <ui-status-badge [status]="item.isEnabled ? 'Active' : 'Inactive'"></ui-status-badge>
                      </td>
                      <td class="cell-actions">
                        <button mat-icon-button color="primary" title="Toggle enabled"
                          (click)="toggleItem(item)">
                          <mat-icon>{{ item.isEnabled ? 'visibility_off' : 'visibility' }}</mat-icon>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>
      </div>
    </div>
  `,
  styles: [`
    .master-data-page { position: relative; }
    .header-actions { display: flex; gap: 8px; }
    .grid {
      display: grid; grid-template-columns: 1fr 1.5fr; gap: 1.5rem; align-items: start;
    }
    @media (max-width: 1100px) { .grid { grid-template-columns: 1fr; } }
    .panel {
      background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      padding: 1.25rem;
    }
    .panel-header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; margin-bottom: 1rem; flex-wrap: wrap;
    }
    .panel-header h3 { margin: 0; font-size: 16px; font-weight: 600; color: #222; }
    .panel-count {
      background: #e3f2fd; color: #1976d2; border-radius: 9999px;
      padding: 1px 10px; font-size: 13px; font-weight: 600;
    }
    .loading-inline {
      display: flex; justify-content: center; padding: 2rem;
    }
    .panel-empty { color: #9e9e9e; text-align: center; padding: 2rem; font-size: 14px; }
    .category-list { display: flex; flex-direction: column; gap: 8px; }
    .category-row {
      display: flex; align-items: center; justify-content: space-between; gap: 10px;
      border: 1px solid #ececec; border-radius: 10px; padding: 0.6rem 0.9rem;
    }
    .category-row--active { border-left: 3px solid #2e7d32; }
    .category-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .category-name { font-weight: 600; font-size: 14px; color: #222; }
    .category-code { font-family: monospace; font-size: 12px; color: #1976d2; }
    .category-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
    .category-filter { min-width: 200px; }
    .items-table-wrap { overflow-x: auto; }
    .items-table { width: 100%; border-collapse: collapse; }
    .items-table th {
      padding: 0.625rem 0.75rem; text-align: left; font-size: 0.72rem; font-weight: 600;
      color: #666; text-transform: uppercase; letter-spacing: 0.5px;
      border-bottom: 2px solid #eee; background: #fafafa;
    }
    .items-table td {
      padding: 0.625rem 0.75rem; font-size: 0.85rem; color: #333;
      border-bottom: 1px solid #f0f0f0;
    }
    .items-table tbody tr:hover { background: #f5f5f5; }
    .cell-mono { font-family: monospace; color: #1976d2; font-weight: 600; }
    .cell-muted { color: #9e9e9e; }
    .cell-center { text-align: center; }
    .cell-actions { text-align: right; white-space: nowrap; }
  `],
})
export class MasterData implements OnInit {
  private readonly tenantClient = inject(TenantClient);
  private readonly dialog = inject(MatDialog);
  private readonly notifications = inject(NotificationService);

  readonly loadingCategories = signal(true);
  readonly loadingItems = signal(true);
  readonly categories = signal<MasterCategoryDto[]>([]);
  readonly items = signal<TenantMasterDataDto[]>([]);
  readonly selectedCategoryId = signal<number | undefined>(undefined);

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loadCategories();
    this.loadItems();
  }

  loadCategories(): void {
    this.loadingCategories.set(true);
    this.tenantClient.getMasterCategories().subscribe({
      next: (data) => { this.categories.set(data ?? []); this.loadingCategories.set(false); },
      error: () => this.loadingCategories.set(false),
    });
  }

  loadItems(): void {
    this.loadingItems.set(true);
    this.tenantClient.getTenantMasterData(this.selectedCategoryId(), undefined, 1, 500).subscribe({
      next: (data) => { this.items.set(data ?? []); this.loadingItems.set(false); },
      error: () => this.loadingItems.set(false),
    });
  }

  onCategoryFilter(categoryId: number | undefined): void {
    this.selectedCategoryId.set(categoryId);
    this.loadItems();
  }

  toggleItem(item: TenantMasterDataDto): void {
    if (item.tenantMasterDataId == null) return;
    this.tenantClient.updateTenantMasterData(item.tenantMasterDataId, { isEnabled: !item.isEnabled })
      .subscribe({
        next: () => {
          this.notifications.success('Master data updated');
          this.loadItems();
        },
        error: () => this.notifications.error('Failed to update master data'),
      });
  }

  openCategoryDialog(category?: MasterCategoryDto): void {
    const ref = this.dialog.open(CategoryDialogComponent, {
      width: '480px',
      disableClose: true,
      data: { mode: category ? 'edit' : 'create', category },
    });
    ref.afterClosed().subscribe((result: CreateMasterCategoryRequest | UpdateMasterCategoryRequest | undefined) => {
      if (!result) return;
      if (category?.masterCategoryId != null) {
        this.tenantClient.updateMasterCategory(category.masterCategoryId, result as UpdateMasterCategoryRequest)
          .subscribe({
            next: () => { this.notifications.success('Category updated'); this.loadCategories(); },
            error: () => this.notifications.error('Failed to update category'),
          });
      } else {
        this.tenantClient.createMasterCategory(result as CreateMasterCategoryRequest)
          .subscribe({
            next: () => { this.notifications.success('Category created'); this.loadCategories(); },
            error: () => this.notifications.error('Failed to create category'),
          });
      }
    });
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-category-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add Category' : 'Edit Category' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        @if (data.mode === 'create') {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Code</mat-label>
            <input matInput formControlName="categoryCode" placeholder="e.g. EDUCATION" />
            @if (form.get('categoryCode')?.hasError('required') && form.get('categoryCode')?.touched) {
              <mat-error>Required</mat-error>
            }
          </mat-form-field>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="categoryName" placeholder="e.g. Education" />
          @if (form.get('categoryName')?.hasError('required') && form.get('categoryName')?.touched) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="2" placeholder="Optional description"></textarea>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Sort Order</mat-label>
            <input matInput type="number" formControlName="sortOrder" />
          </mat-form-field>
        </div>

        <div class="checkbox-row">
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
    .checkbox-row { margin: 12px 0; }
    mat-dialog-content { min-width: 420px; padding-top: 16px !important; }
  `],
})
export class CategoryDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CategoryDialogComponent>);
  readonly data = inject<{ mode: 'create' | 'edit'; category?: MasterCategoryDto }>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    categoryCode: [this.data.category?.categoryCode ?? '', this.data.mode === 'create' ? [Validators.required] : []],
    categoryName: [this.data.category?.categoryName ?? '', [Validators.required]],
    description: [this.data.category?.description ?? ''],
    sortOrder: [this.data.category?.sortOrder ?? 0],
    isActive: [this.data.category?.isActive ?? true],
  });

  submit(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    this.dialogRef.close({
      categoryCode: raw.categoryCode || undefined,
      categoryName: raw.categoryName,
      description: raw.description || undefined,
      sortOrder: raw.sortOrder,
      isActive: raw.isActive,
    });
  }
}
