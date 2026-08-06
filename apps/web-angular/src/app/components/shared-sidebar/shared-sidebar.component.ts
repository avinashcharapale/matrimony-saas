import { Component, ChangeDetectionStrategy, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SidebarService } from '../../services/sidebar.service';
import { TenantService } from '../../services/tenant.service';
import { SubscriptionStatusDto } from '@org/generated';
import { SubscriptionStatusCardComponent } from '../../pages/home/components/subscription-status-card.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-shared-sidebar',
  standalone: true,
  imports: [RouterModule, SubscriptionStatusCardComponent],
  templateUrl: './shared-sidebar.component.html',
  styleUrl: './shared-sidebar.css',
})
export class SharedSidebarComponent {
  @Input() userName = '';
  @Input() userPhotoUrl = '';
  @Input() userOccupation = '';
  @Input() subscriptionStatus: SubscriptionStatusDto | null = null;
  @Input() subscriptionLoading = false;

  private readonly authService = inject(AuthService);
  private readonly sidebarService = inject(SidebarService);
  private readonly tenantService = inject(TenantService);

  readonly tenant = this.tenantService.tenant;
  readonly isOpen = this.sidebarService.isOpen;

  closeSidebar(): void {
    this.sidebarService.close();
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}
