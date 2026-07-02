import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface RegisterLookupOption {
  id: number;
  label: string;
  value: string;
}

export interface RegisterStateOption {
  stateId: number;
  name: string;
  code?: string;
  countryId?: number;
}

export interface RegisterDistrictOption {
  districtId: number;
  stateId: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class RegisterMasterDataService {
  private readonly http = inject(HttpClient);
  private readonly base = '/profile/master-data';

  private readonly optionCache = new Map<string, RegisterLookupOption[]>();
  private readonly districtCache = new Map<number, RegisterDistrictOption[]>();
  private stateCache: RegisterStateOption[] | null = null;

  getGenders(): Promise<RegisterLookupOption[]> {
    return this.getOptions('genders');
  }

  getReligions(): Promise<RegisterLookupOption[]> {
    return this.getOptions('religions');
  }

  getCastes(religionId: number): Promise<RegisterLookupOption[]> {
    return this.getOptions('castes', { religionId });
  }

  getSubCastes(casteId: number): Promise<RegisterLookupOption[]> {
    return this.getOptions('sub-castes', { casteId });
  }

  getMaritalStatuses(): Promise<RegisterLookupOption[]> {
    return this.getOptions('marital-statuses');
  }

  getBloodGroups(): Promise<RegisterLookupOption[]> {
    return this.getOptions('blood-groups');
  }

  getComplexions(): Promise<RegisterLookupOption[]> {
    return this.getOptions('complexions');
  }

  getDiets(): Promise<RegisterLookupOption[]> {
    return this.getOptions('diets');
  }

  getPersonalities(): Promise<RegisterLookupOption[]> {
    return this.getOptions('personalities');
  }

  getRashis(): Promise<RegisterLookupOption[]> {
    return this.getOptions('rashis');
  }

  getNakshatras(): Promise<RegisterLookupOption[]> {
    return this.getOptions('nakshatras');
  }

  getCharans(): Promise<RegisterLookupOption[]> {
    return this.getOptions('charans');
  }

  getNadis(): Promise<RegisterLookupOption[]> {
    return this.getOptions('nadis');
  }

  getGans(): Promise<RegisterLookupOption[]> {
    return this.getOptions('gans');
  }

  getEducations(): Promise<RegisterLookupOption[]> {
    return this.getOptions('educations');
  }

  getEducationAreas(): Promise<RegisterLookupOption[]> {
    return this.getOptions('education-areas');
  }

  getOccupations(): Promise<RegisterLookupOption[]> {
    return this.getOptions('occupations');
  }

  getIncomePeriods(): Promise<RegisterLookupOption[]> {
    return this.getOptions('income-periods');
  }

  async getStates(): Promise<RegisterStateOption[]> {
    if (this.stateCache) {
      return this.stateCache;
    }
    const rows = await this.safeGetRows(`${this.base}/states`);
    const normalized = rows
      .map<RegisterStateOption | null>((row) => {
        const stateId = this.resolveNumber(row, ['stateId', 'id']);
        const name = this.resolveString(row, ['name', 'label', 'valueCode']);
        if (stateId === null || !name) {
          return null;
        }
        const code = this.resolveString(row, ['code']) ?? undefined;
        const countryId = this.resolveNumber(row, ['countryId']) ?? undefined;
        return { stateId, name, code, countryId };
      })
      .filter((row): row is RegisterStateOption => row !== null);

    this.stateCache = normalized;
    return normalized;
  }

  async getDistricts(stateId: number): Promise<RegisterDistrictOption[]> {
    const cached = this.districtCache.get(stateId);
    if (cached) {
      return cached;
    }

    const params = new HttpParams().set('stateId', stateId);
    const rows = await this.safeGetRows(`${this.base}/districts`, params);

    const normalized = rows
      .map((row) => {
        const districtId = this.resolveNumber(row, ['districtId', 'id']);
        const districtStateId = this.resolveNumber(row, ['stateId']) ?? stateId;
        const name = this.resolveString(row, ['name', 'label', 'valueCode']);
        if (districtId === null || !name) {
          return null;
        }
        return { districtId, stateId: districtStateId, name } satisfies RegisterDistrictOption;
      })
      .filter((row): row is RegisterDistrictOption => row !== null);

    this.districtCache.set(stateId, normalized);
    return normalized;
  }

  private async getOptions(
    endpoint: string,
    query?: Record<string, number | string>
  ): Promise<RegisterLookupOption[]> {
    const querySuffix = this.buildQueryCacheKey(query);
    const cacheKey = querySuffix ? `${endpoint}?${querySuffix}` : endpoint;
    const cached = this.optionCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    let params = new HttpParams();
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        params = params.set(key, value);
      }
    }

    const rows = await this.safeGetRows(`${this.base}/${endpoint}`, params);

    const options = rows
      .map((row, index) => {
        const id = this.resolveNumber(row, ['masterDataId', 'id']) ?? index + 1;
        const label = this.resolveString(row, ['label', 'name', 'valueCode']) ?? '';
        const value = this.resolveString(row, ['valueCode', 'code', 'name', 'label']) ?? '';
        if (!label || !value) {
          return null;
        }
        return { id, label, value } satisfies RegisterLookupOption;
      })
      .filter((row): row is RegisterLookupOption => row !== null);

    this.optionCache.set(cacheKey, options);
    return options;
  }

  private async safeGetRows(url: string, params?: HttpParams): Promise<Record<string, unknown>[]> {
    try {
      return await firstValueFrom(this.http.get<Record<string, unknown>[]>(url, { params }));
    } catch (error) {
      // Keep registration usable even when lookup gateway/services are temporarily unavailable.
      console.error('Register master-data lookup failed:', url, error);
      return [];
    }
  }

  private buildQueryCacheKey(query?: Record<string, number | string>): string {
    if (!query) {
      return '';
    }
    return Object.entries(query)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
  }

  private resolveNumber(
    row: Record<string, unknown>,
    keys: string[]
  ): number | null {
    for (const key of keys) {
      const value = row[key];
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }
      if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }
    }
    return null;
  }

  private resolveString(
    row: Record<string, unknown>,
    keys: string[]
  ): string | null {
    for (const key of keys) {
      const value = row[key];
      if (typeof value === 'string' && value.trim() !== '') {
        return value.trim();
      }
    }
    return null;
  }
}