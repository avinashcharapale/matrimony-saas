import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
  BillingClient,
  SubscriptionClient,
  CheckoutRequestDto,
  CheckoutResponseDto,
  RecordCashPaymentRequestDto,
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
} from '@org/generated';

@Injectable({ providedIn: 'root' })
export class BillingRepository {
  private readonly billing = inject(BillingClient);
  private readonly subscriptions = inject(SubscriptionClient);

  checkout(body: CheckoutRequestDto): Observable<CheckoutResponseDto> {
    return this.subscriptions.checkout(body);
  }

  recordCashPayment(body: RecordCashPaymentRequestDto): Observable<CheckoutResponseDto> {
    return this.subscriptions.recordCashPayment(body);
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

  getPaymentSettings(): Observable<PaymentSettingsDto> {
    return this.billing.getPaymentSettings();
  }

  savePaymentSettings(body: SaveTenantPaymentSettingsRequest): Observable<PaymentSettingsDto> {
    return this.billing.savePaymentSettings(body);
  }

  getGatewayConfigurations(): Observable<GetGatewayConfigurationDto[]> {
    return this.billing.getGatewayConfigurations();
  }

  createGatewayConfiguration(body: SaveGatewayConfigurationRequest): Observable<GetGatewayConfigurationDto> {
    return this.billing.createGatewayConfiguration(body);
  }

  updateGatewayConfiguration(id: number, body: SaveGatewayConfigurationRequest): Observable<GetGatewayConfigurationDto> {
    return this.billing.updateGatewayConfiguration(id, body);
  }

  deleteGatewayConfiguration(id: number): Observable<void> {
    return this.billing.deleteGatewayConfiguration(id);
  }

  getPendingOfflinePayments(): Observable<OfflinePendingPaymentDto[]> {
    return this.billing.getPendingOfflinePayments();
  }

  approveOfflinePayment(transactionId: number): Observable<{ transactionId?: number; status?: string }> {
    return this.billing.approveOfflinePayment(transactionId);
  }

  reportOfflinePayment(transactionId: number): Observable<{ transactionId?: number; status?: string }> {
    return this.billing.reportOfflinePayment(transactionId);
  }

  downloadInvoicePdf(invoiceId: number, filename?: string): Observable<Blob> {
    return this.billing.downloadInvoicePdf(invoiceId).pipe(
      tap((blob) => saveBlob(blob, filename ?? `invoice-${invoiceId}.pdf`)),
    );
  }

  downloadReceiptPdf(receiptId: number, filename?: string): Observable<Blob> {
    return this.billing.downloadReceiptPdf(receiptId).pipe(
      tap((blob) => saveBlob(blob, filename ?? `receipt-${receiptId}.pdf`)),
    );
  }
}

function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
