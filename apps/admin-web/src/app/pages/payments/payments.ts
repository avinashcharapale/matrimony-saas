import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillingRepository } from '@org/data-access-billing';
import { PaymentTransactionDetailDto, PaymentTransactionHistoryDto, InvoiceDto } from '@org/generated';
import { PageHeaderComponent, StatusBadgeComponent } from '@org/shared-ui';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-payments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="payments-page">
      <ui-page-header title="Payments" subtitle="Tenant-wide payment transactions" />

      <div class="filter-bar">
        <input
          type="number"
          class="filter-input"
          placeholder="User ID"
          [(ngModel)]="userIdFilter"
          (keyup.enter)="applyFilters()"
        />
        <select class="filter-input" [(ngModel)]="statusFilter" (change)="applyFilters()">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
          <option value="partially_refunded">Partially Refunded</option>
        </select>
        <button mat-flat-button color="primary" (click)="applyFilters()">
          <mat-icon>search</mat-icon>
          Apply
        </button>
      </div>

      @if (loading()) {
        <div class="state-box">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading payments...</span>
        </div>
      } @else if (error()) {
        <div class="state-box error">{{ error() }}</div>
      } @else if (payments().length === 0) {
        <div class="state-box">
          <mat-icon>payments</mat-icon>
          <span>No payment transactions found</span>
        </div>
      } @else {
        <div class="table-card">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Invoice</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (tx of payments(); track tx.paymentTransactionId) {
                <tr>
                  <td>{{ formatDate(tx.createdAt) }}</td>
                  <td>
                    <span class="user-id">{{ tx.userId }}</span>
                  </td>
                  <td>{{ tx.description || tx.gatewayOrderId || 'Payment' }}</td>
                  <td>{{ formatCurrency(tx.amount) }}</td>
                  <td><ui-status-badge [status]="statusText(tx.status)"></ui-status-badge></td>
                  <td>{{ tx.invoiceNumber || '—' }}</td>
                  <td>
                    <button mat-stroked-button (click)="openDetail(tx)">View</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <button mat-stroked-button [disabled]="pageNumber() <= 1" (click)="prevPage()">
            <mat-icon>chevron_left</mat-icon> Prev
          </button>
          <span>Page {{ pageNumber() }} of {{ totalPages() }}</span>
          <button mat-stroked-button [disabled]="pageNumber() >= totalPages()" (click)="nextPage()">
            Next <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
      }
    </div>

    @if (detail()) {
      <div class="drawer-overlay" (click)="onOverlayClick($event)" (keydown.escape)="closeDetail()" tabindex="0" role="presentation">
        <div class="drawer" role="dialog" aria-label="Transaction detail">
          <header>
            <h2>Transaction detail</h2>
            <button class="drawer-close" (click)="closeDetail()" aria-label="Close">&times;</button>
          </header>

          @if (detailLoading()) {
            <div class="state-box">
              <mat-spinner diameter="28"></mat-spinner>
              <span>Loading...</span>
            </div>
          } @else if (detail(); as d) {
            <dl>
              <dt>User ID</dt>
              <dd>{{ d.transaction?.userId }}</dd>
              <dt>Status</dt>
              <dd><ui-status-badge [status]="statusText(d.transaction?.status)"></ui-status-badge></dd>
              <dt>Amount</dt>
              <dd>{{ formatCurrency(d.transaction?.amount) }}</dd>
              <dt>Date</dt>
              <dd>{{ formatDate(d.transaction?.createdAt) }}</dd>
              <dt>Gateway order</dt>
              <dd>{{ d.transaction?.gatewayOrderId || '—' }}</dd>
              <dt>Gateway payment</dt>
              <dd>{{ d.transaction?.gatewayPaymentId || '—' }}</dd>
              <dt>Refunded amount</dt>
              <dd>{{ formatCurrency(d.transaction?.refundedAmount) }}</dd>
            </dl>

            <h3>Attempts</h3>
            @if (!(d.attempts?.length)) {
              <p class="empty">No attempts recorded.</p>
            } @else {
              <table>
                <thead><tr><th>#</th><th>Amount</th><th>Status</th><th>At</th></tr></thead>
                <tbody>
                  @for (a of d.attempts ?? []; track a.paymentAttemptId) {
                    <tr>
                      <td>{{ a.attemptNumber }}</td>
                      <td>{{ formatCurrency(a.amount) }}</td>
                      <td><ui-status-badge [status]="statusText(a.status)"></ui-status-badge></td>
                      <td>{{ formatDate(a.attemptedAt) }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            }

            <h3>Refunds</h3>
            @if (!(d.refunds?.length)) {
              <p class="empty">No refunds recorded.</p>
            } @else {
              <table>
                <thead><tr><th>Amount</th><th>Type</th><th>Status</th><th>Reason</th></tr></thead>
                <tbody>
                  @for (r of d.refunds ?? []; track r.refundId) {
                    <tr>
                      <td>{{ formatCurrency(r.amount) }}</td>
                      <td>{{ r.refundType }}</td>
                      <td><ui-status-badge [status]="statusText(r.status)"></ui-status-badge></td>
                      <td>{{ r.refundReason }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            }

            <h3>Invoices</h3>
            @if (!(invoices()?.length)) {
              <p class="empty">No invoices for this user.</p>
            } @else {
              <table>
                <thead><tr><th>Invoice</th><th>Status</th><th>Amount</th></tr></thead>
                <tbody>
                  @for (inv of invoices() ?? []; track inv.invoiceId) {
                    <tr>
                      <td>{{ inv.invoiceNumber }}</td>
                      <td><ui-status-badge [status]="statusText(inv.status)"></ui-status-badge></td>
                      <td>{{ formatCurrency(inv.totalAmount) }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .payments-page { position: relative; }
    .filter-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 1.25rem; flex-wrap: wrap; }
    .filter-input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; min-width: 160px; font-size: 14px; background: #fff; }
    .state-box { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 3rem; color: #757575; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); font-size: 14px; }
    .state-box.error { color: #c62828; }
    .table-card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 12px 16px; font-size: 12px; color: #757575; text-transform: uppercase; letter-spacing: 0.03em; border-bottom: 1px solid #f0f0f0; white-space: nowrap; }
    td { padding: 12px 16px; font-size: 14px; color: #1a1a1a; border-bottom: 1px solid #f5f5f5; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover { background: #fafafa; }
    .user-id { font-weight: 500; color: #424242; }
    .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 1rem; color: #757575; font-size: 14px; }
    .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 200; display: flex; justify-content: flex-end; }
    .drawer { background: #fff; width: min(520px, 100%); height: 100%; overflow-y: auto; padding: 1.25rem; display: grid; align-content: start; gap: 0.5rem; }
    .drawer header { display: flex; justify-content: space-between; align-items: center; }
    .drawer h2 { margin: 0; font-size: 18px; }
    .drawer h3 { margin: 1rem 0 0; font-size: 14px; color: #424242; }
    .drawer-close { border: none; background: transparent; font-size: 1.6rem; line-height: 1; cursor: pointer; color: #757575; }
    dl { display: grid; grid-template-columns: 130px 1fr; gap: 0.5rem 0.8rem; margin: 0.6rem 0 0; }
    dt { color: #757575; font-size: 13px; }
    dd { margin: 0; font-size: 14px; color: #1a1a1a; }
    .empty { color: #999; padding: 0.5rem 0; margin: 0; font-size: 13px; }
  `],
})
export class Payments implements OnInit {
  private readonly billing = inject(BillingRepository);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly payments = signal<PaymentTransactionHistoryDto[]>([]);
  readonly totalCount = signal(0);
  readonly pageNumber = signal(1);
  readonly pageSize = 10;

  readonly userIdFilter = signal<string>('');
  readonly statusFilter = signal<string>('');

  readonly detail = signal<PaymentTransactionDetailDto | null>(null);
  readonly detailLoading = signal(false);
  readonly invoices = signal<InvoiceDto[] | null>(null);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize)));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    const request = {
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize,
      userId: this.userIdFilter() ? Number(this.userIdFilter()) : undefined,
      status: this.statusFilter() || undefined,
    };
    this.billing.getTenantPaymentTransactions(request).subscribe({
      next: (paged) => {
        this.payments.set(paged?.items ?? []);
        this.totalCount.set(paged?.totalCount ?? 0);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : 'Failed to load payments');
      },
    });
  }

  applyFilters(): void {
    this.pageNumber.set(1);
    this.load();
  }

  prevPage(): void {
    if (this.pageNumber() > 1) {
      this.pageNumber.update((n) => n - 1);
      this.load();
    }
  }

  nextPage(): void {
    if (this.pageNumber() < this.totalPages()) {
      this.pageNumber.update((n) => n + 1);
      this.load();
    }
  }

  openDetail(tx: PaymentTransactionHistoryDto): void {
    this.detail.set({ transaction: tx });
    this.detailLoading.set(true);
    this.invoices.set(null);
    this.billing.getPaymentTransactionById(tx.paymentTransactionId ?? 0).subscribe({
      next: (detail) => {
        this.detail.set(detail);
        this.detailLoading.set(false);
      },
      error: () => this.detailLoading.set(false),
    });
    if (tx.userId) {
      this.billing.getUserInvoices(tx.userId).subscribe({
        next: (invoices) => this.invoices.set(invoices ?? []),
        error: () => this.invoices.set([]),
      });
    }
  }

  closeDetail(): void {
    this.detail.set(null);
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeDetail();
    }
  }

  statusText(status?: string): string {
    return status ?? 'Unknown';
  }

  formatCurrency(amount?: number): string {
    return `₹${(amount ?? 0).toFixed(2)}`;
  }

  formatDate(value?: string): string {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
