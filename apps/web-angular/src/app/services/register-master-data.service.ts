import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { MasterDataOptionDto, ProfileServiceClient } from '../../../../../libs/shared/clients/profile-client';
import { TenantService } from './tenant.service';

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
  private readonly tenantService = inject(TenantService);
  private readonly profileClient = new ProfileServiceClient('/profile', {
    fetch: (input, init) => this.fetchWithTenantContext(input, init),
  });

  private readonly optionCache = new Map<string, RegisterLookupOption[]>();
  private readonly districtCache = new Map<number, RegisterDistrictOption[]>();
  private stateCache: RegisterStateOption[] | null = null;

  private fetchWithTenantContext(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const sourceRequest = new Request(input, init);
    const tenantId = this.tenantService.tenantHeaderId;
    let requestUrl = sourceRequest.url;

    // Gateway route is /profile/{**catch-all} -> /api/{**catch-all},
    // so callers must send /profile/master-data/* (not /profile/api/master-data/*).
    requestUrl = requestUrl.replace('/profile/api/master-data/', '/profile/master-data/');

    if (tenantId && requestUrl.includes('/master-data/')) {
      const url = new URL(requestUrl, window.location.origin);
      if (!url.searchParams.has('tenantId')) {
        url.searchParams.set('tenantId', tenantId);
      }
      requestUrl = url.toString();
    }

    const headers = new Headers(sourceRequest.headers);
    if (tenantId && !headers.has('x-tenant-id')) {
      headers.set('x-tenant-id', tenantId);
      headers.set('x-tenant-host', window.location.hostname);
    }

    const requestWithUrl = new Request(requestUrl, sourceRequest);
    const requestWithTenant = new Request(requestWithUrl, { headers });

    return fetch(requestWithTenant);
  }

  getGenders(): Observable<RegisterLookupOption[]> {
    return this.getOptions('genders', () => from(this.profileClient.genders()));
  }

  getReligions(): Observable<RegisterLookupOption[]> {
    return this.getOptions('religions', () => from(this.profileClient.religions()));
  }

  getCastes(religionId: number): Observable<RegisterLookupOption[]> {
    return this.getOptions(`castes?religionId=${religionId}`, () => from(this.profileClient.castes(religionId)));
  }

  getSubCastes(casteId: number): Observable<RegisterLookupOption[]> {
    return this.getOptions(`sub-castes?casteId=${casteId}`, () => from(this.profileClient.subCastes(casteId)));
  }

  getMaritalStatuses(): Observable<RegisterLookupOption[]> {
    return this.getOptions('marital-statuses', () => from(this.profileClient.maritalStatuses()));
  }

  getBloodGroups(): Observable<RegisterLookupOption[]> {
    return this.getOptions('blood-groups', () => from(this.profileClient.bloodGroups()));
  }

  getComplexions(): Observable<RegisterLookupOption[]> {
    return this.getOptions('complexions', () => from(this.profileClient.complexions()));
  }

  getDiets(): Observable<RegisterLookupOption[]> {
    return this.getOptions('diets', () => from(this.profileClient.diets()));
  }

  getPersonalities(): Observable<RegisterLookupOption[]> {
    return this.getOptions('personalities', () => from(this.profileClient.personalities()));
  }

  getRashis(): Observable<RegisterLookupOption[]> {
    return this.getOptions('rashis', () => from(this.profileClient.rashis()));
  }

  getNakshatras(): Observable<RegisterLookupOption[]> {
    return this.getOptions('nakshatras', () => from(this.profileClient.nakshatras()));
  }

  getCharans(): Observable<RegisterLookupOption[]> {
    return this.getOptions('charans', () => from(this.profileClient.charans()));
  }

  getNadis(): Observable<RegisterLookupOption[]> {
    return this.getOptions('nadis', () => from(this.profileClient.nadis()));
  }

  getGans(): Observable<RegisterLookupOption[]> {
    return this.getOptions('gans', () => from(this.profileClient.gans()));
  }

  getEducations(): Observable<RegisterLookupOption[]> {
    return this.getOptions('educations', () => from(this.profileClient.educations()));
  }

  getEducationAreas(): Observable<RegisterLookupOption[]> {
    return this.getOptions('education-areas', () => from(this.profileClient.educationAreas()));
  }

  getOccupations(): Observable<RegisterLookupOption[]> {
    return this.getOptions('occupations', () => from(this.profileClient.occupations()));
  }

  getIncomePeriods(): Observable<RegisterLookupOption[]> {
    return this.getOptions('income-periods', () => from(this.profileClient.incomePeriods()));
  }

  getStates(): Observable<RegisterStateOption[]> {
    if (this.stateCache) {
      return of(this.stateCache);
    }

    return from(this.profileClient.states()).pipe(
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

    return from(this.profileClient.districts(stateId)).pipe(
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
}