import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { MemberService } from '../../services/member.service';
import { AuthService } from '../../services/auth.service';
import { SubscriptionStore } from '@org/data-access-subscription';
import { BillingStore } from '@org/data-access-billing';
import { SharedSidebarComponent } from '../../components/shared-sidebar/shared-sidebar.component';
import { getDefaultAvatar, resolvePhotoUrl } from '../../utils/default-avatar';

type PaymentsTab = 'transactions' | 'invoices' | 'methods' | 'wallet';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, SharedSidebarComponent],
  template: `
    <section class="search-page">
      <div class="search-shell">
        <app-shared-sidebar
          [userName]="userName()"
          [userPhotoUrl]="userPhotoUrl()"
          [userOccupation]="userOccupation()"
          [subscriptionStatus]="subscriptionStatus()"
          [subscriptionLoading]="subscriptionLoading()">
        </app-shared-sidebar>

        <div class="page-content">
          <header class="page-header">
            <p class="eyebrow">Billing</p>
            <h1>Payments</h1>
          </header>

          <div class="summary-row">
            <div class="summary-card">
              <span>Total spent</span>
              <strong>{{ formatCurrency(totalSpent()) }}</strong>
            </div>
            <div class="summary-card">
              <span>Wallet balance</span>
              <strong>{{ walletBalance() }}</strong>
            </div>
            <div class="summary-card">
              <span>Saved methods</span>
              <strong>{{ paymentMethodsCount() }}</strong>
            </div>
            <div class="summary-card">
              <span>Invoices</span>
              <strong>{{ invoicesCount() }}</strong>
            </div>
          </div>

          <nav class="tabs">
            <button [class.active]="activeTab() === 'transactions'" (click)="setTab('transactions')">Transactions</button>
            <button [class.active]="activeTab() === 'invoices'" (click)="setTab('invoices')">Invoices</button>
            <button [class.active]="activeTab() === 'methods'" (click)="setTab('methods')">Payment Methods</button>
            <button [class.active]="activeTab() === 'wallet'" (click)="setTab('wallet')">Wallet</button>
          </nav>

          @if (loading()) {
            <p class="empty">Loading...</p>
          } @else if (error()) {
            <p class="empty error">{{ error() }}</p>
          } @else if (activeTab() === 'transactions') {
            <div class="table-card">
              @if (transactions().length === 0) {
                <p class="empty">No payment transactions yet.</p>
              } @else {
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (tx of transactions(); track tx.paymentTransactionId) {
                      <tr (click)="openDetail(tx.paymentTransactionId ?? 0)" tabindex="0" (keydown.enter)="openDetail(tx.paymentTransactionId ?? 0)">
                        <td>{{ formatDate(tx.createdAt) }}</td>
                        <td>{{ tx.description || tx.gatewayOrderId || 'Payment' }}</td>
                        <td>{{ formatCurrency(tx.amount) }}</td>
                        <td><span class="badge" [class]="statusClass(tx.status)">{{ tx.status }}</span></td>
                        <td class="detail-link">View</td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            </div>
          } @else if (activeTab() === 'invoices') {
            <div class="table-card">
              @if (invoices().length === 0) {
                <p class="empty">No invoices yet.</p>
              } @else {
                <table>
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (inv of invoices(); track inv.invoiceId) {
                      <tr>
                        <td>{{ inv.invoiceNumber }}</td>
                        <td>{{ formatDate(inv.invoiceDate) }}</td>
                        <td><span class="badge" [class]="statusClass(inv.status)">{{ inv.status }}</span></td>
                        <td>{{ formatCurrency(inv.totalAmount) }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            </div>
          } @else if (activeTab() === 'methods') {
            <div class="table-card">
              @if (methods().length === 0) {
                <p class="empty">No saved payment methods.</p>
              } @else {
                <table>
                  <thead>
                    <tr>
                      <th>Method</th>
                      <th>Card</th>
                      <th>Expiry</th>
                      <th>Default</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (m of methods(); track m.paymentMethodId) {
                      <tr>
                        <td>{{ m.methodType }}</td>
                        <td>{{ m.cardBrand || '' }} {{ m.cardLastFour ? '•••• ' + m.cardLastFour : '' }}</td>
                        <td>{{ m.expiryMonth }} / {{ m.expiryYear }}</td>
                        <td>{{ m.isDefault ? 'Yes' : 'No' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            </div>
          } @else {
            <div class="table-card">
              <p class="empty">
                Wallet: <strong>{{ walletBalance() }}</strong>
              </p>
              @if (walletTransactions().length === 0) {
                <p class="empty">No wallet transactions.</p>
              } @else {
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (wt of walletTransactions(); track wt.walletTransactionId) {
                      <tr>
                        <td>{{ formatDate(wt.createdAt) }}</td>
                        <td>{{ wt.transactionType }}</td>
                        <td>{{ wt.description || '' }}</td>
                        <td>{{ formatCurrency(wt.amount) }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            </div>
          }
        </div>
      </div>
    </section>

    @if (selectedDetail()) {
      <div class="drawer-overlay" (click)="onOverlayClick($event)" (keydown.escape)="closeDetail()" tabindex="0" role="presentation">
        <div class="drawer" role="dialog" aria-label="Transaction detail">
          <header>
            <h2>Transaction detail</h2>
            <button class="close" (click)="closeDetail()" aria-label="Close">&times;</button>
          </header>

          <dl>
            <dt>Status</dt>
            <dd><span class="badge" [class]="statusClass(selectedDetail()?.transaction?.status)">{{ selectedDetail()?.transaction?.status }}</span></dd>
            <dt>Amount</dt>
            <dd>{{ formatCurrency(selectedDetail()?.transaction?.amount) }}</dd>
            <dt>Date</dt>
            <dd>{{ formatDate(selectedDetail()?.transaction?.createdAt) }}</dd>
            <dt>Gateway order</dt>
            <dd>{{ selectedDetail()?.transaction?.gatewayOrderId || '—' }}</dd>
            <dt>Gateway payment</dt>
            <dd>{{ selectedDetail()?.transaction?.gatewayPaymentId || '—' }}</dd>
            <dt>Invoice</dt>
            <dd>{{ selectedDetail()?.transaction?.invoiceNumber || '—' }}</dd>
            <dt>Receipt</dt>
            <dd>{{ selectedDetail()?.transaction?.receiptNumber || '—' }}</dd>
          </dl>

          <h3>Attempts</h3>
          @if ((selectedDetail()?.attempts?.length ?? 0) === 0) {
            <p class="empty">No attempts recorded.</p>
          } @else {
            <table>
              <thead>
                <tr><th>#</th><th>Amount</th><th>Status</th><th>At</th></tr>
              </thead>
              <tbody>
                @for (a of selectedDetail()?.attempts ?? []; track a.paymentAttemptId) {
                  <tr>
                    <td>{{ a.attemptNumber }}</td>
                    <td>{{ formatCurrency(a.amount) }}</td>
                    <td><span class="badge" [class]="statusClass(a.status)">{{ a.status }}</span></td>
                    <td>{{ formatDate(a.attemptedAt) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          }

          <h3>Refunds</h3>
          @if ((selectedDetail()?.refunds?.length ?? 0) === 0) {
            <p class="empty">No refunds recorded.</p>
          } @else {
            <table>
              <thead>
                <tr><th>Amount</th><th>Type</th><th>Status</th><th>Reason</th></tr>
              </thead>
              <tbody>
                @for (r of selectedDetail()?.refunds ?? []; track r.refundId) {
                  <tr>
                    <td>{{ formatCurrency(r.amount) }}</td>
                    <td>{{ r.refundType }}</td>
                    <td><span class="badge" [class]="statusClass(r.status)">{{ r.status }}</span></td>
                    <td>{{ r.refundReason }}</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>
    }
  `,
  styleUrl: './payments.css',
})
export class Payments implements OnInit {
  readonly activeTab = signal<PaymentsTab>('transactions');
  readonly userName = signal('');
  readonly userPhotoUrl = signal('');
  readonly userOccupation = signal('');

