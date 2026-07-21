import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentTransactionDto, CheckoutRequestDto, CheckoutResponseDto } from './dtos';

@Injectable({ providedIn: 'root' })
export class BillingClient {
  private readonly http = inject(HttpClient);

  checkout(body: CheckoutRequestDto): Observable<CheckoutResponseDto> {
    return this.http.post<CheckoutResponseDto>('/subscription/Payments/checkout', body);
  }

  getPaymentStatus(paymentId: string): Observable<PaymentTransactionDto> {
    return this.http.get<PaymentTransactionDto>(`/subscription/Payments/${paymentId}`);
  }

  getPaymentsBySubscription(subscriptionId: number): Observable<PaymentTransactionDto[]> {
    return this.http.get<PaymentTransactionDto[]>(`/subscription/Payments/subscription/${subscriptionId}`);
  }
}
