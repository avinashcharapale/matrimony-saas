import { Pipe, inject, type PipeTransform } from '@angular/core';
import { LocaleService } from './locale.service';

export type LocaleDateOptions =
  | 'full'
  | 'long'
  | 'medium'
  | 'short'
  | 'date'
  | 'time'
  | 'dateTime'
  | Intl.DateTimeFormatOptions;

const PRESETS: Record<string, Intl.DateTimeFormatOptions> = {
  full: { dateStyle: 'full' },
  long: { dateStyle: 'long' },
  medium: { dateStyle: 'medium' },
  short: { dateStyle: 'short' },
  date: { year: 'numeric', month: 'short', day: '2-digit' },
  time: { hour: '2-digit', minute: '2-digit' },
  dateTime: {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  },
};

@Pipe({
  name: 'localeDate',
  standalone: true,
})
export class LocaleDatePipe implements PipeTransform {
  private readonly localeService = inject(LocaleService);

  transform(
    value: Date | string | number | null | undefined,
    preset: LocaleDateOptions = 'date',
  ): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const options: Intl.DateTimeFormatOptions =
      typeof preset === 'string'
        ? (PRESETS[preset] ?? PRESETS['date'])
        : preset;

    return new Intl.DateTimeFormat(this.localeService.locale(), options).format(
      date,
    );
  }
}
