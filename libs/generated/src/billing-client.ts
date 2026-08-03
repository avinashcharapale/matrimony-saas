import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  InvoiceDto,
  PaymentHistorySearchRequest,
  PaymentMethodDto,
  PaymentTransactionDetailDto,
  PaymentTransactionHistoryDto,
  PaymentTransactionHistoryDtoPagedResult,
  WalletDto,
  WalletTransactionDto,
} from './dtos';

@Injectable({ providedIn: 'root' })
export class BillingClient {
  private readonly http = inject(HttpClient);

  processWebhook(paymentGatewayId: number, body: any): Observable<void> {
    return this.http.post<void>(`/billing/webhooks/${paymentGatewayId}`, body);
  }

  getMyPaymentTransactions(): Observable<PaymentTransactionHistoryDto[]> {
    return this.http.get<PaymentTransactionHistoryDto[]>('/billing/payment-transactions/my');
  }

  getPaymentTransactionById(transactionId: number): Observable<PaymentTransactionDetailDto> {
    return this.http.get<PaymentTransactionDetailDto>(`/billing/payment-transactions/${transactionId}`);
  }

  getUserPaymentTransactions(userId: number): Observable<PaymentTransactionHistoryDto[]> {
    return this.http.get<PaymentTransactionHistoryDto[]>(`/billing/payment-transactions/user/${userId}`);
  }

  getTenantPaymentTransactions(request?: PaymentHistorySearchRequest): Observable<PaymentTransactionHistoryDtoPagedResult> {
    let params = new HttpParams();
    if (request?.userId) params = params.set('userId', request.userId);
    if (request?.status) params = params.set('status', request.status);
    if (request?.pageNumber) params = params.set('pageNumber', request.pageNumber);
    if (request?.pageSize) params = params.set('pageSize', request.pageSize);
    return this.http.get<PaymentTransactionHistoryDtoPagedResult>('/billing/payment-transactions', { params });
  }

  getMyInvoices(): Observable<InvoiceDto[]> {
    return this.http.get<InvoiceDto[]>('/billing/invoices/my');
  }

  getUserInvoices(userId: number): Observable<InvoiceDto[]> {
    return this.http.get<InvoiceDto[]>(`/billing/invoices/user/${userId}`);
  }

  getMyPaymentMethods(): Observable<PaymentMethodDto[]> {
    return this.http.get<PaymentMethodDto[]>('/billing/payment-methods/my');
  }

  getMyWallet(): Observable<WalletDto> {
    return this.http.get<WalletDto>('/billing/wallets/my');
  }

  getMyWalletTransactions(limit?: number): Observable<WalletTransactionDto[]> {
    let params = new HttpParams();
    if (limit) params = params.set('limit', limit);
    return this.http.get<WalletTransactionDto[]>('/billing/wallets/my/transactions', { params });
  }
}
