import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { MasterDataRepository, MasterDataItem, GeoState, GeoDistrict, GeoTaluka } from './masterdata.repository';
import { MasterDataOptionDto } from '@org/generated';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';

export interface MasterDataState {
  genders: MasterDataOptionDto[];
  religions: MasterDataOptionDto[];
  castes: MasterDataOptionDto[];
  subCastes: MasterDataOptionDto[];
  maritalStatuses: MasterDataOptionDto[];
  bloodGroups: MasterDataOptionDto[];
  complexions: MasterDataOptionDto[];
  diets: MasterDataOptionDto[];
  personalities: MasterDataOptionDto[];
  rashis: MasterDataOptionDto[];
  nakshatras: MasterDataOptionDto[];
  charans: MasterDataOptionDto[];
  nadis: MasterDataOptionDto[];
  gans: MasterDataOptionDto[];
  educations: MasterDataOptionDto[];
  educationAreas: MasterDataOptionDto[];
  occupations: MasterDataOptionDto[];
  incomePeriods: MasterDataOptionDto[];
  states: GeoState[];
  districts: GeoDistrict[];
  talukas: GeoTaluka[];
  loading: boolean;
  error: string | null;
}

const initialState: MasterDataState = {
  genders: [],
  religions: [],
  castes: [],
  subCastes: [],
  maritalStatuses: [],
  bloodGroups: [],
  complexions: [],
  diets: [],
  personalities: [],
  rashis: [],
  nakshatras: [],
  charans: [],
  nadis: [],
  gans: [],
  educations: [],
  educationAreas: [],
  occupations: [],
  incomePeriods: [],
  states: [],
  districts: [],
  talukas: [],
  loading: false,
  error: null,
};

export const MasterDataStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ genders, religions, states }) => ({
    hasGenders: computed(() => genders().length > 0),
    hasReligions: computed(() => religions().length > 0),
    hasStates: computed(() => states().length > 0),
  })),
  withMethods((store, repository = inject(MasterDataRepository)) => ({
    loadGenders() {
      return repository.getGenders().pipe(
        tap((data) => patchState(store, { genders: data ?? [] })),
        catchError(() => { patchState(store, { genders: [] }); return of([]); }),
      );
    },

    loadReligions() {
      return repository.getReligions().pipe(
        tap((data) => patchState(store, { religions: data ?? [] })),
        catchError(() => { patchState(store, { religions: [] }); return of([]); }),
      );
    },

    loadCastes(religionId: number) {
      return repository.getCastes(religionId).pipe(
        tap((data) => patchState(store, { castes: data ?? [] })),
        catchError(() => { patchState(store, { castes: [] }); return of([]); }),
      );
    },

    loadSubCastes(casteId: number) {
      return repository.getSubCastes(casteId).pipe(
        tap((data) => patchState(store, { subCastes: data ?? [] })),
        catchError(() => { patchState(store, { subCastes: [] }); return of([]); }),
      );
    },

    loadMaritalStatuses() {
      return repository.getMaritalStatuses().pipe(
        tap((data) => patchState(store, { maritalStatuses: data ?? [] })),
        catchError(() => { patchState(store, { maritalStatuses: [] }); return of([]); }),
      );
    },

    loadBloodGroups() {
      return repository.getBloodGroups().pipe(
        tap((data) => patchState(store, { bloodGroups: data ?? [] })),
        catchError(() => { patchState(store, { bloodGroups: [] }); return of([]); }),
      );
    },

    loadComplexions() {
      return repository.getComplexions().pipe(
        tap((data) => patchState(store, { complexions: data ?? [] })),
        catchError(() => { patchState(store, { complexions: [] }); return of([]); }),
      );
    },

    loadDiets() {
      return repository.getDiets().pipe(
        tap((data) => patchState(store, { diets: data ?? [] })),
        catchError(() => { patchState(store, { diets: [] }); return of([]); }),
      );
    },

    loadPersonalities() {
      return repository.getPersonalities().pipe(
        tap((data) => patchState(store, { personalities: data ?? [] })),
        catchError(() => { patchState(store, { personalities: [] }); return of([]); }),
      );
    },

    loadRashis() {
      return repository.getRashis().pipe(
        tap((data) => patchState(store, { rashis: data ?? [] })),
        catchError(() => { patchState(store, { rashis: [] }); return of([]); }),
      );
    },

    loadNakshatras() {
      return repository.getNakshatras().pipe(
        tap((data) => patchState(store, { nakshatras: data ?? [] })),
        catchError(() => { patchState(store, { nakshatras: [] }); return of([]); }),
      );
    },

    loadCharans() {
      return repository.getCharans().pipe(
        tap((data) => patchState(store, { charans: data ?? [] })),
        catchError(() => { patchState(store, { charans: [] }); return of([]); }),
      );
    },

    loadNadis() {
      return repository.getNadis().pipe(
        tap((data) => patchState(store, { nadis: data ?? [] })),
        catchError(() => { patchState(store, { nadis: [] }); return of([]); }),
      );
    },

    loadGans() {
      return repository.getGans().pipe(
        tap((data) => patchState(store, { gans: data ?? [] })),
        catchError(() => { patchState(store, { gans: [] }); return of([]); }),
      );
    },

    loadEducations() {
      return repository.getEducations().pipe(
        tap((data) => patchState(store, { educations: data ?? [] })),
        catchError(() => { patchState(store, { educations: [] }); return of([]); }),
      );
    },

    loadEducationAreas() {
      return repository.getEducationAreas().pipe(
        tap((data) => patchState(store, { educationAreas: data ?? [] })),
        catchError(() => { patchState(store, { educationAreas: [] }); return of([]); }),
      );
    },

    loadOccupations() {
      return repository.getOccupations().pipe(
        tap((data) => patchState(store, { occupations: data ?? [] })),
        catchError(() => { patchState(store, { occupations: [] }); return of([]); }),
      );
    },

    loadIncomePeriods() {
      return repository.getIncomePeriods().pipe(
        tap((data) => patchState(store, { incomePeriods: data ?? [] })),
        catchError(() => { patchState(store, { incomePeriods: [] }); return of([]); }),
      );
    },

    loadStates() {
      return repository.getGeoStates().pipe(
        tap((data) => patchState(store, { states: data ?? [] })),
        catchError(() => { patchState(store, { states: [] }); return of([]); }),
      );
    },

    loadDistricts(stateId: number) {
      return repository.getGeoDistricts(stateId).pipe(
        tap((data) => patchState(store, { districts: data ?? [] })),
        catchError(() => { patchState(store, { districts: [] }); return of([]); }),
      );
    },

    loadTalukas(districtId: number) {
      return repository.getGeoTalukas(districtId).pipe(
        tap((data) => patchState(store, { talukas: data ?? [] })),
        catchError(() => { patchState(store, { talukas: [] }); return of([]); }),
      );
    },

    clearCastes() {
      patchState(store, { castes: [], subCastes: [] });
    },

    clearDistricts() {
      patchState(store, { districts: [], talukas: [] });
    },

    clearTalukas() {
      patchState(store, { talukas: [] });
    },
  })),
);
