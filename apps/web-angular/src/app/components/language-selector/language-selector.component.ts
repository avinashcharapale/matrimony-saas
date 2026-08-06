import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LocaleService, SUPPORTED_LANGUAGES } from '@org/i18n';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-language-selector',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.css',
})
export class LanguageSelectorComponent {
  private readonly localeService = inject(LocaleService);

  readonly languages = SUPPORTED_LANGUAGES;
  readonly currentLanguage = computed(() => this.localeService.language());

  onLanguageChange(event: Event): void {
    const code = (event.target as HTMLSelectElement).value;
    this.localeService.setLanguage(code);
  }
}
