export interface TenantConfig {
  id: number;
  hostname: string;
  displayName: string;
  primaryColor: string;
  accentColor: string;
}

const DEFAULT_TENANT: TenantConfig = {
  id: 1,
  hostname: 'localhost',
  displayName: 'Super Admin',
  primaryColor: '#6a1b9a',
  accentColor: '#ff6f00',
};

export function resolveTenant(hostname: string, search: string): TenantConfig {
  const params = new URLSearchParams(search);
  const tenantId = params.get('tenantId');
  if (tenantId) {
    return { ...DEFAULT_TENANT, id: Number(tenantId), hostname };
  }
  return { ...DEFAULT_TENANT, hostname };
}
