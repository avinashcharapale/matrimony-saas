import { Component, ChangeDetectionStrategy, inject, computed, HostListener } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TenantService } from '../services/tenant.service';
import { AuthService } from '../services/auth.service';
import { SidebarService } from '../services/sidebar.service';
import { LoaderComponent } from '../components/loader/loader.component';
import { LanguageSelectorComponent } from '../components/language-selector/language-selector.component';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, TranslateModule, LoaderComponent, LanguageSelectorComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private readonly tenantService = inject(TenantService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly sidebarService = inject(SidebarService);
  readonly tenant = this.tenantService.tenant;

  readonly toolbarContact = computed(() => {
    const phone = this.tenant.contacts?.find((c) => c.type === 'Phone' || c.type === 'WhatsApp');
    const email = this.tenant.contacts?.find((c) => c.type === 'Email');
    const parts = [phone?.value, email?.value].filter(Boolean);
    return parts.join(' | ');
  });

  readonly isLoggedIn = computed(() => this.authService.isAuthenticated());

  readonly sidebarOpen = this.sidebarService.isOpen;

  flagEnabled(code: string): boolean {
    return this.tenantService.flagEnabled(code);
  }

  toggleMobileMenu(): void {
    this.sidebarService.toggle();
  }

  closeMobileMenu(): void {
    this.sidebarService.close();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (window.innerWidth > 900) {
      this.sidebarService.close();
    }
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}
