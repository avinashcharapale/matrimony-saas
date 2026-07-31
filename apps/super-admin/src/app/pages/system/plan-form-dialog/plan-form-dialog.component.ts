import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SubscriptionPlanDto, SubscriptionClient, TenantFeatureValueDto, FeatureValueRequest } from '@org/generated';

export interface PlanFormDialogData {
  mode: 'create' | 'edit';
  plan?: SubscriptionPlanDto;
}

export interface PlanFormResult {
  code: string;
  name: string;
  description?: string;
  price: number;
  durationMonths: number;
  currency: string;
  displayOrder: number;
  isPopular: boolean;
  isActive: boolean;
  tenantFeatures: FeatureValueRequest[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-plan-form-dialog',
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
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add Plan' : 'Edit Plan' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        @if (data.mode === 'create') {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Code</mat-label>
            <input matInput formControlName="code" placeholder="e.g. BASIC, PREMIUM" />
            @if (form.get('code')?.hasError('required') && form.get('code')?.touched) {
              <mat-error>Required</mat-error>
            }
          </mat-form-field>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Plan name" />
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>Required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="2" placeholder="Optional description"></textarea>
        </mat-form-field>

        <div class="field-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Price</mat-label>
            <input matInput type="number" formControlName="price" step="0.01" min="0" placeholder="0.00" />
            @if (form.get('price')?.hasError('required') && form.get('price')?.touched) {
              <mat-error>Required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Currency</mat-label>
            <input matInput formControlName="currency" placeholder="USD" />
          </mat-form-field>
        </div>

        <div class="field-row">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Duration (months)</mat-label>
            <input matInput type="number" formControlName="durationMonths" min="1" placeholder="1" />
            @if (form.get('durationMonths')?.hasError('required') && form.get('durationMonths')?.touched) {
              <mat-error>Required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Display Order</mat-label>
            <input matInput type="number" formControlName="displayOrder" min="0" placeholder="0" />
          </mat-form-field>
        </div>

        <div class="toggle-row">
          <mat-slide-toggle [checked]="isPopularValue()" (click)="isPopularValue.set(!isPopularValue())" color="primary">{{ isPopularValue() ? 'Popular' : 'Not Popular' }}</mat-slide-toggle>
          <mat-slide-toggle [checked]="isActiveValue()" (click)="isActiveValue.set(!isActiveValue())" color="primary">{{ isActiveValue() ? 'Active' : 'Inactive' }}</mat-slide-toggle>
        </div>

        <h3 class="section-title">Tenant Features</h3>
        <div class="tenant-features" formArrayName="tenantFeatures">
          @for (ctrl of tenantFeaturesArray.controls; track ctrl.value.featureCode) {
            <div class="tf-row" [formGroupName]="$index">
              <span class="tf-label">{{ ctrl.value.featureCode }}</span>
              @if (ctrl.value.hasLimit) {
                <mat-form-field appearance="outline" class="tf-input">
                  <input matInput type="number" min="0" formControlName="value" placeholder="Value" />
                </mat-form-field>
              } @else {
                <mat-slide-toggle formControlName="value" color="primary" class="tf-toggle"
                  >{{ ctrl.value.value === 'true' ? 'Enabled' : 'Disabled' }}</mat-slide-toggle
                >
              }
            </div>
          }
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
    .field-row {
      display: flex;
      gap: 12px;
    }
    .flex-1 {
      flex: 1;
    }
    .toggle-row {
      display: flex;
      gap: 24px;
      margin: 12px 0;
    }
    mat-dialog-content {
      min-width: 480px;
    }
    .section-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: #2c003e;
      margin: 1rem 0 0.5rem;
      padding-top: 0.75rem;
      border-top: 1px solid #eee;
    }
    .tenant-features {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .tf-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 4px 0;
    }
    .tf-label {
      width: 140px;
      font-size: 0.8125rem;
      color: #555;
      font-weight: 500;
      flex-shrink: 0;
    }
    .tf-input {
      flex: 1;
      margin-bottom: 0;
    }
    .tf-toggle {
      flex-shrink: 0;
    }
  `],
})
export class PlanFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<PlanFormDialogComponent, PlanFormResult>);
  private readonly subscriptionClient = inject(SubscriptionClient);
  readonly data = inject<PlanFormDialogData>(MAT_DIALOG_DATA);

  readonly isPopularValue = signal(this.data.plan?.isPopular ?? false);
  readonly isActiveValue = signal(this.data.plan?.isActive ?? true);
  readonly tenantFeatureDefs = signal<TenantFeatureValueDto[]>([]);

  readonly form = this.fb.nonNullable.group({
    code: [this.data.plan?.code ?? '', Validators.required],
    name: [this.data.plan?.name ?? '', Validators.required],
    description: [this.data.plan?.description ?? ''],
    price: [this.data.plan?.price ?? 0, [Validators.required, Validators.min(0)]],
    durationMonths: [this.data.plan?.durationMonths ?? 1, [Validators.required, Validators.min(1)]],
    currency: [this.data.plan?.currency ?? 'USD'],
    displayOrder: [this.data.plan?.displayOrder ?? 0],
    isPopular: [this.data.plan?.isPopular ?? false],
    isActive: [this.data.plan?.isActive ?? true],
    tenantFeatures: this.fb.array<ReturnType<typeof this.createFeatureControl>>([]),
  });

  get tenantFeaturesArray(): FormArray {
    return this.form.get('tenantFeatures') as FormArray;
  }

  private createFeatureControl(def: TenantFeatureValueDto) {
    const existing = this.data.plan?.tenantFeatures?.find(f => f.featureCode === def.featureCode);
    return this.fb.group({
      featureDefinitionId: [def.featureDefinitionId],
      featureCode: [def.featureCode],
      hasLimit: [def.hasLimit],
      limitType: [def.limitType],
      value: [existing?.value ?? (def.hasLimit ? '0' : 'false')],
    });
  }

  ngOnInit(): void {
    this.subscriptionClient.getAllTenantFeatureDefinitions().subscribe(defs => {
      this.tenantFeatureDefs.set(defs ?? []);
      const array = this.tenantFeaturesArray;
      array.clear();
      for (const def of defs ?? []) {
        array.push(this.createFeatureControl(def));
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    const tenantFeatures: FeatureValueRequest[] = val.tenantFeatures.map((f: any) => ({
      featureCode: f.featureCode,
      value: String(f.value),
    }));
    const dto: PlanFormResult = {
      code: val.code,
      name: val.name,
      description: val.description || undefined,
      price: val.price,
      durationMonths: val.durationMonths,
      currency: val.currency,
      displayOrder: val.displayOrder,
      isPopular: this.isPopularValue(),
      isActive: this.isActiveValue(),
      tenantFeatures,
    };
    this.dialogRef.close(dto);
  }
}
