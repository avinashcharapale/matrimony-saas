export interface TenantConfig {
  id: number;
  hostname: string;
  displayName: string;
  primaryColor: string;
  accentColor: string;
  logoUrl?: string;
  faviconUrl?: string;
  customTheme?: {
    primary?: string;
    accent?: string;
    bgStart?: string;
    bgMid?: string;
    bgEnd?: string;
    text?: string;
  };
}

const DEFAULT_TENANT: TenantConfig = {
  id: 1,
  hostname: 'localhost',
  displayName: 'Admin Panel',
  primaryColor: '#1976d2',
  accentColor: '#ff4081',
};

export function resolveTenant(hostname: string, search: string): TenantConfig {
  const params = new URLSearchParams(search);
  const tenantId = params.get('tenantId');

  if (tenantId) {
    return { ...DEFAULT_TENANT, id: Number(tenantId), hostname };
  }

  return { ...DEFAULT_TENANT, hostname };
}
