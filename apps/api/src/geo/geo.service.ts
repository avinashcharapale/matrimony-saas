/**
 * Geographic Service — States, Districts, Talukas
 */
import { ConnectionPool } from 'mssql';

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

export class GeoService {
  constructor(private pool: ConnectionPool) {}

  async getCountries(): Promise<Country[]> {
    const result = await this.pool
      .request()
      .query<Country>(
        `SELECT CountryId AS countryId, Code AS code, Name AS name, NameMr AS nameMr
         FROM dbo.Countries WHERE IsActive = 1 ORDER BY Name`
      );
    return result.recordset;
  }

  async getStates(countryId?: number): Promise<State[]> {
    const request = this.pool.request();
    let sql = `SELECT StateId AS stateId, CountryId AS countryId, Code AS code,
                      Name AS name, NameMr AS nameMr
               FROM dbo.States WHERE IsActive = 1`;
    if (countryId !== undefined) {
      request.input('cid', countryId);
      sql += ' AND CountryId = @cid';
    }
    sql += ' ORDER BY Name';
    const result = await request.query<State>(sql);
    return result.recordset;
  }

  async getDistricts(stateId: number): Promise<District[]> {
    const result = await this.pool
      .request()
      .input('sid', stateId)
      .query<District>(
        `SELECT DistrictId AS districtId, StateId AS stateId,
                Name AS name, NameMr AS nameMr
         FROM dbo.Districts WHERE StateId = @sid AND IsActive = 1 ORDER BY Name`
      );
    return result.recordset;
  }

  async getTalukas(districtId: number): Promise<Taluka[]> {
    const result = await this.pool
      .request()
      .input('did', districtId)
      .query<Taluka>(
        `SELECT TalukaId AS talukaId, DistrictId AS districtId,
                Name AS name, NameMr AS nameMr
         FROM dbo.Talukas WHERE DistrictId = @did AND IsActive = 1 ORDER BY Name`
      );
    return result.recordset;
  }
}
