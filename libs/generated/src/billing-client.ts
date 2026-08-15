import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
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
  PaymentSettingsDto,
  SaveTenantPaymentSettingsRequest,
  GetGatewayConfigurationDto,
  SaveGatewayConfigurationRequest,
  OfflinePendingPaymentDto,
} from './dtos';

@Injectable({ providedIn: 'root' })
export class BillingClient {
  private readonly http = inject(HttpClient);

  private tenantHeaders(tenantId?: number): HttpHeaders | undefined {
    return tenantId ? new HttpHeaders({ 'x-tenant-id': String(tenantId) }) : undefined;
  }

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

  getPendingOfflinePayments(): Observable<OfflinePendingPaymentDto[]> {
    return this.http.get<OfflinePendingPaymentDto[]>('/billing/payment-transactions/offline/pending');
  }

  approveOfflinePayment(transactionId: number): Observable<{ transactionId?: number; status?: string }> {
    return this.http.post<{ transactionId?: number; status?: string }>(`/billing/payment-transactions/offline/${transactionId}/approve`, {});
  }

  reportOfflinePayment(transactionId: number): Observable<{ transactionId?: number; status?: string }> {
    return this.http.post<{ transactionId?: number; status?: string }>(`/billing/payment-transactions/offline/${transactionId}/report`, {});
  }

  getPaymentSettings(tenantId?: number): Observable<PaymentSettingsDto> {
    return this.http.get<PaymentSettingsDto>('/billing/payment-settings', { headers: this.tenantHeaders(tenantId) });
  }

  savePaymentSettings(body: SaveTenantPaymentSettingsRequest, tenantId?: number): Observable<PaymentSettingsDto> {
    return this.http.put<PaymentSettingsDto>('/billing/payment-settings', body, { headers: this.tenantHeaders(tenantId) });
  }

  getGatewayConfigurations(tenantId?: number): Observable<GetGatewayConfigurationDto[]> {
    return this.http.get<GetGatewayConfigurationDto[]>('/billing/gateway-configurations', { headers: this.tenantHeaders(tenantId) });
  }

  getGatewayConfigurationById(id: number, tenantId?: number): Observable<GetGatewayConfigurationDto> {
    return this.http.get<GetGatewayConfigurationDto>(`/billing/gateway-configurations/${id}`, { headers: this.tenantHeaders(tenantId) });
  }

  createGatewayConfiguration(body: SaveGatewayConfigurationRequest, tenantId?: number): Observable<GetGatewayConfigurationDto> {
    return this.http.post<GetGatewayConfigurationDto>('/billing/gateway-configurations', body, { headers: this.tenantHeaders(tenantId) });
  }

  updateGatewayConfiguration(id: number, body: SaveGatewayConfigurationRequest, tenantId?: number): Observable<GetGatewayConfigurationDto> {
    return this.http.put<GetGatewayConfigurationDto>(`/billing/gateway-configurations/${id}`, body, { headers: this.tenantHeaders(tenantId) });
  }

  deleteGatewayConfiguration(id: number, tenantId?: number): Observable<void> {
    return this.http.delete<void>(`/billing/gateway-configurations/${id}`, { headers: this.tenantHeaders(tenantId) });
  }

  getMyInvoices(): Observable<InvoiceDto[]> {
    return this.http.get<InvoiceDto[]>('/billing/invoices/my');
  }

  getUserInvoices(userId: number): Observable<InvoiceDto[]> {
    return this.http.get<InvoiceDto[]>(`/billing/invoices/user/${userId}`);
  }

  downloadInvoicePdf(invoiceId: number): Observable<Blob> {
    return this.http.get(`/billing/invoices/${invoiceId}/pdf`, { responseType: 'blob' });
  }

  downloadReceiptPdf(receiptId: number): Observable<Blob> {
    return this.http.get(`/billing/receipts/${receiptId}/pdf`, { responseType: 'blob' });
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
