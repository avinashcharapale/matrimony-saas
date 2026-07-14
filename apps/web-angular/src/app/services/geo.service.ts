import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MasterDataClient } from '@org/generated';

export interface Country {
  countryId: number;
  code: string;
  name: string;
  nameMr: string | null;
}

export interface State {
  stateId: number;
  countryId: number;
  code: string;
  name: string;
  nameMr: string | null;
}

export interface District {
  districtId: number;
  stateId: number;
  name: string;
  nameMr: string | null;
}

export interface Taluka {
  talukaId: number;
  districtId: number;
  name: string;
  nameMr: string | null;
}

@Injectable({ providedIn: 'root' })
export class GeoService {
  private readonly masterData = inject(MasterDataClient);

  private stateCache: State[] | null = null;
  private districtCache = new Map<number, District[]>();
  private talukaCache = new Map<number, Taluka[]>();

  getStates(): Observable<State[]> {
    if (this.stateCache) return of(this.stateCache);
    return this.masterData.getGeoStates().pipe(
      map((states) => (states ?? []).map((s) => ({
        stateId: s.stateId ?? 0,
        countryId: s.countryId ?? 0,
        code: s.code ?? '',
        name: s.name ?? '',
        nameMr: s.nameMr ?? null,
      }))),
      tap((mapped) => { this.stateCache = mapped; })
    );
  }

  getDistricts(stateId: number): Observable<District[]> {
    const cachedDistricts = this.districtCache.get(stateId);
    if (cachedDistricts) return of(cachedDistricts);
    return this.masterData.getGeoDistricts(stateId).pipe(
      map((data) => (data ?? []).map((d) => ({
        districtId: d.districtId ?? 0,
        stateId: d.stateId ?? 0,
        name: d.name ?? '',
        nameMr: d.nameMr ?? null,
      }))),
      tap((mapped) => { this.districtCache.set(stateId, mapped); })
    );
  }

  getTalukas(districtId: number): Observable<Taluka[]> {
    const cachedTalukas = this.talukaCache.get(districtId);
    if (cachedTalukas) return of(cachedTalukas);
    return this.masterData.getGeoTalukas(districtId).pipe(
      map((data) => (data ?? []).map((t) => ({
        talukaId: t.talukaId ?? 0,
        districtId: t.districtId ?? 0,
        name: t.name ?? '',
        nameMr: t.nameMr ?? null,
      }))),
      tap((mapped) => { this.talukaCache.set(districtId, mapped); })
    );
  }
}
