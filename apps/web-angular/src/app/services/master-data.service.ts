import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

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

  async getOptions(category: string, lang?: string): Promise<MasterDataItem[]> {
    const l = lang ?? this.lang;
    const key = `${category}:${l}`;
    const cached = this.cache.get(key);
    if (cached) return cached;

    const params = new HttpParams().set('category', category).set('lang', l);
    const data = await firstValueFrom(
      this.http.get<MasterDataItem[]>(`${this.base}`, { params })
    );
    this.cache.set(key, data);
    return data;
  }

  /** Fetch multiple categories in one HTTP call. */
  async getMultiple(
    categories: string[],
    lang?: string
  ): Promise<Record<string, MasterDataItem[]>> {
    const l = lang ?? this.lang;
    const uncached = categories.filter((c) => !this.cache.has(`${c}:${l}`));

    if (uncached.length > 0) {
      const params = new HttpParams()
        .set('category', uncached.join(','))
        .set('lang', l);
      const data = await firstValueFrom(
        this.http.get<Record<string, MasterDataItem[]>>(`${this.base}`, { params })
      );
      for (const [cat, items] of Object.entries(data)) {
        this.cache.set(`${cat}:${l}`, items);
      }
    }

    const result: Record<string, MasterDataItem[]> = {};
    for (const cat of categories) {
      result[cat] = this.cache.get(`${cat}:${l}`) ?? [];
    }
    return result;
  }
}
