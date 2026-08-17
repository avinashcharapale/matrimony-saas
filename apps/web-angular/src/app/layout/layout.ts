import { Component, ChangeDetectionStrategy, inject, computed, HostListener, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TenantService } from '../services/tenant.service';
import { AuthService } from '../services/auth.service';
import { SidebarService } from '../services/sidebar.service';
import { LoaderComponent } from '../components/loader/loader.component';
import { TplNavComponent } from '../components/tpl-nav/tpl-nav.component';
import { resolveTemplateStyleVars } from '@org/landing-templates';
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
    const { vars } = resolveTemplateStyleVars(
      this.tenantService.template,
      this.tenantService.templateOverrides,
    );
    const s: Record<string, string> = {};
    for (const k of Object.keys(vars)) s[`--${k}`] = vars[k];

    const p   = vars['tp-p']   || '#8e1f4f';
    const sec = vars['tp-s']   || '#d4a643';
    const sf  = vars['tp-sf']  || '#ecc97f';
    const pl  = vars['tp-pl']  || '#f7e7c3';
    const bg  = vars['tp-bg']  || '#fdf6ec';
    const bgd = vars['tp-bgd'] || '#f3e7d2';
    const card= vars['tp-card']|| '#fffefb';
    const t   = vars['tp-t']   || '#4a2438';
    const ts  = vars['tp-ts']  || '#7c5670';
    const od  = vars['tp-od']  || '#fff';
    const h   = vars['tp-h']   || "'Fraunces', serif";
    const b   = vars['tp-b']   || "'Manrope', sans-serif";
    const r   = vars['tp-r']   || '18px';
    const rl  = vars['tp-r-lg']|| '28px';
    const sh  = vars['tp-shadow'] || '0 12px 34px rgba(60,20,40,.10)';

    s['--tenant-primary']   = p;
    s['--tenant-accent']    = sec;
    s['--tenant-bg-start']  = bg;
    s['--tenant-bg-mid']    = bgd;
    s['--tenant-bg-end']    = pl;
    s['--tenant-text']      = t;
    s['--text-strong']      = t;
    s['--text-muted']       = ts;
    s['--text-subtle']      = ts;
    s['--surface-card']     = card;
    s['--surface-soft']     = bgd;
    s['--border-soft']      = pl;
    s['--border-strong']    = sec;
    s['--accent-strong']    = sec;
    s['--on-primary']       = od;
    s['--color-white']      = '#fff';
    s['--color-black']      = '#000';
    s['--theme-shadow-sm']  = sh;
    s['--theme-shadow-lg']  = '0 12px 40px color-mix(in srgb, ' + t + ' 18%, transparent)';
    s['--theme-radius-lg']  = rl;
    s['--theme-surface-overlay'] = 'rgba(0,0,0,.45)';
    s['--theme-page-background'] = bg;
    s['--theme-surface']         = card;
    s['--theme-surface-raised']  = '#fff';
    s['--theme-surface-soft']    = bgd;
    s['--theme-surface-subtle']  = bgd;
    s['--theme-accent-soft']     = `color-mix(in srgb, ${sf} 50%, #fff)`;
    s['--theme-border']          = pl;
    s['--theme-border-strong']   = sec;
    s['--theme-text']            = t;
    s['--theme-text-muted']      = ts;
    s['--theme-text-subtle']     = ts;
    s['--theme-focus']           = p;
    s['--theme-radius-sm']       = '12px';
    s['--theme-radius-md']       = r;
    s['--theme-shadow-md']       = sh;
    s['--font-heading']          = h;
    s['--font-body']             = b;

    return s;
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
    const { vars } = resolveTemplateStyleVars(
      this.tenantService.template,
      this.tenantService.templateOverrides,
    );
    for (const k of Object.keys(vars)) {
      tplRoot.style.setProperty(`--${k}`, vars[k]);
    }

    const p   = vars['tp-p']   || '#8e1f4f';
    const sec = vars['tp-s']   || '#d4a643';
    const sf  = vars['tp-sf']  || '#ecc97f';
    const pl  = vars['tp-pl']  || '#f7e7c3';
    const bg  = vars['tp-bg']  || '#fdf6ec';
    const bgd = vars['tp-bgd'] || '#f3e7d2';
    const card= vars['tp-card']|| '#fffefb';
    const t   = vars['tp-t']   || '#4a2438';
    const ts  = vars['tp-ts']  || '#7c5670';
    const od  = vars['tp-od']  || '#fff';
    const h   = vars['tp-h']   || "'Fraunces', serif";
    const b   = vars['tp-b']   || "'Manrope', sans-serif";
    const r   = vars['tp-r']   || '18px';
    const rl  = vars['tp-r-lg']|| '28px';
    const sh  = vars['tp-shadow'] || '0 12px 34px rgba(60,20,40,.10)';
    const aliases: [string, string][] = [
      ['--tenant-primary', p], ['--tenant-accent', sec],
      ['--tenant-bg-start', bg], ['--tenant-bg-mid', bgd], ['--tenant-bg-end', pl],
      ['--tenant-text', t], ['--text-strong', t], ['--text-muted', ts], ['--text-subtle', ts],
      ['--surface-card', card], ['--surface-soft', bgd],
      ['--border-soft', pl], ['--border-strong', sec], ['--accent-strong', sec],
      ['--on-primary', od], ['--color-white', '#fff'], ['--color-black', '#000'],
      ['--theme-shadow-sm', sh], ['--theme-shadow-lg', '0 12px 40px color-mix(in srgb, ' + t + ' 18%, transparent)'],
      ['--theme-radius-lg', rl],
      ['--theme-surface-overlay', 'rgba(0,0,0,.45)'],
      ['--theme-page-background', bg], ['--theme-surface', card], ['--theme-surface-raised', '#fff'],
      ['--theme-surface-soft', bgd], ['--theme-surface-subtle', bgd],
      ['--theme-accent-soft', `color-mix(in srgb, ${sf} 50%, #fff)`], ['--theme-border', pl], ['--theme-border-strong', sec],
      ['--theme-text', t], ['--theme-text-muted', ts], ['--theme-text-subtle', ts],
      ['--theme-focus', p], ['--theme-radius-sm', '12px'], ['--theme-radius-md', r],
      ['--theme-shadow-md', sh], ['--font-heading', h], ['--font-body', b],
    ];
    for (const [k, v] of aliases) {
      tplRoot.style.setProperty(k, v);
    }
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
