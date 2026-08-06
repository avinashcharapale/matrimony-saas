import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LocaleService } from '@org/i18n';
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
  imports: [CommonModule, TranslateModule, SharedSidebarComponent],
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
            <p class="eyebrow">{{ 'payments.eyebrow' | translate }}</p>
            <h1>{{ 'nav.payments' | translate }}</h1>
          </header>

          <div class="summary-row">
            <div class="summary-card">
              <span>{{ 'payments.totalSpent' | translate }}</span>
              <strong>{{ formatCurrency(totalSpent()) }}</strong>
            </div>
            <div class="summary-card">
              <span>{{ 'payments.walletBalance' | translate }}</span>
              <strong>{{ walletBalance() }}</strong>
            </div>
            <div class="summary-card">
              <span>{{ 'payments.savedMethods' | translate }}</span>
              <strong>{{ paymentMethodsCount() }}</strong>
            </div>
            <div class="summary-card">
              <span>{{ 'payments.invoices' | translate }}</span>
              <strong>{{ invoicesCount() }}</strong>
            </div>
          </div>

          <nav class="tabs">
            <button [class.active]="activeTab() === 'transactions'" (click)="setTab('transactions')">{{ 'payments.transactions' | translate }}</button>
            <button [class.active]="activeTab() === 'invoices'" (click)="setTab('invoices')">{{ 'payments.invoices' | translate }}</button>
            <button [class.active]="activeTab() === 'methods'" (click)="setTab('methods')">{{ 'payments.paymentMethods' | translate }}</button>
            <button [class.active]="activeTab() === 'wallet'" (click)="setTab('wallet')">{{ 'payments.wallet' | translate }}</button>
          </nav>

          @if (loading()) {
            <p class="empty">{{ 'common.loading' | translate }}</p>
          } @else if (error()) {
            <p class="empty error">{{ error() }}</p>
          } @else if (activeTab() === 'transactions') {
            <div class="table-card">
              @if (transactions().length === 0) {
                <p class="empty">{{ 'payments.noTransactions' | translate }}</p>
              } @else {
                <table>
                  <thead>
                    <tr>
                      <th>{{ 'payments.date' | translate }}</th>
                      <th>{{ 'payments.description' | translate }}</th>
                      <th>{{ 'payments.amount' | translate }}</th>
                      <th>{{ 'payments.status' | translate }}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (tx of transactions(); track tx.paymentTransactionId) {
                      <tr (click)="openDetail(tx.paymentTransactionId ?? 0)" tabindex="0" (keydown.enter)="openDetail(tx.paymentTransactionId ?? 0)">
                        <td>{{ formatDate(tx.createdAt) }}</td>
                        <td>{{ tx.description || tx.gatewayOrderId || ('payments.payment' | translate) }}</td>
                        <td>{{ formatCurrency(tx.amount) }}</td>
                        <td><span class="badge" [class]="statusClass(tx.status)">{{ tx.status }}</span></td>
                        <td class="detail-link">{{ 'payments.view' | translate }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            </div>
          } @else if (activeTab() === 'invoices') {
            <div class="table-card">
              @if (invoices().length === 0) {
                <p class="empty">{{ 'payments.noInvoices' | translate }}</p>
              } @else {
                <table>
                  <thead>
                    <tr>
                      <th>{{ 'payments.invoice' | translate }}</th>
                      <th>{{ 'payments.date' | translate }}</th>
                      <th>{{ 'payments.status' | translate }}</th>
                      <th>{{ 'payments.amount' | translate }}</th>
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
                <p class="empty">{{ 'payments.noMethods' | translate }}</p>
              } @else {
                <table>
                  <thead>
                    <tr>
                      <th>{{ 'payments.method' | translate }}</th>
                      <th>{{ 'payments.card' | translate }}</th>
                      <th>{{ 'payments.expiry' | translate }}</th>
                      <th>{{ 'payments.default' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (m of methods(); track m.paymentMethodId) {
                      <tr>
                        <td>{{ m.methodType }}</td>
                        <td>{{ m.cardBrand || '' }} {{ m.cardLastFour ? '•••• ' + m.cardLastFour : '' }}</td>
                        <td>{{ m.expiryMonth }} / {{ m.expiryYear }}</td>
                        <td>{{ m.isDefault ? ('common.yes' | translate) : ('common.no' | translate) }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            </div>
          } @else {
            <div class="table-card">
              <p class="empty">
                {{ 'payments.wallet' | translate }}: <strong>{{ walletBalance() }}</strong>
              </p>
              @if (walletTransactions().length === 0) {
                <p class="empty">{{ 'payments.noWalletTransactions' | translate }}</p>
              } @else {
                <table>
                  <thead>
                    <tr>
                      <th>{{ 'payments.date' | translate }}</th>
                      <th>{{ 'payments.type' | translate }}</th>
                      <th>{{ 'payments.description' | translate }}</th>
                      <th>{{ 'payments.amount' | translate }}</th>
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
        <div class="drawer" role="dialog" [attr.aria-label]="'payments.transactionDetail' | translate">
          <header>
            <h2>{{ 'payments.transactionDetail' | translate }}</h2>
            <button class="close" (click)="closeDetail()" [attr.aria-label]="'common.close' | translate">&times;</button>
          </header>

          <dl>
            <dt>{{ 'payments.status' | translate }}</dt>
            <dd><span class="badge" [class]="statusClass(selectedDetail()?.transaction?.status)">{{ selectedDetail()?.transaction?.status }}</span></dd>
            <dt>{{ 'payments.amount' | translate }}</dt>
            <dd>{{ formatCurrency(selectedDetail()?.transaction?.amount) }}</dd>
            <dt>{{ 'payments.date' | translate }}</dt>
            <dd>{{ formatDate(selectedDetail()?.transaction?.createdAt) }}</dd>
            <dt>{{ 'payments.gatewayOrder' | translate }}</dt>
            <dd>{{ selectedDetail()?.transaction?.gatewayOrderId || '—' }}</dd>
            <dt>{{ 'payments.gatewayPayment' | translate }}</dt>
            <dd>{{ selectedDetail()?.transaction?.gatewayPaymentId || '—' }}</dd>
            <dt>{{ 'payments.invoice' | translate }}</dt>
            <dd>{{ selectedDetail()?.transaction?.invoiceNumber || '—' }}</dd>
            <dt>{{ 'payments.receipt' | translate }}</dt>
            <dd>{{ selectedDetail()?.transaction?.receiptNumber || '—' }}</dd>
          </dl>

          <h3>{{ 'payments.attempts' | translate }}</h3>
          @if ((selectedDetail()?.attempts?.length ?? 0) === 0) {
            <p class="empty">{{ 'payments.noAttempts' | translate }}</p>
          } @else {
            <table>
              <thead>
                <tr><th>#</th><th>{{ 'payments.amount' | translate }}</th><th>{{ 'payments.status' | translate }}</th><th>{{ 'payments.at' | translate }}</th></tr>
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

          <h3>{{ 'payments.refunds' | translate }}</h3>
          @if ((selectedDetail()?.refunds?.length ?? 0) === 0) {
            <p class="empty">{{ 'payments.noRefunds' | translate }}</p>
          } @else {
            <table>
              <thead>
                <tr><th>{{ 'payments.amount' | translate }}</th><th>{{ 'payments.type' | translate }}</th><th>{{ 'payments.status' | translate }}</th><th>{{ 'payments.reason' | translate }}</th></tr>
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
  private readonly localeService = inject(LocaleService);
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
    return this.localeService.formatCurrency(amount ?? 0, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  formatDate(value?: string): string {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : this.localeService.formatDate(d);
  }
}
