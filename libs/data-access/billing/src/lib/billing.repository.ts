import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  BillingClient,
  PaymentTransactionDto,
  CheckoutRequestDto,
  CheckoutResponseDto,
} from '@org/generated';

@Injectable({ providedIn: 'root' })
export class BillingRepository {
  private readonly billing = inject(BillingClient);

  checkout(body: CheckoutRequestDto): Observable<CheckoutResponseDto> {
    return this.billing.checkout(body);
  }

  getPaymentStatus(paymentId: string): Observable<PaymentTransactionDto> {
    return this.billing.getPaymentStatus(paymentId);
  }

  getPaymentsBySubscription(subscriptionId: number): Observable<PaymentTransactionDto[]> {
    return this.billing.getPaymentsBySubscription(subscriptionId);
  }
}
