export interface AppEnvironment {
  production: boolean;
  /**
   * Tenant baked into white-label native builds. Passed to `resolveTenant` as an
   * explicit default so resolution never depends on `location.hostname` (which is
   * always `localhost` inside the Capacitor WebView).
   */
  defaultTenantId?: string;
  /**
   * Canonical tenant host sent as `x-tenant-host` on native, instead of the
   * WebView's `localhost`.
   */
  tenantHost?: string;
  /**
   * Absolute API origin for the native bundle, e.g. `https://api.acme.example`.
   * Leave empty to keep requests relative (dev live-reload uses the Angular
   * proxy, and the web build stays same-origin).
   */
  apiBaseUrl?: string;
}
