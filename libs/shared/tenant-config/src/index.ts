export type {
  TenantConfig,
  TenantContact,
  ThemePalette,
  TenantLandingContent,
  TenantLogoSettings,
  TenantSocialMedia,
  TenantFooterSettings,
  TenantSectionsVisible,
} from './lib/tenant-config';
export {
  THEME_PALETTES,
  TENANT_CONFIGS,
  DEFAULT_TENANT,
  resolveTenant,
  findTemplate,
  bootstrapFromTemplate,
} from './lib/tenant-config';
export type { TenantManifestEntry } from './lib/tenants.manifest';
export { TENANT_MANIFEST, findTenantManifest } from './lib/tenants.manifest';
