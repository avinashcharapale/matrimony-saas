import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TenantService } from '../services/tenant.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private readonly tenantService = inject(TenantService);
  readonly tenant = this.tenantService.tenant;

  isMobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
}
