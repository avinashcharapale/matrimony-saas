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
const isProduction = process.env.NODE_ENV === 'production' || process.env.CAP_PRODUCTION === 'true';

/**
 * The API origin baked into the bundled Angular build (must match
 * scripts/gen-native-env.mjs). A bundled APK's WebView origin is
 * `https://localhost`, so calling an `http://` gateway is mixed content that
 * Android blocks unless `allowMixedContent` is set.
 * 
 * PRODUCTION: allowMixedContent MUST be false. API must use HTTPS.
 */
const apiBaseUrl =
  process.env.CAP_API_BASE_URL ||
  tenant.apiBaseUrl ||
  DEFAULT_NATIVE_API_BASE_URL;

// Security: Only allow mixed content in development/live-reload mode
// Production builds MUST use HTTPS
const allowMixedContent = isLiveReload && !isProduction;

// Enable WebView debugging only in development
const webContentsDebuggingEnabled = isLiveReload || process.env.CAP_DEBUG_WEBVIEW === '1';

const config: CapacitorConfig = {
  appId: tenant.appId,
  appName: tenant.appName,
  webDir: 'dist/apps/web-angular/browser',
  bundledWebRuntime: false,
  android: {
    path: `native/${tenant.id}/android`,
    allowMixedContent,
    webContentsDebuggingEnabled,
    backgroundColor: '#fdf6ec',
    overrideUserAgent: `MatrimonySaaS/${tenant.id}`,
    // Security: Enforce HTTPS in production
    ...(isProduction && {
      // Additional production-only settings can be added here
    }),
  },
  ios: {
    path: `native/${tenant.id}/ios`,
    backgroundColor: '#fdf6ec',
    overrideUserAgent: `MatrimonySaaS/${tenant.id}`,
    // iOS handles ATS via Info.plist
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#8e1f4f',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#8e1f4f',
    },
    Camera: {
      permissions: ['camera', 'photos'],
    },
    Network: {},
    App: {
      launchAutoHide: true,
    },
    Haptics: {},
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#8e1f4f',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
      resizeOnFullScreen: true,
    },
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