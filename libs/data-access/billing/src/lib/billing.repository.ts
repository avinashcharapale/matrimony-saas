import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  BillingClient,
  SubscriptionClient,
  CheckoutRequestDto,
  CheckoutResponseDto,
  InvoiceDto,
  PaymentHistorySearchRequest,
  PaymentMethodDto,
  PaymentTransactionDetailDto,
  PaymentTransactionHistoryDto,
  PaymentTransactionHistoryDtoPagedResult,
  WalletDto,
  WalletTransactionDto,
} from '@org/generated';

@Injectable({ providedIn: 'root' })
export class BillingRepository {
  private readonly billing = inject(BillingClient);
  private readonly subscriptions = inject(SubscriptionClient);

  checkout(body: CheckoutRequestDto): Observable<CheckoutResponseDto> {
    return this.subscriptions.checkout(body);
  }

  getMyPaymentTransactions(): Observable<PaymentTransactionHistoryDto[]> {
    return this.billing.getMyPaymentTransactions();
  }

  getPaymentTransactionById(transactionId: number): Observable<PaymentTransactionDetailDto> {
    return this.billing.getPaymentTransactionById(transactionId);
  }

  getUserPaymentTransactions(userId: number): Observable<PaymentTransactionHistoryDto[]> {
    return this.billing.getUserPaymentTransactions(userId);
  }

  getTenantPaymentTransactions(request?: PaymentHistorySearchRequest): Observable<PaymentTransactionHistoryDtoPagedResult> {
    return this.billing.getTenantPaymentTransactions(request);
  }

  getMyInvoices(): Observable<InvoiceDto[]> {
    return this.billing.getMyInvoices();
  }

  getUserInvoices(userId: number): Observable<InvoiceDto[]> {
    return this.billing.getUserInvoices(userId);
  }

  getMyPaymentMethods(): Observable<PaymentMethodDto[]> {
    return this.billing.getMyPaymentMethods();
  }

  getMyWallet(): Observable<WalletDto> {
    return this.billing.getMyWallet();
  }

  getMyWalletTransactions(limit?: number): Observable<WalletTransactionDto[]> {
    return this.billing.getMyWalletTransactions(limit);
  }
}