  private readonly memberService = inject(MemberService);
  private readonly authService = inject(AuthService);
  private readonly subscriptionStore = inject(SubscriptionStore);
  readonly billingStore = inject(BillingStore);

  readonly loading = this.billingStore.loading;
  readonly error = this.billingStore.error;
  readonly transactions = this.billingStore.myPaymentHistory;
  readonly selectedDetail = this.billingStore.selectedPaymentDetail;
  readonly invoices = this.billingStore.myInvoices;
  readonly methods = this.billingStore.myPaymentMethods;
  readonly wallet = this.billingStore.wallet;
  readonly walletTransactions = this.billingStore.walletTransactions;

  readonly subscriptionStatus = this.subscriptionStore.status;
  readonly subscriptionLoading = computed(() => this.subscriptionStore.loading());

  readonly totalSpent = computed(() =>
    this.transactions().reduce((sum, tx) => sum + (tx.amount ?? 0), 0),
  );
  readonly walletBalance = computed(() => {
    const w = this.wallet();
    return w ? `${w.currencyCode ?? 'INR'} ${(w.balance ?? 0).toFixed(2)}` : '—';
  });
  readonly paymentMethodsCount = computed(() => this.methods().length);
  readonly invoicesCount = computed(() => this.invoices().length);

  ngOnInit(): void {
    const userId = this.authService.getSession()?.userId ?? 0;
    if (userId) {
      this.subscriptionStore.loadSubscriptionStatus(userId).subscribe();
    }

    this.memberService.getMyProfile().subscribe({
      next: (profile) => {
        const fullName = profile.fullName ?? '';
        const genderId = profile.personalDetails?.genderId ?? null;
        const primaryPhoto = (profile.photos ?? []).find((ph) => ph.isPrimary) ?? profile.photos?.[0];
        const photoUrl = primaryPhoto
          ? resolvePhotoUrl(primaryPhoto.fileUrl, fullName, genderId)
          : getDefaultAvatar(fullName, genderId);

        this.userName.set(fullName);
        this.userPhotoUrl.set(photoUrl);
        this.userOccupation.set(profile.occupationText ?? '');
      },
      error: () => undefined,
    });

    this.refresh();
  }

  refresh(): void {
    this.billingStore.loadMyPaymentHistory().subscribe();
    this.billingStore.loadMyInvoices().subscribe();
    this.billingStore.loadMyPaymentMethods().subscribe();
    this.billingStore.loadMyWallet().subscribe();
    this.billingStore.loadMyWalletTransactions(50).subscribe();
  }

  setTab(tab: PaymentsTab): void {
    this.activeTab.set(tab);
  }

  openDetail(transactionId: number): void {
    this.billingStore.loadPaymentDetail(transactionId).subscribe();
  }

  closeDetail(): void {
    this.billingStore.clearSelectedPaymentDetail();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeDetail();
    }
  }

  statusClass(status?: string): string {
    return (status ?? '').toLowerCase();
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
