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
