import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

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

  async getStates(): Promise<State[]> {
    if (this.stateCache) return this.stateCache;
    this.stateCache = await firstValueFrom(
      this.http.get<State[]>(`${this.base}/states`)
    );
    return this.stateCache ?? [];
  }

  async getDistricts(stateId: number): Promise<District[]> {
    const cachedDistricts = this.districtCache.get(stateId);
    if (cachedDistricts) return cachedDistricts;
    const params = new HttpParams().set('stateId', stateId);
    const data = await firstValueFrom(
      this.http.get<District[]>(`${this.base}/districts`, { params })
    );
    this.districtCache.set(stateId, data);
    return data;
  }

  async getTalukas(districtId: number): Promise<Taluka[]> {
    const cachedTalukas = this.talukaCache.get(districtId);
    if (cachedTalukas) return cachedTalukas;
    const params = new HttpParams().set('districtId', districtId);
    const data = await firstValueFrom(
      this.http.get<Taluka[]>(`${this.base}/talukas`, { params })
    );
    this.talukaCache.set(districtId, data);
    return data;
  }
}
