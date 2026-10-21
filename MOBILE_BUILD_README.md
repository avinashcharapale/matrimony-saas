# Mobile Build & Release Guide

This document describes the complete mobile build pipeline for the Matrimony SaaS white-label apps.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Mobile Build Pipeline                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GitHub Actions (CI/CD)                                          │
│  ├── Setup & Validate                                           │
│  ├── Build Android (Debug/Release)                              │
│  │   ├── npm ci                                                 │
│  │   ├── Generate native env (CAP_TENANT, CAP_API_BASE_URL)     │
│  │   ├── npm run web:build                                      │
│  │   ├── npx cap sync android                                   │
│  │   ├── ./gradlew bundleRelease (with signing)                 │
│  │   └── Upload AAB/APK artifacts                               │
│  │                                                               │
│  ├── Build iOS (Debug/Release)                                  │
│  │   ├── npm ci                                                 │
│  │   ├── Generate native env                                    │
│  │   ├── npm run web:build                                      │
│  │   ├── pod install                                            │
│  │   ├── npx cap sync ios                                       │
│  │   ├── xcodebuild archive (with manual signing)               │
│  │   ├── xcodebuild exportArchive (IPA)                         │
│  │   └── Upload IPA artifacts                                   │
│  │                                                               │
│  ├── Create GitHub Release                                      │
│  └── Deploy to Stores (Fastlane)                                │
│      ├── Android → Play Console (internal/alpha/beta/prod)      │
│      └── iOS → TestFlight / App Store Connect                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

1. **Android**:
   - Java 21 (Temurin)
   - Android SDK (API 34)
   - Keystore for release signing

2. **iOS**:
   - macOS (GitHub-hosted `macos-latest` runner)
   - Xcode 15.4+
   - Apple Developer Account
   - Distribution Certificate (.p12)
   - App Store Provisioning Profile (.mobileprovision)

3. **Secrets** (configure in GitHub repository settings):
   ```
   # Android
   ANDROID_KEYSTORE_BASE64          # Base64-encoded keystore.jks
   ANDROID_KEYSTORE_PASSWORD        # Keystore password
   ANDROID_KEY_ALIAS                # Key alias
   ANDROID_KEY_PASSWORD             # Key password
   GOOGLE_SERVICES_JSON             # FCM config (base64)
   PLAY_STORE_CONFIG_JSON           # Google Play API key (base64)
   
   # iOS
   APPLE_TEAM_ID                    # Team ID from Apple Developer
   APPLE_DISTRIBUTION_CERT_BASE64   # .p12 certificate (base64)
   APPLE_DISTRIBUTION_CERT_PASSWORD # .p12 password
   APP_STORE_PROVISIONING_PROFILE_BASE64  # .mobileprovision (base64)
   APP_STORE_PROVISIONING_PROFILE_NAME    # Profile name
   APP_STORE_CONNECT_API_KEY_ID     # App Store Connect API key ID
   APP_STORE_CONNECT_API_ISSUER_ID  # App Store Connect API issuer ID
   APP_STORE_CONNECT_API_KEY_BASE64 # App Store Connect API key (base64)
   
   # Shared
   API_BASE_URL                     # Production API base URL (https://api.example.com)
   TENANT_HOST                      # Tenant's canonical host
   API_DOMAIN                       # API domain for ATS
   ASSOCIATED_DOMAIN                # Associated domain for Universal Links
   APP_DISPLAY_NAME                 # App display name
   ```

### Trigger a Build

```bash
# Via GitHub CLI
gh workflow run mobile-build.yml \
  -f tenant=demo \
  -f platform=both \
  -f buildType=release \
  -f version=1.2.3 \
  -f versionCode=1002003 \
  -f uploadArtifacts=true
```

### Local Development

```bash
# Install dependencies
npm ci

# Generate native environment for demo tenant
npm run native:env

# Build web app
npm run web:build

# Sync with Capacitor
npx cap sync android
npx cap sync ios

# Open in IDE
npx cap open android
npx cap open ios
```

## Version Management

The version is managed in `mobile-version.json`:

```json
{
  "major": 1,
  "minor": 0,
  "patch": 0,
  "prerelease": null,
  "build": 0
}
```

### Commands

```bash
# Get current version
node scripts/version.mjs get

# Bump version
node scripts/version.mjs bump patch    # 1.0.0 -> 1.0.1
node scripts/version.mjs bump minor    # 1.0.1 -> 1.1.0
node scripts/version.mjs bump major    # 1.1.0 -> 2.0.0

# Prerelease versions
node scripts/version.mjs next-beta     # 1.0.0 -> 1.0.0-beta.1
node scripts/version.mjs next-rc       # 1.0.0 -> 1.0.0-rc.1

# Promote prerelease to stable
node scripts/version.mjs promote       # 1.0.0-beta.1 -> 1.0.0

# Set specific version
node scripts/version.mjs set 2.0.0

# Export for CI
node scripts/version.mjs ci-export
# VERSION_NAME=1.0.0
# VERSION_CODE=10000
# BUILD_NUMBER=0
```

### Version Code Calculation

Android `versionCode` = `major * 10000 + minor * 100 + patch + build`

| Version | Version Code |
|---------|--------------|
| 1.0.0   | 10000        |
| 1.0.1   | 10001        |
| 1.1.0   | 10100        |
| 2.0.0   | 20000        |

