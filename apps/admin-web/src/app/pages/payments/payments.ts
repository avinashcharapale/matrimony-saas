import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillingRepository } from '@org/data-access-billing';
import { PaymentTransactionDetailDto, PaymentTransactionHistoryDto, InvoiceDto, ReceiptDto, OfflinePendingPaymentDto } from '@org/generated';
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
      <div class="page-head">
        <ui-page-header title="Payments" subtitle="Tenant-wide payment transactions" />
      </div>

      @if (pendingOffline().length > 0) {
        <div class="offline-pending">
          <div class="offline-pending-head">
            <div>
              <h3>Offline payments awaiting approval</h3>
              <p class="hint">Users reported a manual UPI / bank payment. Confirm after verifying the funds were received.</p>
            </div>
            <button mat-stroked-button (click)="loadPendingOffline()">
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
          </div>
          <div class="table-card">
            <table>
              <thead>
                <tr>
                  <th>Reported</th>
                  <th>User</th>
                  <th>Plan / Description</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (p of pendingOffline(); track p.transactionId) {
                  <tr>
                    <td>{{ formatDate(p.createdAt) }}</td>
                    <td>
                      <span class="user-id">#{{ p.userId }}</span>
                      @if (p.userName) {
                        <div class="user-name">{{ p.userName }}</div>
                      }
                    </td>
                    <td class="desc">{{ p.description || 'Subscription payment' }}</td>
                    <td>
                      <span class="mode-chip {{ p.paymentMethod === 'upi' ? 'gw-upi' : 'gw-bank' }}">
                        {{ p.paymentMethod === 'upi' ? 'UPI' : 'Bank Transfer' }}
                      </span>
                    </td>
                    <td class="amount">{{ formatCurrency(p.amount) }}</td>
                    <td>
                      <button
                        mat-flat-button
                        color="primary"
                        class="approve-btn"
                        [disabled]="approvingId() === p.transactionId"
                        (click)="approveOffline(p)"
                      >
                        @if (approvingId() === p.transactionId) {
                          <mat-spinner diameter="18"></mat-spinner>
                        }
                        Approve
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (approveError()) {
            <div class="cash-message error">{{ approveError() }}</div>
          }
        </div>
      }

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-label">Collected</div>
          <div class="stat-value">{{ formatCurrency(statsCollected()) }}</div>
        </div>
        <div class="stat-card refund">
          <div class="stat-label">Refunded</div>
          <div class="stat-value">{{ formatCurrency(statsRefunded()) }}</div>
        </div>
        <div class="stat-card success">
          <div class="stat-label">Success</div>
          <div class="stat-value">{{ statsSuccess() }}</div>
        </div>
        <div class="stat-card pending">
          <div class="stat-label">Pending</div>
          <div class="stat-value">{{ statsPending() }}</div>
        </div>
        <div class="stat-card failed">
          <div class="stat-label">Failed</div>
          <div class="stat-value">{{ statsFailed() }}</div>
        </div>
      </div>

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
        <select class="filter-input" [(ngModel)]="modeFilter" (change)="applyFilters()">
          <option value="">All modes</option>
          @for (m of gateways; track m.id) {
            <option [value]="m.id">{{ m.name }}</option>
          }
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
      } @else if (visiblePayments().length === 0) {
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
                <th>Plan / Description</th>
                <th>Mode</th>
                <th>Amount</th>
                <th>Refund</th>
                <th>Status</th>
                <th>Invoice</th>
                <th>Receipt</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (tx of visiblePayments(); track tx.paymentTransactionId) {
                <tr>
                  <td>{{ formatDate(tx.createdAt) }}</td>
                  <td>
                    <span class="user-id">#{{ tx.userId }}</span>
                  </td>
                  <td class="desc">{{ tx.description || tx.gatewayOrderId || 'Payment' }}</td>
                  <td>
                    <span class="mode-chip {{ gatewayClass(tx.paymentGatewayId) }}">{{ gatewayName(tx.paymentGatewayId) }}</span>
                  </td>
                  <td class="amount">{{ formatCurrency(tx.amount) }}</td>
                  <td>
                    @if ((tx.refundedAmount ?? 0) > 0) {
                      <span class="refund-chip">{{ formatCurrency(tx.refundedAmount) }}</span>
                    } @else {
                      <span class="no-refund">—</span>
                    }
                  </td>
                  <td><ui-status-badge [status]="statusText(tx.status)"></ui-status-badge></td>
                  <td>{{ tx.invoiceNumber || '—' }}</td>
                  <td>{{ tx.receiptNumber || '—' }}</td>
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
            <dl class="meta">
              <dt>User</dt>
              <dd>#{{ d.transaction?.userId }}</dd>
              <dt>Status</dt>
              <dd><ui-status-badge [status]="statusText(d.transaction?.status)"></ui-status-badge></dd>
              <dt>Mode</dt>
              <dd>
                <span class="mode-chip {{ gatewayClass(d.transaction?.paymentGatewayId) }}">{{ gatewayName(d.transaction?.paymentGatewayId) }}</span>
              </dd>
              <dt>Amount</dt>
              <dd>{{ formatCurrency(d.transaction?.amount) }}</dd>
              <dt>Refunded</dt>
              <dd>{{ formatCurrency(d.transaction?.refundedAmount) }}</dd>
              <dt>Date</dt>
              <dd>{{ formatDateTime(d.transaction?.createdAt) }}</dd>
              <dt>Gateway order</dt>
              <dd class="mono">{{ d.transaction?.gatewayOrderId || '—' }}</dd>
              <dt>Gateway payment</dt>
              <dd class="mono">{{ d.transaction?.gatewayPaymentId || '—' }}</dd>
              @if (d.transaction?.failureReason) {
                <dt>Failure</dt>
                <dd class="error-text">{{ d.transaction?.failureReason }}</dd>
              }
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
                <thead><tr><th>Amount</th><th>Type</th><th>Status</th><th>Reason</th><th>Completed</th></tr></thead>
                <tbody>
                  @for (r of d.refunds ?? []; track r.refundId) {
                    <tr>
                      <td>{{ formatCurrency(r.amount) }}</td>
                      <td>{{ r.refundType }}</td>
                      <td><ui-status-badge [status]="statusText(r.status)"></ui-status-badge></td>
                      <td>{{ r.refundReason }}</td>
                      <td>{{ formatDate(r.completedAt) }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            }

            <h3>Invoice</h3>
            @if (d.invoice; as inv) {
              <dl class="meta">
                <dt>Invoice</dt>
                <dd>{{ inv.invoiceNumber }}</dd>
                <dt>Status</dt>
                <dd><ui-status-badge [status]="statusText(inv.status)"></ui-status-badge></dd>
                <dt>Amount paid</dt>
                <dd>{{ formatCurrency(inv.amountPaid) }}</dd>
                <dt>Amount due</dt>
                <dd>{{ formatCurrency(inv.amountDue) }}</dd>
                <dt>Billing period</dt>
                <dd>{{ formatDate(inv.billingPeriodStart) }} → {{ formatDate(inv.billingPeriodEnd) }}</dd>
              </dl>
              <button mat-stroked-button class="pdf-btn" (click)="downloadInvoicePdf(inv)">
                <mat-icon>picture_as_pdf</mat-icon>
                Download invoice PDF
              </button>
              @if (inv.items?.length) {
                <table>
                  <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
                  <tbody>
                    @for (it of inv.items; track it.invoiceItemId) {
                      <tr>
                        <td>{{ it.description }}</td>
                        <td>{{ it.quantity }}</td>
                        <td>{{ formatCurrency(it.unitPrice) }}</td>
                        <td>{{ formatCurrency(it.lineTotal) }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            } @else {
              <p class="empty">No invoice linked to this transaction.</p>
            }

            <h3>Receipt</h3>
            @if (d.receipt; as rc) {
              <dl class="meta">
                <dt>Receipt</dt>
                <dd>{{ rc.receiptNumber }}</dd>
                <dt>Amount</dt>
                <dd>{{ formatCurrency(rc.amount) }}</dd>
                <dt>Date</dt>
                <dd>{{ formatDate(rc.receiptDate) }}</dd>
              </dl>
              <button mat-stroked-button class="pdf-btn" (click)="downloadReceiptPdf(rc)">
                <mat-icon>picture_as_pdf</mat-icon>
                Download receipt PDF
              </button>
            } @else {
              <p class="empty">No receipt issued.</p>
            }
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .payments-page { position: relative; }
      .page-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
      .cash-message { display: flex; align-items: flex-start; gap: 10px; margin-top: 1rem; padding: 0.75rem 1rem; border-radius: 8px; font-size: 14px; }
      .cash-message.error { background: #fdecea; color: #b71c1c; }

      /* ─── Summary strip ─────────────────────────────────────────────── */
      .stats-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 1.25rem; }
      .stat-card { background: #fff; border-radius: 12px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border-top: 3px solid #5e35b1; animation: statIn 250ms ease-out both; }
      .stat-card:nth-child(2) { animation-delay: 40ms; }
      .stat-card:nth-child(3) { animation-delay: 80ms; }
      .stat-card:nth-child(4) { animation-delay: 120ms; }
      .stat-card:nth-child(5) { animation-delay: 160ms; }
      .stat-card.refund, .stat-card.pending { border-top-color: #f9a825; }
      .stat-card.success { border-top-color: #2e7d32; }
      .stat-card.failed { border-top-color: #c62828; }
      .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #757575; }
      .stat-value { font-size: 20px; font-weight: 600; color: #1a1a1a; margin-top: 4px; }
      @keyframes statIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

      .filter-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 1.25rem; flex-wrap: wrap; }
      .filter-input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; min-width: 150px; font-size: 14px; background: #fff; }
      .filter-input:focus { outline: none; border-color: #5e35b1; }
      .state-box { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 3rem; color: #757575; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); font-size: 14px; }
      .state-box.error { color: #c62828; }
      .table-card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); overflow-x: auto; }
      table { width: 100%; border-collapse: collapse; }
      th { text-align: left; padding: 12px 16px; font-size: 12px; color: #757575; text-transform: uppercase; letter-spacing: 0.03em; border-bottom: 1px solid #f0f0f0; white-space: nowrap; }
      td { padding: 12px 16px; font-size: 14px; color: #1a1a1a; border-bottom: 1px solid #f5f5f5; }
      tbody tr:last-child td { border-bottom: none; }
      tbody tr { transition: background 150ms ease; animation: rowIn 200ms ease-out both; }
      tbody tr:hover { background: #fafafa; }
      @keyframes rowIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      .user-id { font-weight: 500; color: #424242; }
      .desc { color: #424242; }
      .amount { font-weight: 600; }

      /* ─── Mode chips ─────────────────────────────────────────────────── */
      .mode-chip { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 500; white-space: nowrap; }
      .mode-chip::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
      .gw-razorpay { background: #eef2ff; color: #4f46e5; }
      .gw-stripe { background: #e2e8f0; color: #334155; }
      .gw-paypal { background: #eff6ff; color: #1d4ed8; }
      .gw-cashfree { background: #e6fffb; color: #0f766e; }
      .gw-cash { background: #e8f5e9; color: #2e7d32; }
      .gw-unknown { background: #f5f5f5; color: #616161; }
      .gw-upi { background: #e3f2fd; color: #1565c0; }
      .gw-bank { background: #ede7f6; color: #4527a0; }

      /* ─── Offline pending approvals ──────────────────────────────────── */
      .offline-pending { background: #fff; border: 1px solid #ede7f6; border-left: 4px solid #f9a825; border-radius: 12px; padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
      .offline-pending-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
      .offline-pending h3 { margin: 0 0 0.25rem; font-size: 16px; color: #1a1a1a; }
      .offline-pending .hint { margin: 0; font-size: 13px; color: #757575; }
      .user-name { font-size: 12px; color: #757575; }
      .approve-btn { display: inline-flex; align-items: center; gap: 6px; }

      .refund-chip { background: #fff8e1; color: #b26a00; border: 1px solid #ffe082; padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 600; white-space: nowrap; }
      .no-refund { color: #bdbdbd; }

      .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 1rem; color: #757575; font-size: 14px; }
      .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 200; display: flex; justify-content: flex-end; }
      .drawer { background: #fff; width: min(560px, 100%); height: 100%; overflow-y: auto; padding: 1.25rem; display: grid; align-content: start; gap: 0.5rem; animation: drawerIn 250ms ease-out both; }
      @keyframes drawerIn { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
      .drawer header { display: flex; justify-content: space-between; align-items: center; }
      .drawer h2 { margin: 0; font-size: 18px; }
      .drawer h3 { margin: 1rem 0 0; font-size: 14px; color: #424242; }
      .drawer-close { border: none; background: transparent; font-size: 1.6rem; line-height: 1; cursor: pointer; color: #757575; }
      dl.meta { display: grid; grid-template-columns: 130px 1fr; gap: 0.5rem 0.8rem; margin: 0.6rem 0 0; }
      dl.meta dt { color: #757575; font-size: 13px; }
      dl.meta dd { margin: 0; font-size: 14px; color: #1a1a1a; }
      .mono { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px; word-break: break-all; }
      .error-text { color: #c62828; }
      .empty { color: #999; padding: 0.5rem 0; margin: 0; font-size: 13px; }
      .pdf-btn { margin-top: 0.6rem; display: inline-flex; align-items: center; gap: 6px; font-size: 13px; }
      .pdf-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    `,
  ],
})
export class Payments implements OnInit {
  private readonly billing = inject(BillingRepository);

  readonly gateways: { id: number; name: string }[] = [
    { id: 1, name: 'Razorpay' },
    { id: 2, name: 'Stripe' },
    { id: 3, name: 'PayPal' },
    { id: 4, name: 'Cashfree' },
    { id: 5, name: 'Cash' },
  ];

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly payments = signal<PaymentTransactionHistoryDto[]>([]);
  readonly totalCount = signal(0);
  readonly pageNumber = signal(1);
  readonly pageSize = 10;

  readonly userIdFilter = signal<string>('');
  readonly statusFilter = signal<string>('');
  readonly modeFilter = signal<string>('');

  readonly detail = signal<PaymentTransactionDetailDto | null>(null);
  readonly detailLoading = signal(false);

  readonly pendingOffline = signal<OfflinePendingPaymentDto[]>([]);
  readonly approvingId = signal<number | null>(null);
  readonly approveError = signal<string | null>(null);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize)));

  readonly visiblePayments = computed(() => {
    const mode = Number(this.modeFilter());
    if (!mode) return this.payments();
    return this.payments().filter((t) => t.paymentGatewayId === mode);
  });

  readonly statsCollected = computed(() => this.visiblePayments().reduce((sum, t) => sum + (t.amount ?? 0), 0));
  readonly statsRefunded = computed(() => this.visiblePayments().reduce((sum, t) => sum + (t.refundedAmount ?? 0), 0));
  readonly statsSuccess = computed(() => this.visiblePayments().filter((t) => t.status === 'success').length);
  readonly statsPending = computed(() =>
    this.visiblePayments().filter((t) => t.status === 'pending' || t.status === 'authorized' || t.status === 'created').length
  );
  readonly statsFailed = computed(() =>
    this.visiblePayments().filter((t) => t.status === 'failed' || t.status === 'cancelled').length
  );

  ngOnInit(): void {
    this.load();
    this.loadPendingOffline();
  }

  loadPendingOffline(): void {
    this.approveError.set(null);
    this.billing.getPendingOfflinePayments().subscribe({
      next: (items) => this.pendingOffline.set(items ?? []),
      error: () => this.pendingOffline.set([]),
    });
  }

  approveOffline(p: OfflinePendingPaymentDto): void {
    const txId = p.transactionId;
    if (txId == null || this.approvingId() !== null) return;
    this.approvingId.set(txId);
    this.approveError.set(null);
    this.billing.approveOfflinePayment(txId).subscribe({
      next: () => {
        this.approvingId.set(null);
        this.loadPendingOffline();
        this.load();
      },
      error: (err: unknown) => {
        this.approvingId.set(null);
        this.approveError.set(this.errorMessage(err, 'Failed to approve the offline payment.'));
      },
    });
  }

  errorMessage(err: unknown, fallback: string): string {
    if (err && typeof err === 'object') {
      const candidate = err as { error?: { message?: unknown }; message?: unknown };
      if (typeof candidate.error?.message === 'string') return candidate.error.message;
      if (typeof candidate.message === 'string') return candidate.message;
    }
    return fallback;
  }

  gatewayName(id?: number): string {
    if (!id) return '—';
    const g = this.gateways.find((x) => x.id === id);
    return g ? g.name : `Gateway ${id}`;
  }

  gatewayClass(id?: number): string {
    switch (id) {
      case 1: return 'gw-razorpay';
      case 2: return 'gw-stripe';
      case 3: return 'gw-paypal';
      case 4: return 'gw-cashfree';
      case 5: return 'gw-cash';
      default: return 'gw-unknown';
    }
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
    this.billing.getPaymentTransactionById(tx.paymentTransactionId ?? 0).subscribe({
      next: (detail) => {
        this.detail.set(detail);
        this.detailLoading.set(false);
      },
      error: () => this.detailLoading.set(false),
    });
  }

  closeDetail(): void {
    this.detail.set(null);
  }

  downloadInvoicePdf(inv: InvoiceDto): void {
    this.billing.downloadInvoicePdf(inv.invoiceId!, `${inv.invoiceNumber}.pdf`).subscribe();
  }

  downloadReceiptPdf(rc: ReceiptDto): void {
    this.billing.downloadReceiptPdf(rc.receiptId!, `${rc.receiptNumber}.pdf`).subscribe();
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

  formatDateTime(value?: string): string {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d.getTime())
      ? value
      : d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
