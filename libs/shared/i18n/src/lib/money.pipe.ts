import { Pipe, inject, type PipeTransform } from '@angular/core';
import { LocaleService } from './locale.service';

@Pipe({
  name: 'money',
  standalone: true,
})
export class MoneyPipe implements PipeTransform {
  private readonly localeService = inject(LocaleService);

  transform(
    value: number | string | null | undefined,
    currency?: string,
    options?: Intl.NumberFormatOptions,
  ): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const amount = typeof value === 'string' ? Number(value) : value;
    if (Number.isNaN(amount)) {
      return '';
    }

    return new Intl.NumberFormat(this.localeService.locale(), {
      style: 'currency',
      currency: currency ?? this.localeService.currency(),
      maximumFractionDigits: 0,
      ...options,
    }).format(amount);
  }
}
