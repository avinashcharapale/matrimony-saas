import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface MasterDataItem {
  masterDataId: number;
  category: string;
  valueCode: string;
  sortOrder: number;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class MasterDataService {
  private http = inject(HttpClient);
  private base = '/api/master';
  private lang = 'en'; // TODO: connect to i18n service when available

  /** Cache key: `${category}:${lang}` */
  private cache = new Map<string, MasterDataItem[]>();

  setLang(lang: string): void {
    this.lang = lang;
  }

  getOptions(category: string, lang?: string): Observable<MasterDataItem[]> {
    const l = lang ?? this.lang;
    const key = `${category}:${l}`;
    const cached = this.cache.get(key);
    if (cached) return of(cached);

    const params = new HttpParams().set('category', category).set('lang', l);
    return this.http.get<MasterDataItem[]>(`${this.base}`, { params }).pipe(
      tap((data) => this.cache.set(key, data))
    );
  }

  /** Fetch multiple categories in one HTTP call. */
  getMultiple(
    categories: string[],
    lang?: string
  ): Observable<Record<string, MasterDataItem[]>> {
    const l = lang ?? this.lang;
    const uncached = categories.filter((c) => !this.cache.has(`${c}:${l}`));

    const source$ = uncached.length > 0
      ? this.http.get<Record<string, MasterDataItem[]>>(`${this.base}`, {
        params: new HttpParams().set('category', uncached.join(',')).set('lang', l),
      }).pipe(
        tap((data) => {
          for (const [cat, items] of Object.entries(data)) {
            this.cache.set(`${cat}:${l}`, items);
          }
        })
      )
      : of({} as Record<string, MasterDataItem[]>);

    return source$.pipe(
      map(() => {
        const result: Record<string, MasterDataItem[]> = {};
        for (const cat of categories) {
          result[cat] = this.cache.get(`${cat}:${l}`) ?? [];
        }
        return result;
      })
    );
  }
}
