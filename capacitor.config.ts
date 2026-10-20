import { CapacitorConfig } from '@capacitor/cli';
import {
  DEFAULT_NATIVE_API_BASE_URL,
  findTenantManifest,
  TENANT_MANIFEST,
} from './libs/shared/tenant-config/src/lib/tenants.manifest';

/**
 * One native project per tenant.
 *
 * Select the tenant with CAP_TENANT (default: first manifest entry). Each tenant
 * gets its own native dirs under `native/<tenant>/android` and `native/<tenant>/ios`.
 *
 * Local dev (live reload): set CAP_SERVER_URL=http://<LAN-IP>:4200 and the
 * WebView loads the running Angular dev server, whose own proxy forwards API
 * calls to the gateway. This keeps requests same-origin (no CORS / mixed content).
 *
 * Bundled builds: the Angular build bakes an absolute API origin (see
 * scripts/gen-native-env.mjs / CAP_API_BASE_URL). When that origin is `http://`
 * on Android, `allowMixedContent` is enabled so the WebView may call it.
 */
const tenantId = process.env.CAP_TENANT || TENANT_MANIFEST[0].id;
const tenant = findTenantManifest(tenantId);

const serverUrl = process.env.CAP_SERVER_URL;
const isLiveReload = Boolean(serverUrl);

/**
 * The API origin baked into the bundled Angular build (must match
 * scripts/gen-native-env.mjs). A bundled APK's WebView origin is
 * `https://localhost`, so calling an `http://` gateway is mixed content that
 * Android blocks unless `allowMixedContent` is set.
 */
const apiBaseUrl =
  process.env.CAP_API_BASE_URL ||
  tenant.apiBaseUrl ||
  DEFAULT_NATIVE_API_BASE_URL;
const allowMixedContent = isLiveReload || apiBaseUrl.startsWith('http://');

const config: CapacitorConfig = {
  appId: tenant.appId,
  appName: tenant.appName,
  webDir: 'dist/apps/web-angular/browser',
  bundledWebRuntime: false,
  android: {
    path: `native/${tenant.id}/android`,
    allowMixedContent,
    webContentsDebuggingEnabled:
      isLiveReload || process.env.CAP_DEBUG_WEBVIEW === '1',
  },
  ios: {
    path: `native/${tenant.id}/ios`,
  },
};

if (isLiveReload) {
  config.server = {
    url: serverUrl,
    cleartext: true,
    androidScheme: 'http',
    hostname: 'localhost',
  };
}

export default config;
