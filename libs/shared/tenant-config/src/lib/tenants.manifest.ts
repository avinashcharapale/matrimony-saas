/**
 * Single source of truth for tenant onboarding metadata.
 *
 * IMPORTANT: This file must remain a plain data module with NO imports so it can
 * be consumed by the Angular app, the Capacitor CLI (`capacitor.config.ts`) and
 * any tooling without pulling in workspace path aliases.
 *
 * `appId` / `appName` drive the white-label native builds (one app per tenant).
 * `canonicalHost` is sent as `x-tenant-host` on native where `location.hostname`
 * is only `localhost`.
 */
export interface TenantManifestEntry {
  /** Stable tenant identifier — also used as the `?tenant=` deep-link value. */
  id: string;
  /** Human friendly app/brand name (native app name + document title fallback). */
  displayName: string;
  /** Reverse-DNS native app id (Android applicationId / iOS bundle id). */
  appId: string;
  /** Native app display name. */
  appName: string;
  /** Real tenant host used for tenant resolution + `x-tenant-host` on native. */
  canonicalHost: string;
  /** Hostnames that map to this tenant on web. */
  domainAliases: string[];
  /** URL path prefixes that map to this tenant on web. */
  pathAliases: string[];
  /** Approved landing template id. */
  themeTemplateId?: string;
  /** Optional production API base URL for this tenant's native build. */
  apiBaseUrl?: string;
}

/**
 * Default API origin for local native builds.
 *
 * `10.0.2.2` is the Android emulator's alias for the host machine's loopback,
 * so a bundled APK can reach a gateway running on the dev machine's :8000.
 * Override per build with `CAP_API_BASE_URL` (e.g. a LAN IP for a real device,
 * or an https origin for production).
 */
export const DEFAULT_NATIVE_API_BASE_URL = 'http://10.0.2.2:8000';

export const TENANT_MANIFEST: TenantManifestEntry[] = [
  {
    id: 'demo',
    displayName: 'Matrimony SaaS',
    appId: 'com.matrimony.saas',
    appName: 'Matrimony SaaS',
    canonicalHost: 'localhost',
    domainAliases: ['localhost'],
    pathAliases: [],
    themeTemplateId: 'marigold-traditional',
  },
];

/** Look up a tenant manifest entry by id (falls back to the first entry). */
export function findTenantManifest(
  tenantId?: string,
): TenantManifestEntry {
  if (tenantId) {
    const match = TENANT_MANIFEST.find((t) => t.id === tenantId);
    if (match) {
      return match;
    }
  }
  return TENANT_MANIFEST[0];
}
