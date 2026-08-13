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
import { MatSelectModule } from '@angular/material/select';
import { SubscriptionClient, SubscriptionFeatureDto, SubscriptionFeatureCategoryDto, CreateSubscriptionFeatureRequest, UpdateSubscriptionFeatureRequest } from '@org/generated';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-tenant-features',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, PageHeaderComponent, StatusBadgeComponent,
    MatCardModule, MatIconModule, MatProgressSpinnerModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule, MatSelectModule,
  ],
  template: `
    <div class="features-page">
      <ui-page-header
        title="My Features"
        subtitle="Define features for your user subscription plans"
      />

      <div class="header-actions">
        <button mat-flat-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon>
          Add Feature
        </button>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading features...</span>
        </div>
      } @else if (features().length === 0) {
        <div class="empty-state">
          <mat-icon>inventory_2</mat-icon>
          <span>No features found</span>
        </div>
      } @else {
        <div class="table-wrapper">
          <table class="features-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Data Type</th>
                <th>Default</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (feature of features(); track feature.id) {
                <tr>
                  <td class="cell-code">{{ feature.code }}</td>
                  <td class="cell-bold">{{ feature.name }}</td>
                  <td>{{ feature.category }}</td>
                  <td class="cell-center">{{ feature.dataType }}</td>
                  <td class="cell-center">{{ feature.defaultValue ?? '—' }}</td>
                  <td class="cell-center">
                    <ui-status-badge [status]="feature.isActive ? 'Active' : 'Inactive'"></ui-status-badge>
                  </td>
                  <td class="cell-actions">
                    <button mat-icon-button color="primary" title="Edit" (click)="openEditDialog(feature)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" title="Delete" (click)="confirmDelete(feature)">
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
    .features-page { position: relative; }
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
    .features-table { width: 100%; border-collapse: collapse; }
    .features-table th {
      padding: 0.875rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 600;
      color: #666; text-transform: uppercase; letter-spacing: 0.5px;
      border-bottom: 2px solid #eee; background: #fafafa;
    }
    .features-table td {
      padding: 0.875rem 1rem; font-size: 0.875rem; color: #333;
      border-bottom: 1px solid #f0f0f0;
    }
    .features-table tbody tr:hover { background: #f5f5f5; }
    .cell-code { font-family: monospace; color: #1976d2; font-weight: 600; }
    .cell-bold { font-weight: 500; }
    .cell-center { text-align: center; }
    .cell-actions { text-align: right; white-space: nowrap; }
  `],
})
export class TenantFeatures implements OnInit {
  private readonly subscriptionClient = inject(SubscriptionClient);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly features = signal<SubscriptionFeatureDto[]>([]);
  readonly categories = signal<SubscriptionFeatureCategoryDto[]>([]);

  ngOnInit(): void {
    this.loadFeatures();
    this.loadCategories();
  }

  loadCategories(): void {
    this.subscriptionClient.getAllSubscriptionFeatureCategories().subscribe({
      next: (data) => this.categories.set(data ?? []),
      error: () => this.categories.set([]),
    });
  }

  loadFeatures(): void {
    this.loading.set(true);
    this.subscriptionClient.getAllTenantOwnFeatures().subscribe({
      next: (data) => { this.features.set(data ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openAddDialog(): void {
    const ref = this.dialog.open(FeatureFormDialogComponent, {
      width: '520px',
      disableClose: true,
      data: { mode: 'create', categories: this.categories() },
    });
    ref.afterClosed().subscribe((result: CreateSubscriptionFeatureRequest | undefined) => {
      if (!result) return;
      this.subscriptionClient.createTenantOwnFeature(result).subscribe(() => this.loadFeatures());
    });
  }

  openEditDialog(feature: SubscriptionFeatureDto): void {
    const ref = this.dialog.open(FeatureFormDialogComponent, {
      width: '520px',
      disableClose: true,
      data: { mode: 'edit', feature, categories: this.categories() },
    });
    ref.afterClosed().subscribe((result: UpdateSubscriptionFeatureRequest | undefined) => {
      if (!result || feature.id == null) return;
      this.subscriptionClient.updateTenantOwnFeature(feature.id, result).subscribe(() => this.loadFeatures());
    });
  }

  confirmDelete(feature: SubscriptionFeatureDto): void {
    const ref = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '400px',
      disableClose: true,
      data: { featureName: feature.name },
    });
    ref.afterClosed().subscribe((confirmed: boolean | undefined) => {
      if (confirmed && feature.id != null) {
        this.subscriptionClient.deleteTenantOwnFeature(feature.id).subscribe(() => this.loadFeatures());
      }
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
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add Feature' : 'Edit Feature' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        @if (data.mode === 'create') {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Code</mat-label>
            <input matInput formControlName="code" placeholder="e.g. VideoProfiles" />
            @if (form.get('code')?.hasError('required') && form.get('code')?.touched) {
              <mat-error>Required</mat-error>
            }
          </mat-form-field>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="e.g. Video Profiles" />
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
  `],
})
export class FeatureFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<FeatureFormDialogComponent>);
  readonly data = inject<{ mode: 'create' | 'edit'; feature?: SubscriptionFeatureDto; categories?: SubscriptionFeatureCategoryDto[] }>(MAT_DIALOG_DATA);

  readonly categories = signal<SubscriptionFeatureCategoryDto[]>(this.data.categories ?? []);

  readonly form = this.fb.nonNullable.group({
    code: [this.data.feature?.code ?? '', this.data.mode === 'create' ? [Validators.required] : []],
    name: [this.data.feature?.name ?? '', [Validators.required]],
    description: [this.data.feature?.description ?? ''],
    category: [this.data.feature?.category ?? 'Capabilities'],
    dataType: [this.data.feature?.dataType ?? 'bool'],
    defaultValue: [this.data.feature?.defaultValue ?? ''],
    isActive: [this.data.feature?.isActive ?? true],
  });

  submit(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    this.dialogRef.close({
      code: raw.code || undefined,
      name: raw.name,
      description: raw.description || undefined,
      category: raw.category,
      dataType: raw.dataType,
      defaultValue: raw.defaultValue || undefined,
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
    <h2 mat-dialog-title>Delete Feature</h2>
    <mat-dialog-content>
      <p>Are you sure you want to delete <strong>{{ data.featureName }}</strong>? This action cannot be undone.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `,
})
export class DeleteConfirmDialogComponent {
  readonly data = inject<{ featureName: string }>(MAT_DIALOG_DATA);
}
