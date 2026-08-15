import { Injectable, inject } from '@angular/core';
import { Observable, from, of, switchMap } from 'rxjs';
import { SubscriptionClient, BillingClient, CheckoutResponseDto, PaymentStatusDto } from '@org/generated';

const RAZORPAY_KEY_ID_FALLBACK = 'rzp_test_TPxdJho1HROCW1';
const RAZORPAY_CURRENCY = 'INR';
const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

export type RazorpayOutcome = 'success' | 'failed' | 'dismiss';

export type OfflinePaymentMethod = 'upi' | 'bank_transfer';

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: Record<string, string>;
  handler: (response: RazorpayPaymentResponse) => void;
  modal: { ondismiss: () => void };
}

interface RazorpayCheckout {
  open: () => void;
  close: () => void;
  on: (event: string, callback: (response?: RazorpayPaymentResponse) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayCheckout;
  }
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly subscriptionClient = inject(SubscriptionClient);
  private readonly billingClient = inject(BillingClient);

  private razorpayScriptPromise: Promise<void> | null = null;

  checkout(planId: number, paymentMethod?: string): Observable<CheckoutResponseDto> {
    return this.subscriptionClient.checkout({ subscriptionPlanId: planId, paymentMethod });
  }

  getPaymentStatus(gatewayOrderId: string): Observable<PaymentStatusDto> {
    return this.subscriptionClient.getPaymentStatus(gatewayOrderId);
  }

  reportOfflinePayment(transactionId: number): Observable<{ transactionId?: number; status?: string }> {
    return this.billingClient.reportOfflinePayment(transactionId);
  }

  openRazorpay(checkout: CheckoutResponseDto): Observable<RazorpayOutcome> {
    const amountPaise = Math.round((checkout.amount ?? 0) * 100);
    const orderId = checkout.orderId ?? '';
    const razorpayKey = checkout.razorpayKeyId ?? RAZORPAY_KEY_ID_FALLBACK;
    return from(this.ensureRazorpayLoaded()).pipe(
      switchMap(() => {
        const RazorpayCtor = window.Razorpay;
        if (!RazorpayCtor || !orderId) {
          return of<RazorpayOutcome>('dismiss');
        }
        return new Observable<RazorpayOutcome>((subscriber) => {
          let settled = false;
          const finish = (outcome: RazorpayOutcome): void => {
            if (settled) return;
            settled = true;
            subscriber.next(outcome);
            subscriber.complete();
          };
          const options: RazorpayOptions = {
            key: razorpayKey,
            amount: amountPaise,
            currency: RAZORPAY_CURRENCY,
            name: 'Matrimony SaaS',
            description: checkout.planName ?? 'Subscription',
            order_id: orderId,
            prefill: {},
            handler: () => finish('success'),
            modal: { ondismiss: () => finish('dismiss') },
          };
          const razorpay = new RazorpayCtor(options);
          razorpay.on('payment.failed', () => finish('failed'));
          razorpay.open();
          return () => {
            try {
              razorpay.close();
            } catch {
              // modal already closed
            }
          };
        });
      }),
    );
  }

  private ensureRazorpayLoaded(): Promise<void> {
    if (window.Razorpay) return Promise.resolve();
    if (this.razorpayScriptPromise) return this.razorpayScriptPromise;
    this.razorpayScriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = RAZORPAY_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        this.razorpayScriptPromise = null;
        reject(new Error('Failed to load Razorpay SDK'));
      };
      document.head.appendChild(script);
    });
    return this.razorpayScriptPromise;
  }
}
