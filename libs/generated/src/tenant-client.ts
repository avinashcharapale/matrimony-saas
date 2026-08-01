import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TenantDto,
  TenantResolveResponse,
  MasterCategoryDto,
  CreateMasterCategoryRequest,
  UpdateMasterCategoryRequest,
  TenantMasterDataDto,
  CreateTenantMasterDataRequest,
  UpdateTenantMasterDataRequest,
  TenantBrandingDto,
  SaveTenantBrandingRequest,
  TenantDomainDto,
  CreateTenantDomainRequest,
  UpdateTenantDomainRequest,
  TenantSecuritySettingDto,
  SaveTenantSecuritySettingRequest,
  TenantEmailSettingDto,
  SaveTenantEmailSettingRequest,
  TenantNotificationSettingDto,
  SaveTenantNotificationSettingRequest,
} from './dtos';

@Injectable({ providedIn: 'root' })
export class TenantClient {
  private readonly http = inject(HttpClient);

  getById(id: number): Observable<TenantDto> {
    return this.http.get<TenantDto>(`/tenant/Tenants/${id}`);
  }

  update(id: number, body: TenantDto): Observable<void> {
    return this.http.put<void>(`/tenant/Tenants/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/tenant/Tenants/${id}`);
  }

  getAll(): Observable<TenantDto[]> {
    return this.http.get<TenantDto[]>('/tenant/Tenants');
  }

  create(body: TenantDto): Observable<void> {
    return this.http.post<void>('/tenant/Tenants', body);
  }

  resolveTenant(host: string, path: string, query: string): Observable<TenantResolveResponse> {
    const params = new HttpParams()
      .set('host', host)
      .set('path', path)
      .set('query', query);
    return this.http.get<TenantResolveResponse>('/api/gateway/resolve', { params });
  }

  // ── Master Categories ────────────────────────────────────────────────────

  getMasterCategories(activeOnly?: boolean): Observable<MasterCategoryDto[]> {
    let params = new HttpParams();
    if (activeOnly !== undefined) {
      params = params.set('activeOnly', String(activeOnly));
    }
    return this.http.get<MasterCategoryDto[]>('/tenant/master-categories', { params });
  }

  getMasterCategoryById(id: number): Observable<MasterCategoryDto> {
    return this.http.get<MasterCategoryDto>(`/tenant/master-categories/${id}`);
  }

  createMasterCategory(body: CreateMasterCategoryRequest): Observable<MasterCategoryDto> {
    return this.http.post<MasterCategoryDto>('/tenant/master-categories', body);
  }

  updateMasterCategory(id: number, body: UpdateMasterCategoryRequest): Observable<MasterCategoryDto> {
    return this.http.put<MasterCategoryDto>(`/tenant/master-categories/${id}`, body);
  }

  setMasterCategoryActive(id: number, isActive: boolean): Observable<void> {
    return this.http.post<void>(`/tenant/master-categories/${id}/active/${isActive}`, {});
  }

  // ── Tenant Master Data ───────────────────────────────────────────────────

  getTenantMasterData(masterCategoryId?: number, isEnabled?: boolean, page?: number, pageSize?: number): Observable<TenantMasterDataDto[]> {
    let params = new HttpParams();
    if (masterCategoryId !== undefined) {
      params = params.set('masterCategoryId', String(masterCategoryId));
    }
    if (isEnabled !== undefined) {
      params = params.set('isEnabled', String(isEnabled));
    }
    if (page !== undefined) {
      params = params.set('page', String(page));
    }
    if (pageSize !== undefined) {
      params = params.set('pageSize', String(pageSize));
    }
    return this.http.get<TenantMasterDataDto[]>('/tenant/master-data', { params });
  }

  getTenantMasterDataById(id: number): Observable<TenantMasterDataDto> {
    return this.http.get<TenantMasterDataDto>(`/tenant/master-data/${id}`);
  }

  createTenantMasterData(body: CreateTenantMasterDataRequest): Observable<TenantMasterDataDto> {
    return this.http.post<TenantMasterDataDto>('/tenant/master-data', body);
  }

  updateTenantMasterData(id: number, body: UpdateTenantMasterDataRequest): Observable<TenantMasterDataDto> {
    return this.http.put<TenantMasterDataDto>(`/tenant/master-data/${id}`, body);
  }

  deleteTenantMasterData(id: number): Observable<void> {
    return this.http.delete<void>(`/tenant/master-data/${id}`);
  }

  // ── Tenant Branding ──────────────────────────────────────────────────────

  getTenantBranding(): Observable<TenantBrandingDto> {
    return this.http.get<TenantBrandingDto>('/tenant/tenant-branding');
  }

  upsertTenantBranding(body: SaveTenantBrandingRequest): Observable<TenantBrandingDto> {
    return this.http.put<TenantBrandingDto>('/tenant/tenant-branding', body);
  }

  // ── Tenant Domains ───────────────────────────────────────────────────────

  getTenantDomains(): Observable<TenantDomainDto[]> {
    return this.http.get<TenantDomainDto[]>('/tenant/tenant-domains');
  }

  getTenantDomainById(id: number): Observable<TenantDomainDto> {
    return this.http.get<TenantDomainDto>(`/tenant/tenant-domains/${id}`);
  }

  createTenantDomain(body: CreateTenantDomainRequest): Observable<TenantDomainDto> {
    return this.http.post<TenantDomainDto>('/tenant/tenant-domains', body);
  }

  updateTenantDomain(id: number, body: UpdateTenantDomainRequest): Observable<TenantDomainDto> {
    return this.http.put<TenantDomainDto>(`/tenant/tenant-domains/${id}`, body);
  }

  setPrimaryTenantDomain(id: number): Observable<void> {
    return this.http.post<void>(`/tenant/tenant-domains/${id}/primary`, {});
  }

  verifyTenantDomain(id: number): Observable<void> {
    return this.http.post<void>(`/tenant/tenant-domains/${id}/verify`, {});
  }

  deleteTenantDomain(id: number): Observable<void> {
    return this.http.delete<void>(`/tenant/tenant-domains/${id}`);
  }

  // ── Tenant Security Settings ─────────────────────────────────────────────

  getTenantSecuritySettings(): Observable<TenantSecuritySettingDto> {
    return this.http.get<TenantSecuritySettingDto>('/tenant/tenant-security-settings');
  }

  upsertTenantSecuritySettings(body: SaveTenantSecuritySettingRequest): Observable<TenantSecuritySettingDto> {
    return this.http.put<TenantSecuritySettingDto>('/tenant/tenant-security-settings', body);
  }

  // ── Tenant Email Settings ────────────────────────────────────────────────

  getTenantEmailSettings(): Observable<TenantEmailSettingDto> {
    return this.http.get<TenantEmailSettingDto>('/tenant/tenant-email-settings');
  }

  upsertTenantEmailSettings(body: SaveTenantEmailSettingRequest): Observable<TenantEmailSettingDto> {
    return this.http.put<TenantEmailSettingDto>('/tenant/tenant-email-settings', body);
  }

  // ── Tenant Notification Settings ─────────────────────────────────────────

  getTenantNotificationSettings(): Observable<TenantNotificationSettingDto> {
    return this.http.get<TenantNotificationSettingDto>('/tenant/tenant-notification-settings');
  }

  upsertTenantNotificationSettings(body: SaveTenantNotificationSettingRequest): Observable<TenantNotificationSettingDto> {
    return this.http.put<TenantNotificationSettingDto>('/tenant/tenant-notification-settings', body);
  }
}
