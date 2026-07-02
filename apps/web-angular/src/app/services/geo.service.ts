import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

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
  private http = inject(HttpClient);
  private base = '/api/geo';

  // Simple in-memory caches to avoid redundant requests
  private stateCache: State[] | null = null;
  private districtCache = new Map<number, District[]>();
  private talukaCache = new Map<number, Taluka[]>();

  getStates(): Observable<State[]> {
    if (this.stateCache) return of(this.stateCache);
    return this.http.get<State[]>(`${this.base}/states`).pipe(
      tap((states) => {
        this.stateCache = states;
      })
    );
  }

  getDistricts(stateId: number): Observable<District[]> {
    const cachedDistricts = this.districtCache.get(stateId);
    if (cachedDistricts) return of(cachedDistricts);
    const params = new HttpParams().set('stateId', stateId);
    return this.http.get<District[]>(`${this.base}/districts`, { params }).pipe(
      tap((data) => this.districtCache.set(stateId, data))
    );
  }

  getTalukas(districtId: number): Observable<Taluka[]> {
    const cachedTalukas = this.talukaCache.get(districtId);
    if (cachedTalukas) return of(cachedTalukas);
    const params = new HttpParams().set('districtId', districtId);
    return this.http.get<Taluka[]>(`${this.base}/talukas`, { params }).pipe(
      tap((data) => this.talukaCache.set(districtId, data))
    );
  }
}
