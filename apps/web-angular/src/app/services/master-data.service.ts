import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { MasterDataClient, MasterDataItemDto } from '@org/generated';

export type MasterDataItem = MasterDataItemDto;

@Injectable({ providedIn: 'root' })
export class MasterDataService {
  private readonly masterData = inject(MasterDataClient);
  private lang = 'en';

  private cache = new Map<string, MasterDataItemDto[]>();

  setLang(lang: string): void {
    this.lang = lang;
  }

  getOptions(category: string, lang?: string): Observable<MasterDataItemDto[]> {
    const l = lang ?? this.lang;
    const key = `${category}:${l}`;
    const cached = this.cache.get(key);
    if (cached) return of(cached);

    return this.masterData.getMasterOptions(category, l).pipe(
      tap((data) => this.cache.set(key, data))
    );
  }

  getMultiple(
    categories: string[],
    lang?: string
  ): Observable<Record<string, MasterDataItemDto[]>> {
    const l = lang ?? this.lang;
    const uncached = categories.filter((c) => !this.cache.has(`${c}:${l}`));

    const source$ = uncached.length > 0
      ? this.masterData.getMasterOptions(uncached.join(','), l).pipe(
        tap((data) => {
          for (const item of data) {
            const existing = this.cache.get(`${item.category}:${l}`) ?? [];
            existing.push(item);
            this.cache.set(`${item.category}:${l}`, existing);
          }
        })
      )
      : of([] as MasterDataItemDto[]);

    return source$.pipe(
      map(() => {
        const result: Record<string, MasterDataItemDto[]> = {};
        for (const cat of categories) {
          result[cat] = this.cache.get(`${cat}:${l}`) ?? [];
        }
        return result;
      })
    );
  }
}
