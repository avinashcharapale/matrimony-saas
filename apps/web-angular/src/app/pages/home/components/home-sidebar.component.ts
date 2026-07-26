import { Component, ChangeDetectionStrategy, Input, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SubscriptionStatusDto } from '@org/generated';
import { SubscriptionStatusCardComponent } from './subscription-status-card.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home-sidebar',
  standalone: true,
  imports: [RouterModule, SubscriptionStatusCardComponent],
  templateUrl: './home-sidebar.component.html',
  styleUrl: '../home.css',
})
export class HomeSidebarComponent {
  @Input({ required: true }) brandMark!: string;
  @Input({ required: true }) tenantDisplayName!: string;
  @Input() subscriptionStatus: SubscriptionStatusDto | null = null;
  @Input() subscriptionLoading = false;

  private readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout().subscribe();
  }
}
