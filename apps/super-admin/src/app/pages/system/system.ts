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
import {
  SubscriptionClient,
  SubscriptionPlanDto,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
} from '@org/generated';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-system',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Subscription Plans</h1>
          <p class="subtitle">Manage subscription plans available across the platform.</p>
        </div>
        <button class="btn-primary" (click)="openDialog()">
          <span class="btn-icon">+</span> Add Plan
        </button>
      </div>

      @if (loading()) {
        <div class="loading-state">Loading plans...</div>
      } @else if (plans().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">S</div>
          <p>No subscription plans configured.</p>
        </div>
      } @else {
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Price</th>
                <th>Duration (mo)</th>
                <th>Currency</th>
                <th>Popular</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (plan of plans(); track plan.id) {
                <tr>
                  <td class="cell-code">{{ plan.code }}</td>
                  <td class="cell-bold">{{ plan.name }}</td>
                  <td class="cell-price">{{ plan.price ?? 0 | number:'1.2-2' }}</td>
                  <td class="cell-center">{{ plan.durationMonths }}</td>
                  <td class="cell-center">{{ plan.currency ?? 'USD' }}</td>
                  <td class="cell-center">
                    @if (plan.isPopular) {
                      <span class="popular-badge">Popular</span>
                    } @else {
                      <span class="muted">—</span>
                    }
                  </td>
                  <td class="cell-center">
                    <span class="badge" [class.active]="plan.isActive" [class.inactive]="!plan.isActive">
                      {{ plan.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="cell-actions">
                    <button class="btn-icon-sm" title="Edit" (click)="openDialog(plan)">E</button>
                    <button class="btn-icon-sm danger" title="Delete" (click)="confirmDelete(plan)">D</button>
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
              <h2>{{ editingPlan() ? 'Edit Plan' : 'Add Plan' }}</h2>
              <button class="btn-close" (click)="closeDialog()">&times;</button>
            </div>
            <form [formGroup]="planForm" (ngSubmit)="savePlan()">
              <div class="dialog-body">
                @if (!editingPlan()) {
                  <div class="field">
                    <label>Code</label>
                    <input formControlName="code" placeholder="e.g. BASIC, PREMIUM" />
                    @if (planForm.get('code')?.touched && planForm.get('code')?.errors?.['required']) {
                      <span class="field-error">Required</span>
                    }
                  </div>
                }
                <div class="field">
                  <label>Name</label>
                  <input formControlName="name" placeholder="Plan name" />
                  @if (planForm.get('name')?.touched && planForm.get('name')?.errors?.['required']) {
                    <span class="field-error">Required</span>
                  }
                </div>
                <div class="field">
                  <label>Description</label>
                  <textarea formControlName="description" rows="2" placeholder="Optional description"></textarea>
                </div>
                <div class="field-row">
                  <div class="field">
                    <label>Price</label>
                    <input type="number" formControlName="price" step="0.01" min="0" placeholder="0.00" />
                  </div>
                  <div class="field">
                    <label>Currency</label>
                    <input formControlName="currency" placeholder="USD" />
                  </div>
                </div>
                <div class="field-row">
                  <div class="field">
                    <label>Duration (months)</label>
                    <input type="number" formControlName="durationMonths" min="1" placeholder="1" />
                    @if (planForm.get('durationMonths')?.touched && planForm.get('durationMonths')?.errors?.['required']) {
                      <span class="field-error">Required</span>
                    }
                  </div>
                  <div class="field">
                    <label>Display Order</label>
                    <input type="number" formControlName="displayOrder" min="0" placeholder="0" />
                  </div>
                </div>
                <div class="field-row checkboxes">
                  <label class="field-checkbox">
                    <input type="checkbox" formControlName="isPopular" /> Popular
                  </label>
                  <label class="field-checkbox">
                    <input type="checkbox" formControlName="isActive" /> Active
                  </label>
                </div>
              </div>
              @if (dialogError()) {
                <div class="dialog-error">{{ dialogError() }}</div>
              }
              <div class="dialog-footer">
                <button type="button" class="btn-secondary" (click)="closeDialog()">Cancel</button>
                <button type="submit" class="btn-primary" [disabled]="planForm.invalid || saving()">
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
              <p>Are you sure you want to delete plan <strong>{{ deletingPlan()?.name }}</strong>? This action cannot be undone.</p>
            </div>
            @if (deleteError()) {
              <div class="dialog-error">{{ deleteError() }}</div>
            }
            <div class="dialog-footer">
              <button class="btn-secondary" (click)="cancelDelete()">Cancel</button>
              <button class="btn-danger" [disabled]="deleting()" (click)="deletePlan()">
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
    .loading-state { padding: 3rem; text-align: center; color: #888; }
    .empty-state { padding: 3rem; text-align: center; color: #888; }
    .empty-icon {
      width: 48px; height: 48px; background: #fff3e0; color: #e65100; border-radius: 12px;
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
    .cell-price { font-weight: 600; color: #2e7d32; }
    .cell-actions { text-align: right; white-space: nowrap; }
    .muted { color: #ccc; }
    .badge {
      display: inline-block; padding: 0.2rem 0.625rem; border-radius: 12px;
      font-size: 0.75rem; font-weight: 600;
    }
    .badge.active { background: #e8f5e9; color: #2e7d32; }
    .badge.inactive { background: #fbe9e7; color: #c62828; }
    .popular-badge {
      display: inline-block; padding: 0.2rem 0.625rem; border-radius: 12px;
      font-size: 0.75rem; font-weight: 600; background: #fff3e0; color: #e65100;
    }
    .btn-primary {
      padding: 0.625rem 1.25rem; background: #7b1fa2; color: white; border: none;
      border-radius: 6px; font-size: 0.875rem; font-weight: 500; cursor: pointer;
      display: flex; align-items: center; gap: 0.375rem; transition: background 0.2s;
    }
    .btn-primary:hover:not(:disabled) { background: #6a1b9a; }
    .btn-primary:disabled { background: #b39dba; cursor: not-allowed; }
    .btn-secondary {
      padding: 0.625rem 1.25rem; background: white; color: #555; border: 1px solid #ddd;
      border-radius: 6px; font-size: 0.875rem; cursor: pointer;
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
      background: white; border-radius: 12px; width: 100%; max-width: 520px;
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
    .field { margin-bottom: 1rem; flex: 1; }
    .field label { display: block; font-size: 0.875rem; font-weight: 500; color: #333; margin-bottom: 0.375rem; }
    .field input, .field textarea {
      width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #ddd; border-radius: 6px;
      font-size: 0.875rem; outline: none; box-sizing: border-box; font-family: inherit;
    }
    .field input:focus, .field textarea:focus { border-color: #7b1fa2; box-shadow: 0 0 0 3px rgba(123, 31, 162, 0.1); }
    .field-row { display: flex; gap: 1rem; }
    .checkboxes { display: flex; gap: 1.5rem; }
    .field-checkbox { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.875rem; }
    .field-checkbox input[type="checkbox"] { width: auto; }
    .field-error { color: #c62828; font-size: 0.75rem; margin-top: 0.25rem; }
  `],
})
export class System implements OnInit {
  private readonly subscriptionClient = inject(SubscriptionClient);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly plans = signal<SubscriptionPlanDto[]>([]);
  readonly dialogOpen = signal(false);
  readonly deleteDialogOpen = signal(false);
  readonly editingPlan = signal<SubscriptionPlanDto | null>(null);
  readonly deletingPlan = signal<SubscriptionPlanDto | null>(null);
  readonly dialogError = signal<string | null>(null);
  readonly deleteError = signal<string | null>(null);

  readonly planForm = this.fb.nonNullable.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    durationMonths: [1, [Validators.required, Validators.min(1)]],
    currency: ['USD'],
    displayOrder: [0],
    isPopular: [false],
    isActive: [true],
  });

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.loading.set(true);
    this.subscriptionClient.getAllSubscriptionPlansAdmin().subscribe({
      next: (data) => {
        this.plans.set(data);
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  openDialog(plan?: SubscriptionPlanDto): void {
    if (plan) {
      this.editingPlan.set(plan);
      this.planForm.patchValue({
        code: plan.code ?? '',
        name: plan.name ?? '',
        description: plan.description ?? '',
        price: plan.price ?? 0,
        durationMonths: plan.durationMonths ?? 1,
        currency: plan.currency ?? 'USD',
        displayOrder: plan.displayOrder ?? 0,
        isPopular: plan.isPopular ?? false,
        isActive: plan.isActive ?? true,
      });
    } else {
      this.editingPlan.set(null);
      this.planForm.reset({
        code: '',
        name: '',
        description: '',
        price: 0,
        durationMonths: 1,
        currency: 'USD',
        displayOrder: 0,
        isPopular: false,
        isActive: true,
      });
    }
    this.dialogError.set(null);
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
    this.editingPlan.set(null);
    this.dialogError.set(null);
  }

  savePlan(): void {
    if (this.planForm.invalid) return;

    const formValue = this.planForm.getRawValue();
    const editing = this.editingPlan();

    this.saving.set(true);
    this.dialogError.set(null);

    if (editing?.id) {
      const dto: UpdateSubscriptionPlanRequest = {
        name: formValue.name,
        description: formValue.description || undefined,
        price: formValue.price,
        durationMonths: formValue.durationMonths,
        currency: formValue.currency || 'USD',
        displayOrder: formValue.displayOrder,
        isPopular: formValue.isPopular,
        isActive: formValue.isActive,
      };

      this.subscriptionClient.updateSubscriptionPlan(editing.id, dto).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeDialog();
          this.loadPlans();
        },
        error: (err) => {
          this.saving.set(false);
          this.dialogError.set(err?.error?.message ?? err?.error ?? 'Failed to update plan.');
          this.cdr.markForCheck();
        },
      });
    } else {
      const dto: CreateSubscriptionPlanRequest = {
        code: formValue.code,
        name: formValue.name,
        description: formValue.description || undefined,
        price: formValue.price,
        durationMonths: formValue.durationMonths,
        currency: formValue.currency || 'USD',
        displayOrder: formValue.displayOrder,
        isPopular: formValue.isPopular,
        isActive: formValue.isActive,
      };

      this.subscriptionClient.createSubscriptionPlan(dto).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeDialog();
          this.loadPlans();
        },
        error: (err) => {
          this.saving.set(false);
          this.dialogError.set(err?.error?.message ?? err?.error ?? 'Failed to create plan.');
          this.cdr.markForCheck();
        },
      });
    }
  }

  confirmDelete(plan: SubscriptionPlanDto): void {
    this.deletingPlan.set(plan);
    this.deleteError.set(null);
    this.deleteDialogOpen.set(true);
  }

  cancelDelete(): void {
    this.deleteDialogOpen.set(false);
    this.deletingPlan.set(null);
    this.deleteError.set(null);
  }

  deletePlan(): void {
    const plan = this.deletingPlan();
    if (!plan?.id) return;

    this.deleting.set(true);
    this.subscriptionClient.deleteSubscriptionPlan(plan.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.cancelDelete();
        this.loadPlans();
      },
      error: (err) => {
        this.deleting.set(false);
        this.deleteError.set(err?.error?.message ?? err?.error ?? 'Failed to delete plan.');
        this.cdr.markForCheck();
      },
    });
  }
}
