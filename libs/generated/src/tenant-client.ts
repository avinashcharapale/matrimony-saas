import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  TenantDto,
  TenantResolveResponse,
  MasterCategoryDto,
  CreateMasterCategoryRequest,
  UpdateMasterCategoryRequest,
  TenantMasterDataDto,
  TenantMasterDataDtoPagedResult,
  CreateTenantMasterDataRequest,
  UpdateTenantMasterDataRequest,
  TenantBrandingDto,
  SaveTenantBrandingRequest,
  TenantLegalDocumentsDto,
  LegalDocumentKind,
  TenantDomainDto,
  CreateTenantDomainRequest,
  UpdateTenantDomainRequest,
  TenantSecuritySettingDto,
  SaveTenantSecuritySettingRequest,
  TenantEmailSettingDto,
  SaveTenantEmailSettingRequest,
  TenantNotificationSettingDto,
  SaveTenantNotificationSettingRequest,
  TenantContactDto,
  SaveTenantContactRequest,
  FeatureFlagDto,
  FeatureFlagDefinitionDto,
  UpdateTenantFeatureFlagsRequest,
  FileUploadResult,
} from './dtos';

@Injectable({ providedIn: 'root' })
export class TenantClient {
  private readonly http = inject(HttpClient);

  private tenantHeaders(tenantId?: number): HttpHeaders | undefined {
    return tenantId ? new HttpHeaders({ 'x-tenant-id': String(tenantId) }) : undefined;
  }

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

  getTenantMasterData(masterCategoryId?: number, isEnabled?: boolean, page?: number, pageSize?: number): Observable<TenantMasterDataDtoPagedResult> {
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
    return this.http.get<TenantMasterDataDtoPagedResult>('/tenant/master-data', { params });
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

  getTenantBranding(tenantId?: number): Observable<TenantBrandingDto> {
    return this.http.get<TenantBrandingDto>('/tenant/tenant-branding', { headers: this.tenantHeaders(tenantId) });
  }

  upsertTenantBranding(body: SaveTenantBrandingRequest, tenantId?: number): Observable<TenantBrandingDto> {
    return this.http.put<TenantBrandingDto>('/tenant/tenant-branding', body, { headers: this.tenantHeaders(tenantId) });
  }

  uploadBrandingLogo(file: File, tenantId?: number): Observable<FileUploadResult> {
    return this.uploadBrandingFile('logo', file, tenantId);
  }

  uploadBrandingFavicon(file: File, tenantId?: number): Observable<FileUploadResult> {
    return this.uploadBrandingFile('favicon', file, tenantId);
  }

  private uploadBrandingFile(kind: string, file: File, tenantId?: number): Observable<FileUploadResult> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<FileUploadResult>(`/tenant/tenant-branding/${kind}`, formData, {
      headers: this.tenantHeaders(tenantId),
    });
  }

  // ── Tenant Legal Documents ───────────────────────────────────────────────

  getTenantLegalDocuments(tenantId?: number): Observable<TenantLegalDocumentsDto> {
    return this.http.get<TenantLegalDocumentsDto>('/tenant/tenant-legal-documents', { headers: this.tenantHeaders(tenantId) });
  }

