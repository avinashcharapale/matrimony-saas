import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, computed, inject, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { LocaleService } from '@org/i18n';
import { BillingStore, BillingRepository } from '@org/data-access-billing';
import { PaymentTransactionDetailDto, InvoiceDto, ReceiptDto } from '@org/generated';

type PaymentsTab = 'transactions' | 'invoices' | 'methods' | 'wallet';

const PAID_TRANSACTION_STATUSES = new Set(['success', 'completed', 'succeeded', 'captured', 'paid']);

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-payments',
  standalone: true,
  imports: [IonicModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './payments.html',
  styleUrl: './payments.css',
})
export class Payments implements OnInit {
  readonly billingStore = inject(BillingStore);
  private readonly billingRepository = inject(BillingRepository);
  private readonly localeService = inject(LocaleService);

  readonly activeTab = signal<PaymentsTab>('transactions');
  readonly selectedDetail = signal<PaymentTransactionDetailDto | null>(null);

  readonly methods = this.billingStore.myPaymentMethods;

  readonly totalSpent = computed(() =>
    this.billingStore
      .myPaymentHistory()
      .filter((tx) => PAID_TRANSACTION_STATUSES.has((tx.status ?? '').toLowerCase()))
      .reduce((sum, tx) => sum + (tx.amount ?? 0) - (tx.refundedAmount ?? 0), 0),
  );

  readonly walletBalance = computed(() => {
    const w = this.billingStore.wallet();
    return w ? `${w.currencyCode ?? 'INR'} ${(w.balance ?? 0).toFixed(2)}` : '—';
  });

  readonly paymentMethodsCount = computed(() => this.methods().length);
  readonly invoicesCount = computed(() => this.billingStore.myInvoices().length);

  ngOnInit(): void {
    this.billingStore.loadMyPaymentHistory().subscribe();
    this.billingStore.loadMyInvoices().subscribe();
    this.billingStore.loadMyPaymentMethods().subscribe();
    this.billingStore.loadMyWallet().subscribe();
    this.billingStore.loadMyWalletTransactions(50).subscribe();
  }

  setTab(tab: string | number | null | undefined): void {
    const value = String(tab ?? '');
    if (value === 'transactions' || value === 'invoices' || value === 'methods' || value === 'wallet') {
      this.activeTab.set(value);
    }
  }

  openDetail(transactionId: number): void {
    this.billingStore.loadPaymentDetail(transactionId).subscribe({
      next: (detail) => this.selectedDetail.set(detail),
    });
  }

  closeDetail(): void {
    this.selectedDetail.set(null);
  }

  downloadInvoicePdf(inv: InvoiceDto): void {
    this.billingRepository.downloadInvoicePdf(inv.invoiceId ?? 0, `${inv.invoiceNumber}.pdf`).subscribe();
  }

  downloadReceiptPdf(rc: ReceiptDto): void {
    this.billingRepository.downloadReceiptPdf(rc.receiptId ?? 0, `${rc.receiptNumber}.pdf`).subscribe();
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
