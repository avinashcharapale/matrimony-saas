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
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  SubscriptionClient,
  TenantClient,
  TenantDto,
  SubscriptionPlanDto,
  TenantSubscriptionDto,
  CreateTenantSubscriptionRequest,
  UpdateTenantSubscriptionRequest,
} from '@org/generated';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-tenant-plan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <div class="breadcrumb">
            <a routerLink="/tenants">Tenants</a>
            <span class="sep">/</span>
            <span>Tenant #{{ tenantId() }} Plan</span>
          </div>
          <h1>Tenant Subscription Plan</h1>
          <p class="subtitle">
            @if (tenant(); as t) {
              {{ t.name || t.tenantCode }}
            } @else {
              Loading tenant...
            }
          </p>
        </div>
        <button class="btn-primary" (click)="openAssignDialog()">
          <span class="btn-icon">+</span> Assign Plan
        </button>
      </div>

      @if (loading()) {
        <div class="loading-state">Loading subscription data...</div>
      } @else {
        <section class="card current-subscription">
          <h2>Current Subscription</h2>
          @if (activeSubscription(); as sub) {
            <div class="sub-details">
              <div class="sub-field">
                <span class="sub-label">Plan</span>
                <span class="sub-value">{{ sub.planName }}</span>
              </div>
              <div class="sub-field">
                <span class="sub-label">Start Date</span>
                <span class="sub-value">{{ sub.startDate | date:'mediumDate' }}</span>
              </div>
              <div class="sub-field">
                <span class="sub-label">End Date</span>
                <span class="sub-value">{{ sub.endDate | date:'mediumDate' }}</span>
              </div>
              <div class="sub-field">
                <span class="sub-label">Status</span>
                <span class="badge" [class.active]="sub.isActive" [class.inactive]="!sub.isActive">
                  {{ sub.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
            @if (sub.isActive) {
              <button class="btn-danger" [disabled]="cancelling()" (click)="confirmCancel()">
                @if (cancelling()) { Cancelling... } @else { Cancel Subscription }
              </button>
            }
          } @else {
            <div class="empty-state">
              <div class="empty-icon">P</div>
              <p>No active subscription</p>
            </div>
          }
        </section>

        <section class="card available-plans">
          <h2>Available Plans</h2>
          @if (plans().length === 0) {
            <div class="empty-state">
              <p>No subscription plans available.</p>
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
                    <th>Status</th>
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
                        <span class="badge" [class.active]="plan.isActive" [class.inactive]="!plan.isActive">
                          {{ plan.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>
      }

      @if (assignDialogOpen()) {
        <div class="dialog-overlay" (click)="closeAssignDialog()">
          <div class="dialog" (click)="$event.stopPropagation()">
            <div class="dialog-header">
              <h2>Assign Plan</h2>
              <button class="btn-close" (click)="closeAssignDialog()">&times;</button>
            </div>
            <form [formGroup]="assignForm" (ngSubmit)="assignPlan()">
              <div class="dialog-body">
                <div class="field">
                  <label>Plan</label>
                  <select formControlName="planId">
                    <option value="">-- Select a plan --</option>
                    @for (plan of plans(); track plan.id) {
                      <option [value]="plan.id">{{ plan.name }} ({{ plan.price ?? 0 | number:'1.2-2' }} {{ plan.currency ?? 'USD' }})</option>
                    }
                  </select>
                  @if (assignForm.get('planId')?.touched && assignForm.get('planId')?.errors?.['required']) {
                    <span class="field-error">Required</span>
                  }
                </div>
                <div class="field">
                  <label>Start Date</label>
                  <input type="date" formControlName="startDate" />
                  @if (assignForm.get('startDate')?.touched && assignForm.get('startDate')?.errors?.['required']) {
                    <span class="field-error">Required</span>
                  }
                </div>
                <div class="field">
                  <label>End Date</label>
                  <input type="date" formControlName="endDate" />
                  @if (assignForm.get('endDate')?.touched && assignForm.get('endDate')?.errors?.['required']) {
                    <span class="field-error">Required</span>
                  }
                </div>
              </div>
              @if (dialogError()) {
                <div class="dialog-error">{{ dialogError() }}</div>
              }
              <div class="dialog-footer">
                <button type="button" class="btn-secondary" (click)="closeAssignDialog()">Cancel</button>
                <button type="submit" class="btn-primary" [disabled]="assignForm.invalid || saving()">
                  @if (saving()) { Assigning... } @else { Assign }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      @if (cancelDialogOpen()) {
        <div class="dialog-overlay" (click)="closeCancelDialog()">
          <div class="dialog dialog-small" (click)="$event.stopPropagation()">
            <div class="dialog-header">
              <h2>Cancel Subscription</h2>
              <button class="btn-close" (click)="closeCancelDialog()">&times;</button>
            </div>
            <div class="dialog-body">
              <p>Are you sure you want to cancel the active subscription for this tenant?</p>
            </div>
            @if (cancelError()) {
              <div class="dialog-error">{{ cancelError() }}</div>
            }
            <div class="dialog-footer">
              <button class="btn-secondary" (click)="closeCancelDialog()">No, keep it</button>
              <button class="btn-danger" [disabled]="cancelling()" (click)="cancelSubscription()">
                @if (cancelling()) { Cancelling... } @else { Yes, cancel }
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
    .breadcrumb { font-size: 0.8125rem; color: #888; margin-bottom: 0.5rem; }
    .breadcrumb a { color: #7b1fa2; text-decoration: none; }
    .breadcrumb a:hover { text-decoration: underline; }
    .breadcrumb .sep { margin: 0 0.375rem; }
    .loading-state { padding: 3rem; text-align: center; color: #888; }
    .empty-state { padding: 2rem; text-align: center; color: #888; }
    .empty-icon {
      width: 48px; height: 48px; background: #f3e5f5; color: #7b1fa2; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; font-size: 1.25rem;
      font-weight: 700; margin: 0 auto 1rem;
    }
    .card {
      background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      padding: 1.5rem; margin-bottom: 1.5rem;
    }
    .card h2 { font-size: 1.125rem; color: #2c003e; margin: 0 0 1rem; }
    .current-subscription .sub-details { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
    .sub-field { display: flex; flex-direction: column; gap: 0.25rem; }
    .sub-label { font-size: 0.75rem; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    .sub-value { font-size: 0.9375rem; color: #333; font-weight: 500; }
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
    .field input[type="date"], .field select {
      width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #ddd; border-radius: 6px;
      font-size: 0.875rem; outline: none; box-sizing: border-box;
    }
    .field input:focus, .field select:focus { border-color: #7b1fa2; box-shadow: 0 0 0 3px rgba(123,31,162,0.1); }
    .field-error { color: #c62828; font-size: 0.75rem; margin-top: 0.25rem; }
  `],
})
export class TenantPlan implements OnInit {
  private readonly subscriptionClient = inject(SubscriptionClient);
  private readonly tenantClient = inject(TenantClient);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly tenantId = signal<number>(0);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly cancelling = signal(false);
  readonly tenant = signal<TenantDto | null>(null);
  readonly subscriptions = signal<TenantSubscriptionDto[]>([]);
  readonly plans = signal<SubscriptionPlanDto[]>([]);
  readonly assignDialogOpen = signal(false);
  readonly cancelDialogOpen = signal(false);
  readonly dialogError = signal<string | null>(null);
  readonly cancelError = signal<string | null>(null);

  readonly activeSubscription = computed(() =>
    this.subscriptions().find((s) => s.isActive) ?? null,
  );

  readonly assignForm = this.fb.nonNullable.group({
    planId: [0, Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
  });

  ngOnInit(): void {
    const tid = Number(this.route.snapshot.paramMap.get('tenantId'));
    if (tid) {
      this.tenantId.set(tid);
      this.loadData();
    }
  }

  private loadData(): void {
    this.loading.set(true);
    const tid = this.tenantId();
    this.tenantClient.getById(tid).subscribe({
      next: (t) => this.tenant.set(t),
    });
    this.subscriptionClient.getTenantSubscriptions(tid).subscribe({
      next: (data) => {
        this.subscriptions.set(data ?? []);
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading.set(false);
        this.cdr.markForCheck();
      },
    });
    this.subscriptionClient.getAllSubscriptionPlansAdmin().subscribe({
      next: (data) => {
        this.plans.set(data ?? []);
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading.set(false);
        this.cdr.markForCheck();
      },
    });
    this.loading.set(false);
    this.cdr.markForCheck();
  }

  openAssignDialog(): void {
    this.assignForm.reset({ planId: 0, startDate: '', endDate: '' });
    this.dialogError.set(null);
    this.assignDialogOpen.set(true);
  }

  closeAssignDialog(): void {
    this.assignDialogOpen.set(false);
    this.dialogError.set(null);
  }

  assignPlan(): void {
    if (this.assignForm.invalid) return;

    const val = this.assignForm.getRawValue();
    const body: CreateTenantSubscriptionRequest = {
      tenantId: this.tenantId(),
      planId: val.planId,
      startDate: val.startDate,
      endDate: val.endDate,
    };

    this.saving.set(true);
    this.dialogError.set(null);

    this.subscriptionClient.createTenantSubscription(body).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeAssignDialog();
        this.loadData();
      },
      error: (err) => {
        this.saving.set(false);
        this.dialogError.set(err?.error?.message ?? err?.error ?? 'Failed to assign plan.');
        this.cdr.markForCheck();
      },
    });
  }

  confirmCancel(): void {
    this.cancelError.set(null);
    this.cancelDialogOpen.set(true);
  }

  closeCancelDialog(): void {
    this.cancelDialogOpen.set(false);
    this.cancelError.set(null);
  }

  cancelSubscription(): void {
    const active = this.activeSubscription();
    if (!active) return;

    this.cancelling.set(true);
    this.cancelError.set(null);

    const body: UpdateTenantSubscriptionRequest = { isActive: false };
    this.subscriptionClient.updateTenantSubscription(active.subscriptionId, body).subscribe({
      next: () => {
        this.cancelling.set(false);
        this.closeCancelDialog();
        this.loadData();
      },
      error: (err) => {
        this.cancelling.set(false);
        this.cancelError.set(err?.error?.message ?? err?.error ?? 'Failed to cancel subscription.');
        this.cdr.markForCheck();
      },
    });
  }
}