  uploadLegalDocument(kind: LegalDocumentKind, file: File, tenantId?: number): Observable<TenantLegalDocumentsDto> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<TenantLegalDocumentsDto>(`/tenant/tenant-legal-documents/${kind}`, formData, {
      headers: this.tenantHeaders(tenantId),
    });
  }

  getPublicTenantLegalDocuments(tenantId?: number): Observable<TenantLegalDocumentsDto> {
    const params = tenantId ? { tenantId: String(tenantId) } : undefined;
    return this.http.get<TenantLegalDocumentsDto>('/tenant/tenant-legal-documents/public', { params });
  }

  // ── Tenant Domains ───────────────────────────────────────────────────────

  getTenantDomains(tenantId?: number): Observable<TenantDomainDto[]> {
    return this.http.get<TenantDomainDto[]>('/tenant/tenant-domains', { headers: this.tenantHeaders(tenantId) });
  }

  getTenantDomainById(id: number, tenantId?: number): Observable<TenantDomainDto> {
    return this.http.get<TenantDomainDto>(`/tenant/tenant-domains/${id}`, { headers: this.tenantHeaders(tenantId) });
  }

  createTenantDomain(body: CreateTenantDomainRequest, tenantId?: number): Observable<TenantDomainDto> {
    return this.http.post<TenantDomainDto>('/tenant/tenant-domains', body, { headers: this.tenantHeaders(tenantId) });
  }

  updateTenantDomain(id: number, body: UpdateTenantDomainRequest, tenantId?: number): Observable<TenantDomainDto> {
    return this.http.put<TenantDomainDto>(`/tenant/tenant-domains/${id}`, body, { headers: this.tenantHeaders(tenantId) });
  }

  setPrimaryTenantDomain(id: number, tenantId?: number): Observable<void> {
    return this.http.post<void>(`/tenant/tenant-domains/${id}/primary`, {}, { headers: this.tenantHeaders(tenantId) });
  }

  verifyTenantDomain(id: number, tenantId?: number): Observable<void> {
    return this.http.post<void>(`/tenant/tenant-domains/${id}/verify`, {}, { headers: this.tenantHeaders(tenantId) });
  }

  deleteTenantDomain(id: number, tenantId?: number): Observable<void> {
    return this.http.delete<void>(`/tenant/tenant-domains/${id}`, { headers: this.tenantHeaders(tenantId) });
  }

  // ── Tenant Contacts ──────────────────────────────────────────────────────

  getTenantContacts(tenantId?: number): Observable<TenantContactDto[]> {
    return this.http.get<TenantContactDto[]>('/tenant/tenant-contacts', { headers: this.tenantHeaders(tenantId) });
  }

  getTenantContactById(id: number, tenantId?: number): Observable<TenantContactDto> {
    return this.http.get<TenantContactDto>(`/tenant/tenant-contacts/${id}`, { headers: this.tenantHeaders(tenantId) });
  }

  createTenantContact(body: SaveTenantContactRequest, tenantId?: number): Observable<TenantContactDto> {
    return this.http.post<TenantContactDto>('/tenant/tenant-contacts', body, { headers: this.tenantHeaders(tenantId) });
  }

  updateTenantContact(id: number, body: SaveTenantContactRequest, tenantId?: number): Observable<TenantContactDto> {
    return this.http.put<TenantContactDto>(`/tenant/tenant-contacts/${id}`, body, { headers: this.tenantHeaders(tenantId) });
  }

  setPrimaryTenantContact(id: number, tenantId?: number): Observable<void> {
    return this.http.post<void>(`/tenant/tenant-contacts/${id}/primary`, {}, { headers: this.tenantHeaders(tenantId) });
  }

  setActiveTenantContact(id: number, isActive: boolean, tenantId?: number): Observable<void> {
    return this.http.post<void>(`/tenant/tenant-contacts/${id}/active/${isActive}`, {}, { headers: this.tenantHeaders(tenantId) });
  }

  deleteTenantContact(id: number, tenantId?: number): Observable<void> {
    return this.http.delete<void>(`/tenant/tenant-contacts/${id}`, { headers: this.tenantHeaders(tenantId) });
  }

  // ── Tenant Security Settings ─────────────────────────────────────────────

  getTenantSecuritySettings(tenantId?: number): Observable<TenantSecuritySettingDto> {
    return this.http.get<TenantSecuritySettingDto>('/tenant/tenant-security-settings', { headers: this.tenantHeaders(tenantId) });
  }

  upsertTenantSecuritySettings(body: SaveTenantSecuritySettingRequest, tenantId?: number): Observable<TenantSecuritySettingDto> {
    return this.http.put<TenantSecuritySettingDto>('/tenant/tenant-security-settings', body, { headers: this.tenantHeaders(tenantId) });
  }

  // ── Tenant Email Settings ────────────────────────────────────────────────

  getTenantEmailSettings(tenantId?: number): Observable<TenantEmailSettingDto> {
    return this.http.get<TenantEmailSettingDto>('/tenant/tenant-email-settings', { headers: this.tenantHeaders(tenantId) });
  }

  upsertTenantEmailSettings(body: SaveTenantEmailSettingRequest, tenantId?: number): Observable<TenantEmailSettingDto> {
    return this.http.put<TenantEmailSettingDto>('/tenant/tenant-email-settings', body, { headers: this.tenantHeaders(tenantId) });
  }

  // ── Tenant Notification Settings ─────────────────────────────────────────

  getTenantNotificationSettings(tenantId?: number): Observable<TenantNotificationSettingDto> {
    return this.http.get<TenantNotificationSettingDto>('/tenant/tenant-notification-settings', { headers: this.tenantHeaders(tenantId) });
  }

  upsertTenantNotificationSettings(body: SaveTenantNotificationSettingRequest, tenantId?: number): Observable<TenantNotificationSettingDto> {
    return this.http.put<TenantNotificationSettingDto>('/tenant/tenant-notification-settings', body, { headers: this.tenantHeaders(tenantId) });
  }

  // ── Tenant Feature Flags (end-user UI visibility) ────────────────────────

  getTenantFeatureFlags(tenantId?: number): Observable<FeatureFlagDto[]> {
    return this.http.get<FeatureFlagDto[]>('/tenant/tenant-feature-flags', { headers: this.tenantHeaders(tenantId) });
  }

  getTenantFeatureFlagDefinitions(tenantId?: number): Observable<FeatureFlagDefinitionDto[]> {
    return this.http.get<FeatureFlagDefinitionDto[]>('/tenant/tenant-feature-flags/definitions', { headers: this.tenantHeaders(tenantId) });
  }

  updateTenantFeatureFlags(body: UpdateTenantFeatureFlagsRequest, tenantId?: number): Observable<FeatureFlagDto[]> {
    return this.http.put<FeatureFlagDto[]>('/tenant/tenant-feature-flags', body, { headers: this.tenantHeaders(tenantId) });
  }
}
