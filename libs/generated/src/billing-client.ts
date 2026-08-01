import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BillingClient {
  private readonly http = inject(HttpClient);

  processWebhook(paymentGatewayId: number, body: any): Observable<void> {
    return this.http.post<void>(`/billing/webhooks/${paymentGatewayId}`, body);
  }
}
