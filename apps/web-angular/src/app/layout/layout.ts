import { Component, ChangeDetectionStrategy, inject, computed, HostListener, ElementRef, OnInit, AfterViewInit, effect } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TenantService } from '../services/tenant.service';
import { AuthService } from '../services/auth.service';
import { SidebarService } from '../services/sidebar.service';
import { LoaderComponent } from '../components/loader/loader.component';
import { TplNavComponent } from '../components/tpl-nav/tpl-nav.component';
import { ThemeService } from '@org/core';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, TranslateModule, LoaderComponent, TplNavComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit, AfterViewInit {
  private readonly tenantService = inject(TenantService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly sidebarService = inject(SidebarService);
  private readonly themeService = inject(ThemeService);
  private readonly el = inject(ElementRef);
  readonly tenant = this.tenantService.tenant;

  readonly isLanding = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url.split('?')[0] === '/'),
    ),
    { initialValue: this.router.url.split('?')[0] === '/' },
  );

  readonly toolbarContact = computed(() => {
    const phone = this.tenant.contacts?.find((c) => c.type === 'Phone' || c.type === 'WhatsApp');
    const email = this.tenant.contacts?.find((c) => c.type === 'Email');
    const parts = [phone?.value, email?.value].filter(Boolean);
    return parts.join(' | ');
  });

  readonly isLoggedIn = computed(() => this.authService.isAuthenticated());

  readonly sidebarOpen = this.sidebarService.isOpen;

  readonly brandName = computed(
    () => this.tenant.displayName || `${this.template.brand} Matrimony`,
  );

  readonly brandLetter = computed(
    () => this.brandName().trim().charAt(0).toUpperCase() || 'M',
  );

  readonly templateId = computed(() => this.template.id);

  readonly templateNavDark = computed(
    () =>
      typeof this.template.nav === 'object' && !!this.template.nav?.dark,
  );

  readonly templateBtnClass = computed(() => 'btn-' + this.template.btn);

  readonly navStyle = computed(() => {
    void this.tenantService.tenantVersion();
    return this.themeService.themeVars();
  });

  ngOnInit(): void {
    this.tenantService.tenantVersion$.subscribe(() => {
      requestAnimationFrame(() => this.applyTemplateToTplRoot());
    });
  }

  ngAfterViewInit(): void {
    this.applyTemplateToTplRoot();
  }

  private applyTemplateToTplRoot(): void {
    const tplRoot = this.el.nativeElement.querySelector('.tpl-root') as HTMLElement | null;
    if (!tplRoot) return;
    this.themeService.applyToElement(tplRoot);
  }

  private get template() {
    return this.tenantService.template;
  }

  private get templateOverrides() {
    return this.tenantService.templateOverrides;
  }

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