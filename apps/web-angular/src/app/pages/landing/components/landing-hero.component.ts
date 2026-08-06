import { Component, ChangeDetectionStrategy, Input, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-landing-hero',
  standalone: true,
  imports: [RouterModule, TranslateModule],
  templateUrl: './landing-hero.component.html',
  styleUrl: '../landing.css',
})
export class LandingHeroComponent {
  private readonly translate = inject(TranslateService);

  private readonly langTick = signal(0);

  constructor() {
    this.translate.onLangChange.subscribe(() => this.langTick.update(v => v + 1));
  }

  private t(key: string): string {
    return this.translate.instant(key);
  }

  @Input({ required: true }) tenantDisplayName!: string;
  @Input() heroTitle = '';
  @Input() heroSubtitle = '';
  @Input() heroDescription = '';
  @Input() heroImage = '';
  @Input() ctaEnroll?: string;
  @Input() eyebrow = '';
  @Input() badges: { text: string }[] = [];

  get resolvedCtaEnroll(): string {
    this.langTick();
    return this.ctaEnroll ?? this.t('nav.register');
  }
}
