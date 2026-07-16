import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TenantService } from '../services/tenant.service';
import { AuthService } from '../services/auth.service';
import { LoaderComponent } from '../components/loader/loader.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, LoaderComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private readonly tenantService = inject(TenantService);
  private readonly authService = inject(AuthService);
  readonly tenant = this.tenantService.tenant;

  readonly isLoggedIn = computed(() => this.authService.isAuthenticated());

  isMobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}
