import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { MasterDataClient, MasterDataOptionDto } from '@org/generated';
import { TenantService } from './tenant.service';

interface Taluka {
  talukaId: number;
  districtId: number;
  name: string;
  nameMr: string | null;
}

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

export interface RegisterTalukaOption {
  talukaId: number;
  districtId: number;
  name: string;
}

export interface RegisterCountryOption {
  countryId: number;
  name: string;
}

export interface RegisterIncomeRangeOption {
  incomeRangeId: number;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class RegisterMasterDataService {
  private readonly masterData = inject(MasterDataClient);
  private readonly tenantService = inject(TenantService);
  private readonly http = inject(HttpClient);

  private readonly optionCache = new Map<string, RegisterLookupOption[]>();
  private readonly districtCache = new Map<number, RegisterDistrictOption[]>();
  private readonly talukaCache = new Map<number, RegisterTalukaOption[]>();
  private stateCache: RegisterStateOption[] | null = null;
  private countryCache: RegisterCountryOption[] | null = null;
  private incomeRangeCache: RegisterIncomeRangeOption[] | null = null;

  getGenders(): Observable<RegisterLookupOption[]> {
    return this.getOptions('genders', () => this.masterData.getGenders());
  }

  getReligions(): Observable<RegisterLookupOption[]> {
    return this.getOptions('religions', () => this.masterData.getReligions());
  }

  getCastes(religionId: number): Observable<RegisterLookupOption[]> {
    if (!religionId || religionId <= 0) {
      return of([]);
    }
    return this.getOptions(`castes?religionId=${religionId}`, () => this.masterData.getCastes(religionId));
  }

  getSubCastes(casteId: number): Observable<RegisterLookupOption[]> {
    return this.getOptions(`sub-castes?casteId=${casteId}`, () => this.masterData.getSubCastes(casteId));
  }

  getMaritalStatuses(): Observable<RegisterLookupOption[]> {
    return this.getOptions('marital-statuses', () => this.masterData.getMaritalStatuses());
  }

  getBloodGroups(): Observable<RegisterLookupOption[]> {
    return this.getOptions('blood-groups', () => this.masterData.getBloodGroups());
  }

  getComplexions(): Observable<RegisterLookupOption[]> {
    return this.getOptions('complexions', () => this.masterData.getComplexions());
  }

  getDiets(): Observable<RegisterLookupOption[]> {
    return this.getOptions('diets', () => this.masterData.getDiets());
  }

  getPersonalities(): Observable<RegisterLookupOption[]> {
    return this.getOptions('personalities', () => this.masterData.getPersonalities());
  }

  getRashis(): Observable<RegisterLookupOption[]> {
    return this.getOptions('rashis', () => this.masterData.getRashis());
  }

  getNakshatras(): Observable<RegisterLookupOption[]> {
    return this.getOptions('nakshatras', () => this.masterData.getNakshatras());
  }

  getCharans(): Observable<RegisterLookupOption[]> {
    return this.getOptions('charans', () => this.masterData.getCharans());
  }

  getNadis(): Observable<RegisterLookupOption[]> {
    return this.getOptions('nadis', () => this.masterData.getNadis());
  }

  getGans(): Observable<RegisterLookupOption[]> {
    return this.getOptions('gans', () => this.masterData.getGans());
  }

  getEducations(): Observable<RegisterLookupOption[]> {
    return this.getOptions('educations', () => this.masterData.getEducations());
  }

  getEducationAreas(): Observable<RegisterLookupOption[]> {
    return this.getOptions('education-areas', () => this.masterData.getEducationAreas());
  }

  getOccupations(): Observable<RegisterLookupOption[]> {
    return this.getOptions('occupations', () => this.masterData.getOccupations());
  }

  getIncomePeriods(): Observable<RegisterLookupOption[]> {
    return this.getOptions('income-periods', () => this.masterData.getIncomePeriods());
  }

  getStates(): Observable<RegisterStateOption[]> {
    if (this.stateCache) {
      return of(this.stateCache);
    }

    return this.masterData.getStates(0).pipe(
      map((rows) => this.mapStates(rows ?? [])),
      tap((normalized) => {
        this.stateCache = normalized;
      }),
      catchError((error) => {
        console.error('Register master-data states lookup failed:', error);
        return of([]);
      })
    );
  }

  getDistricts(stateId: number): Observable<RegisterDistrictOption[]> {
    const cached = this.districtCache.get(stateId);
    if (cached) {
      return of(cached);
    }

    return this.masterData.getDistricts(stateId).pipe(
      map((rows) => this.mapDistricts(rows ?? [], stateId)),
      tap((normalized) => {
        this.districtCache.set(stateId, normalized);
      }),
      catchError((error) => {
        console.error('Register master-data districts lookup failed:', error);
        return of([]);
      })
    );
  }

  getTalukas(districtId: number): Observable<RegisterTalukaOption[]> {
    const cached = this.talukaCache.get(districtId);
    if (cached) {
      return of(cached);
    }

    return this.masterData.getTalukas(districtId).pipe(
      map((rows) => this.mapTalukas(rows ?? [], districtId)),
      tap((normalized) => {
        this.talukaCache.set(districtId, normalized);
      }),
      catchError((error) => {
        console.error('Register master-data talukas lookup failed:', error);
        return of([]);
      })
    );
  }

  getCountries(): Observable<RegisterCountryOption[]> {
    if (this.countryCache) {
      return of(this.countryCache);
    }

    return this.http.get<Array<{ id: number; name: string }>>('/profile/master-data/countries').pipe(
      map((rows) => rows.map((r) => ({ countryId: r.id, name: r.name }))),
      tap((countries) => { this.countryCache = countries; }),
      catchError(() => of([]))
    );
  }

  getIncomeRanges(): Observable<RegisterIncomeRangeOption[]> {
    if (this.incomeRangeCache) {
      return of(this.incomeRangeCache);
    }

    return this.http.get<Array<{ id: number; name: string }>>('/profile/master-data/income-ranges').pipe(
      map((rows) => rows.map((r) => ({ incomeRangeId: r.id, label: r.name }))),
      tap((ranges) => { this.incomeRangeCache = ranges; }),
      catchError(() => of([]))
    );
  }

  private getOptions(
    cacheKey: string,
    loader: () => Observable<MasterDataOptionDto[]>
  ): Observable<RegisterLookupOption[]> {
    const cached = this.optionCache.get(cacheKey);
    if (cached) {
      return of(cached);
    }

    return loader().pipe(
      map((rows) => rows
        .map((row, index) => {
          const id = row.id ?? index + 1;
          const name = (row.name ?? '').trim();
          if (!name) {
            return null;
          }
          return { id, label: name, value: name } satisfies RegisterLookupOption;
        })
        .filter((row): row is RegisterLookupOption => row !== null)),
      tap((options) => {
        this.optionCache.set(cacheKey, options);
      }),
      catchError((error) => {
        console.error('Register master-data lookup failed:', cacheKey, error);
        return of([]);
      })
    );
  }

  private mapStates(rows: MasterDataOptionDto[]): RegisterStateOption[] {
    return rows
      .map((row) => {
        const stateId = row.id;
        const name = (row.name ?? '').trim();
        if (!stateId || !name) {
          return null;
        }
        return {
          stateId,
          name,
        } satisfies RegisterStateOption;
      })
      .filter((row): row is RegisterStateOption => row !== null);
  }

  private mapDistricts(rows: MasterDataOptionDto[], stateId: number): RegisterDistrictOption[] {
    return rows
      .map((row) => {
        const districtId = row.id;
        const name = (row.name ?? '').trim();
        if (!districtId || !name) {
          return null;
        }
        return {
          districtId,
          stateId,
          name,
        } satisfies RegisterDistrictOption;
      })
      .filter((row): row is RegisterDistrictOption => row !== null);
  }

  private mapTalukas(rows: MasterDataOptionDto[], districtId: number): RegisterTalukaOption[] {
    return rows
      .map((row) => {
        const talukaId = row.id;
        const name = (row.name ?? '').trim();
        if (!talukaId || !name) {
          return null;
        }
        return {
          talukaId,
          districtId,
          name,
        } satisfies RegisterTalukaOption;
      })
      .filter((row): row is RegisterTalukaOption => row !== null);
  }
}
