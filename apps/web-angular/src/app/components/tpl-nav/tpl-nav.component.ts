import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, signal, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-tpl-nav',
  standalone: true,
  imports: [RouterModule, TranslateModule, LanguageSelectorComponent],
  styles: [
    `
      .logout-btn { background:none;border:1.5px solid var(--tp-s);color:var(--tp-s);padding:8px 18px;border-radius:2px;font-weight:600;cursor:pointer;font-size:13px;font-family:var(--tp-b);transition:background .18s ease,color .18s ease; }
      .logout-btn:hover { background:var(--tp-s);color:var(--tp-od); }
      @media (max-width: 760px) {
        .tpl-nav-wrap .nav-links { display: none; }
        .tpl-nav-wrap .nav-right { display: none; }
        .tpl-nav-wrap .nav-hamburger { display: block; }
        .nav-mobile-panel {
          display: flex; flex-direction: column;
          background: var(--tp-bg);
          padding: 12px 16px 16px;
          border-bottom: 1px solid var(--tp-pl);
          box-shadow: var(--theme-shadow-sm);
          font-family: var(--tp-b, 'Manrope', sans-serif);
        }
        .nav-mobile-panel a {
          padding: 13px 14px; font-size: 15px; color: var(--tp-t);
          border-bottom: 1px solid var(--tp-pl); font-weight: 700;
          border-radius: 8px; margin: 2px 0;
          transition: background .2s ease, color .2s ease;
          font-family: var(--tp-b, 'Manrope', sans-serif);
        }
        .nav-mobile-panel a:hover { background: color-mix(in srgb, var(--tp-s) 8%, transparent); color: var(--tp-s); }
        .nav-mobile-panel a.active {
          color: var(--tp-s); font-weight: 700;
          background: color-mix(in srgb, var(--tp-s) 12%, transparent);
        }
        .nav-mobile-panel a:last-child { border-bottom: none; }
        .nav-mobile-panel .nav-mobile-last { border-bottom: none; }
        .nav-mobile-panel .nav-login { color: var(--tp-s); font-weight: 700; }
        .nav-mobile-panel .tbtn { text-align: center; margin-top: 8px; }
        .nav-mobile-panel .logout-btn { width: 100%; text-align: center; margin-top: 4px; }
        .nav-mobile-divider { height: 1px; background: var(--tp-pl); margin: 8px 0; }
      }
    `,
  ],
  template: `
    <div class="tpl-root tpl-nav-wrap" [attr.data-tpl]="tplId" [style]="style">
      <div class="tpl-nav" [class.dark]="navDark" [style]="navDark ? 'background:var(--tp-ink);color:var(--tp-od);--td-nav-link-color:var(--tp-s);--td-nav-brand-color:var(--tp-od)' : ''">
        <div class="nav-brand" [routerLink]="isLoggedIn ? '/home' : '/'">
          @if (logoUrl) {
          <img [src]="logoUrl" [alt]="brandName + ' logo'" class="nav-logo-img" />
          } @else {
          <span class="nav-logo">{{ brandLetter }}</span>
          }
          <span>{{ brandName }}</span>
        </div>
        <div class="nav-links">
          @if (isLoggedIn) {
            <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">{{ 'nav.home' | translate }}</a>
            <a routerLink="/profiles" routerLinkActive="active">{{ 'nav.search' | translate }}</a>
            <a routerLink="/interests" routerLinkActive="active">{{ 'nav.interests' | translate }}</a>
            <a routerLink="/shortlists" routerLinkActive="active">{{ 'nav.shortlists' | translate }}</a>
            <a routerLink="/messages" routerLinkActive="active">{{ 'nav.messages' | translate }}</a>
          } @else {
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">{{ 'nav.home' | translate }}</a>
            <a routerLink="/search" routerLinkActive="active">{{ 'common.search' | translate }}</a>
            <a routerLink="/rules" routerLinkActive="active">{{ 'nav.howItWorks' | translate }}</a>
            <a routerLink="/plans" routerLinkActive="active">{{ 'nav.plans' | translate }}</a>
            <a routerLink="/contact" routerLinkActive="active">{{ 'nav.contact' | translate }}</a>
          }
        </div>
        <div class="nav-right">
          <app-language-selector></app-language-selector>
          @if (isLoggedIn) {
            <button class="logout-btn" (click)="logout.emit()">{{ 'nav.logout' | translate }}</button>
          } @else {
            <a class="nav-login" routerLink="/login" [style]="navDark ? 'color:var(--tp-od)' : 'color:var(--tp-s)'">{{ ctaLogin }}</a>
            <a class="tbtn {{ btnClass }} btn-sm" routerLink="/register">{{ ctaEnroll }}</a>
          }
        </div>
        <button class="nav-hamburger" [class.open]="mobileMenuOpen()" (click)="toggleMobileMenu()" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
      @if (mobileMenuOpen()) {
      <div class="nav-mobile-panel">
        @if (isLoggedIn) {
          <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="closeMobileMenu()">{{ 'nav.home' | translate }}</a>
          <a routerLink="/profiles" routerLinkActive="active" (click)="closeMobileMenu()">{{ 'nav.search' | translate }}</a>
          <a routerLink="/interests" routerLinkActive="active" (click)="closeMobileMenu()">{{ 'nav.interests' | translate }}</a>
          <a routerLink="/shortlists" routerLinkActive="active" (click)="closeMobileMenu()">{{ 'nav.shortlists' | translate }}</a>
          <a routerLink="/messages" routerLinkActive="active" (click)="closeMobileMenu()" class="nav-mobile-last">{{ 'nav.messages' | translate }}</a>
        } @else {
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="closeMobileMenu()">{{ 'nav.home' | translate }}</a>
          <a routerLink="/search" routerLinkActive="active" (click)="closeMobileMenu()">{{ 'common.search' | translate }}</a>
          <a routerLink="/rules" routerLinkActive="active" (click)="closeMobileMenu()">{{ 'nav.howItWorks' | translate }}</a>
          <a routerLink="/plans" routerLinkActive="active" (click)="closeMobileMenu()">{{ 'nav.plans' | translate }}</a>
          <a routerLink="/contact" routerLinkActive="active" (click)="closeMobileMenu()" class="nav-mobile-last">{{ 'nav.contact' | translate }}</a>
        }
        <div class="nav-mobile-divider"></div>
        @if (isLoggedIn) {
          <button class="logout-btn" (click)="logout.emit(); closeMobileMenu()">{{ 'nav.logout' | translate }}</button>
        } @else {
          <a class="nav-login" routerLink="/login" (click)="closeMobileMenu()">{{ ctaLogin }}</a>
          <a class="tbtn {{ btnClass }}" routerLink="/register" (click)="closeMobileMenu()">{{ ctaEnroll }}</a>
        }
      </div>
      }
    </div>
  `,
})
export class TplNavComponent {
  @Input() brandLetter = 'M';
  @Input() brandName = '';
  @Input() logoUrl?: string;
  @Input() navDark = false;
  @Input() ctaLogin = 'Login';
  @Input() ctaEnroll = 'Register';
  @Input() btnClass = 'btn-gradient';
  @Input() style: Record<string, string> = {};
  @Input() tplId?: string;
  @Input() isLoggedIn = false;
  @Output() logout = new EventEmitter<void>();

  readonly mobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    if (!this.mobileMenuOpen()) return;
    const target = e.target as HTMLElement;
    if (!target.closest('.tpl-nav') && !target.closest('.nav-hamburger')) {
      this.mobileMenuOpen.set(false);
    }
  }
}
