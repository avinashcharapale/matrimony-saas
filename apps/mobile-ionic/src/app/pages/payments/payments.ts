import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { BillingStore } from '@org/data-access-billing';
import { PaymentTransactionDetailDto } from '@org/generated';

type PaymentsTab = 'transactions' | 'invoices' | 'wallet';

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

  readonly activeTab = signal<PaymentsTab>('transactions');
  readonly selectedDetail = signal<PaymentTransactionDetailDto | null>(null);

  ngOnInit(): void {
    this.billingStore.loadMyPaymentHistory().subscribe();
    this.billingStore.loadMyInvoices().subscribe();
    this.billingStore.loadMyWallet().subscribe();
    this.billingStore.loadMyWalletTransactions(50).subscribe();
  }

  setTab(tab: string | number | null | undefined): void {
    const value = String(tab ?? '');
    if (value === 'transactions' || value === 'invoices' || value === 'wallet') {
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
