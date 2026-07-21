import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { BillingRepository } from './billing.repository';
import { PaymentTransactionDto, CheckoutRequestDto, CheckoutResponseDto } from '@org/generated';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

export interface BillingState {
  checkoutResult: CheckoutResponseDto | null;
  paymentHistory: PaymentTransactionDto[];
  selectedPayment: PaymentTransactionDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: BillingState = {
  checkoutResult: null,
  paymentHistory: [],
  selectedPayment: null,
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

    loadPaymentHistory(subscriptionId: number) {
      patchState(store, { loading: true, error: null });

      return repository.getPaymentsBySubscription(subscriptionId).pipe(
        tap((payments) => {
          patchState(store, { paymentHistory: payments ?? [], loading: false });
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

    loadPaymentStatus(paymentId: string) {
      patchState(store, { loading: true, error: null });

      return repository.getPaymentStatus(paymentId).pipe(
        tap((payment) => {
          patchState(store, { selectedPayment: payment, loading: false });
        }),
        catchError((error: unknown) => {
          const message =
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: unknown }).message)
              : 'Failed to load payment status';
          patchState(store, { loading: false, error: message });
          return of(null);
        }),
      );
    },

    clearCheckoutResult() {
      patchState(store, { checkoutResult: null });
    },

    clearError() {
      patchState(store, { error: null });
    },
  })),
);
