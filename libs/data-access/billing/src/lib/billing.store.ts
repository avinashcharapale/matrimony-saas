import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { BillingRepository } from './billing.repository';
import {
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
  PaymentSettingsDto,
  SaveTenantPaymentSettingsRequest,
  GetGatewayConfigurationDto,
  SaveGatewayConfigurationRequest,
  OfflinePendingPaymentDto,
} from '@org/generated';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

export interface BillingState {
  checkoutResult: CheckoutResponseDto | null;
  myPaymentHistory: PaymentTransactionHistoryDto[];
  selectedPaymentDetail: PaymentTransactionDetailDto | null;
  tenantPayments: PaymentTransactionHistoryDtoPagedResult | null;
  myInvoices: InvoiceDto[];
  myPaymentMethods: PaymentMethodDto[];
  wallet: WalletDto | null;
  walletTransactions: WalletTransactionDto[];
  paymentSettings: PaymentSettingsDto | null;
  gatewayConfigurations: GetGatewayConfigurationDto[];
  pendingOfflinePayments: OfflinePendingPaymentDto[];
  loading: boolean;
  error: string | null;
}

const initialState: BillingState = {
  checkoutResult: null,
  myPaymentHistory: [],
  selectedPaymentDetail: null,
  tenantPayments: null,
  myInvoices: [],
  myPaymentMethods: [],
  wallet: null,
  walletTransactions: [],
  paymentSettings: null,
  gatewayConfigurations: [],
  pendingOfflinePayments: [],
  loading: false,
  error: null,
};