## Adding a New Tenant

1. Add entry to `libs/shared/tenant-config/src/lib/tenants.manifest.ts`:

```typescript
{
  id: 'acme',
  displayName: 'Acme Matrimony',
  appId: 'com.acme.matrimony',
  appName: 'Acme Matrimony',
  canonicalHost: 'acme.example.com',
  domainAliases: ['acme.example.com'],
  pathAliases: [],
  themeTemplateId: 'marigold-traditional',
  apiBaseUrl: 'https://api.acme.example.com'
}
```

2. Create native project directories:
```bash
mkdir -p native/acme/android native/acme/ios
```

3. Copy and customize from `native/demo/`:
   - Android: `build.gradle`, `strings.xml`, `AndroidManifest.xml`, `google-services.json`
   - iOS: `Info.plist`, `Release.xcconfig`, `App.entitlements`, `ExportOptions.plist`
   - Update `appId`, `appName`, bundle identifiers

4. Add tenant to GitHub Actions workflow `tenant` input options

5. Configure secrets for the new tenant (API keys, certificates, etc.)

6. Test build:
```bash
gh workflow run mobile-build.yml -f tenant=acme -f platform=android -f buildType=debug
```

## Android Configuration Details

### Signing (Release)

The keystore is stored as a base64-encoded secret and decoded at build time:

```bash
# Generate keystore (run once)
keytool -genkey -v -keystore keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias release

# Encode for GitHub Secrets
base64 -i keystore.jks | pbcopy
```

### Network Security

`native/<tenant>/android/app/src/main/res/xml/network_security_config.xml` enforces HTTPS:

```xml
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
```

### Deep Links

`AndroidManifest.xml` includes intent filters for:
- Custom scheme: `matrimony://<tenant>/...`
- Universal links: `https://<tenant-host>/...`

### ProGuard

`proguard-rules.pro` preserves Capacitor, Firebase, and plugin classes.

## iOS Configuration Details

### Manual Signing

`Release.xcconfig` configures manual signing for App Store distribution:

```xcconfig
CODE_SIGN_STYLE = Manual
PROVISIONING_PROFILE_SPECIFIER = $(APP_STORE_PROVISIONING_PROFILE_NAME)
CODE_SIGN_IDENTITY = Apple Distribution
```

### Entitlements

`App.entitlements` includes:
- Push notifications (`aps-environment: production`)
- Associated domains for Universal Links
- Keychain access groups
- App groups

### Export Options

`ExportOptions.plist` configures App Store export with manual signing.

### Deep Links

`Info.plist` includes:
- Custom URL scheme: `matrimony-<tenant>://`
- Associated domains: `applinks:<tenant-host>`
- ATS exceptions for API domain

## Fastlane Deployment

### Android

```bash
cd native/demo/android/fastlane
bundle install

# Deploy to internal testing
bundle exec fastlane deploy_internal

# Deploy to alpha/beta
bundle exec fastlane deploy_alpha
bundle exec fastlane deploy track:beta

# Promote between tracks
bundle exec fastlane promote from:internal to:alpha
```

### iOS

```bash
cd native/demo/ios/fastlane
bundle install

# Upload to TestFlight
bundle exec fastlane testflight

# Upload to App Store Connect
bundle exec fastlane appstore

# Submit for review
bundle exec fastlane submit_review

# Sync certificates (Match)
bundle exec fastlane sync_certificates
```

## Troubleshooting

### Common Android Issues

| Issue | Solution |
|-------|----------|
| `Keystore not found` | Verify `ANDROID_KEYSTORE_BASE64` secret is set |
| `Signing failed` | Check keystore password, key alias, key password |
| `google-services.json not found` | Verify `GOOGLE_SERVICES_JSON` secret |
| `Network request blocked` | Check `network_security_config.xml` and API domain |
| `Deep link not working` | Verify `assetlinks.json` on server, check intent filters |

### Common iOS Issues

| Issue | Solution |
|-------|----------|
| `Provisioning profile not found` | Verify profile UUID matches `APP_STORE_PROVISIONING_PROFILE_NAME` |
| `Certificate not found` | Verify `.p12` is imported, password is correct |
| `Code signing failed` | Check `Release.xcconfig` values, team ID |
| `Universal links not working` | Verify `apple-app-site-association` on server |
| `Push notifications not working` | Verify `aps-environment` entitlement, APNs key in Firebase |

## Security Checklist

- [ ] All API communication uses HTTPS (ATS / Network Security Config)
- [ ] Keystore and certificates stored as GitHub Secrets (not in repo)
- [ ] `allowMixedContent: false` in production Capacitor config
- [ ] ProGuard/R8 enabled for Android release builds
- [ ] iOS Hardened Runtime enabled
- [ ] App Transport Security configured with specific domain exceptions only
- [ ] Push notification certificates rotated annually
- [ ] Google Play / App Store API keys have minimal required permissions

## Monitoring

- **Crash Reporting**: Sentry / Firebase Crashlytics
- **Analytics**: Firebase Analytics / App Store Connect Analytics
- **Performance**: Firebase Performance Monitoring

## Support

For issues with the build pipeline, check:
1. GitHub Actions workflow logs
2. Fastlane output logs
3. Xcode build logs (iOS)
4. Gradle build logs (Android)