export const BillingStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, repository = inject(BillingRepository)) => ({
    checkout(body: CheckoutRequestDto) {
      patchState(store, { loading: true, error: null });

      return repository.checkout(body).pipe(
        tap((result) => {
          patchState(store, { checkoutResult: result, loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Checkout failed';
          patchState(store, { loading: false, error: message });
          return of(null);
        }),
      );
    },

    loadMyPaymentHistory() {
      patchState(store, { loading: true, error: null });

      return repository.getMyPaymentTransactions().pipe(
        tap((payments) => {
          patchState(store, { myPaymentHistory: payments ?? [], loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to load payment history';
          patchState(store, { loading: false, error: message });
          return of([]);
        }),
      );
    },

    loadPaymentDetail(transactionId: number) {
      patchState(store, { loading: true, error: null });

      return repository.getPaymentTransactionById(transactionId).pipe(
        tap((detail) => {
          patchState(store, { selectedPaymentDetail: detail, loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to load payment detail';
          patchState(store, { loading: false, error: message });
          return of(null);
        }),
      );
    },

    loadTenantPayments(request?: PaymentHistorySearchRequest) {
      patchState(store, { loading: true, error: null });

      return repository.getTenantPaymentTransactions(request).pipe(
        tap((paged) => {
          patchState(store, { tenantPayments: paged, loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to load payments';
          patchState(store, { loading: false, error: message });
          return of(null);
        }),
      );
    },

    loadMyInvoices() {
      patchState(store, { loading: true, error: null });

      return repository.getMyInvoices().pipe(
        tap((invoices) => {
          patchState(store, { myInvoices: invoices ?? [], loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to load invoices';
          patchState(store, { loading: false, error: message });
          return of([]);
        }),
      );
    },

    loadMyPaymentMethods() {
      patchState(store, { loading: true, error: null });

      return repository.getMyPaymentMethods().pipe(
        tap((methods) => {
          patchState(store, { myPaymentMethods: methods ?? [], loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to load payment methods';
          patchState(store, { loading: false, error: message });
          return of([]);
        }),
      );
    },

    loadMyWallet() {
      patchState(store, { loading: true, error: null });

      return repository.getMyWallet().pipe(
        tap((wallet) => {
          patchState(store, { wallet, loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to load wallet';
          patchState(store, { loading: false, error: message });
          return of(null);
        }),
      );
    },

    loadMyWalletTransactions(limit?: number) {
      patchState(store, { loading: true, error: null });

      return repository.getMyWalletTransactions(limit).pipe(
        tap((transactions) => {
          patchState(store, { walletTransactions: transactions ?? [], loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to load wallet transactions';
          patchState(store, { loading: false, error: message });
          return of([]);
        }),
      );
    },

    loadPaymentSettings() {
      patchState(store, { loading: true, error: null });

      return repository.getPaymentSettings().pipe(
        tap((settings) => {
          patchState(store, { paymentSettings: settings, loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to load payment settings';
          patchState(store, { loading: false, error: message });
          return of(null);
        }),
      );
    },

    savePaymentSettings(body: SaveTenantPaymentSettingsRequest) {
      patchState(store, { loading: true, error: null });

      return repository.savePaymentSettings(body).pipe(
        tap((settings) => {
          patchState(store, { paymentSettings: settings, loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to save payment settings';
          patchState(store, { loading: false, error: message });
          return of(null);
        }),
      );
    },

    loadGatewayConfigurations() {
      patchState(store, { loading: true, error: null });

      return repository.getGatewayConfigurations().pipe(
        tap((configs) => {
          patchState(store, { gatewayConfigurations: configs ?? [], loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to load gateway configurations';
          patchState(store, { loading: false, error: message });
          return of([]);
        }),
      );
    },

    createGatewayConfiguration(body: SaveGatewayConfigurationRequest) {
      patchState(store, { loading: true, error: null });

      return repository.createGatewayConfiguration(body).pipe(
        tap(() => {
          patchState(store, { loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to create gateway configuration';
          patchState(store, { loading: false, error: message });
          return of(null);
        }),
      );
    },

    updateGatewayConfiguration(id: number, body: SaveGatewayConfigurationRequest) {
      patchState(store, { loading: true, error: null });

      return repository.updateGatewayConfiguration(id, body).pipe(
        tap(() => {
          patchState(store, { loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to update gateway configuration';
          patchState(store, { loading: false, error: message });
          return of(null);
        }),
      );
    },

    deleteGatewayConfiguration(id: number) {
      patchState(store, { loading: true, error: null });

      return repository.deleteGatewayConfiguration(id).pipe(
        tap(() => {
          patchState(store, {
            gatewayConfigurations: store.gatewayConfigurations().filter((c) => c.gatewayConfigurationId !== id),
            loading: false,
          });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to delete gateway configuration';
          patchState(store, { loading: false, error: message });
          return of(null);
        }),
      );
    },

    loadPendingOfflinePayments() {
      patchState(store, { loading: true, error: null });

      return repository.getPendingOfflinePayments().pipe(
        tap((payments) => {
          patchState(store, { pendingOfflinePayments: payments ?? [], loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to load offline payments';
          patchState(store, { loading: false, error: message });
          return of([]);
        }),
      );
    },

    approveOfflinePayment(transactionId: number) {
      patchState(store, { loading: true, error: null });

      return repository.approveOfflinePayment(transactionId).pipe(
        tap(() => {
          patchState(store, {
            pendingOfflinePayments: store.pendingOfflinePayments().filter((p) => p.transactionId !== transactionId),
            loading: false,
          });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to approve payment';
          patchState(store, { loading: false, error: message });
          return of(null);
        }),
      );
    },

    reportOfflinePayment(transactionId: number) {
      patchState(store, { loading: true, error: null });

      return repository.reportOfflinePayment(transactionId).pipe(
        tap(() => {
          patchState(store, { loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to report payment';
          patchState(store, { loading: false, error: message });
          return of(null);
        }),
      );
    },

    clearCheckoutResult() {
      patchState(store, { checkoutResult: null });
    },

    clearSelectedPaymentDetail() {
      patchState(store, { selectedPaymentDetail: null });
    },

    clearError() {
      patchState(store, { error: null });
    },
  })),
);
