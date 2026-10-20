# Mobile Parity + Capacitor Native Init — Resume Plan

Repo: `D:\Avinash\Project\FrontEnd\matrimony-saas` (git repo)
Goal: bring `apps/mobile-ionic` to feature/logic parity with `apps/web-angular` (Ionic UI kept), consolidate shared logic into `libs/`, then add Android + iOS native platforms.

---

## Status

| Phase | Scope | Status |
|---|---|---|
| 1A | `apps/mobile-ionic/project.json` assets (designs), `fileReplacements`, `src/environments/*` | DONE |
| 1B | `app.config.ts` interceptors (error, loading, correlation, tenant, auth) | DONE |
| 1C | `capacitor.config.ts` (`webDir: dist/apps/mobile-ionic/browser`, appId `com.matrimony.saas`) + npm scripts | DONE (native add blocked) |
| 2 | Consolidate member logic into `libs/data-access/profile` (`member.models.ts`, `member.mapper.ts`, `member-facade.service.ts`); web + mobile `member.service.ts` delegate | DONE |
| 3 | Routes/guards, `my-profile/edit`, gallery guard, privacy/terms/refund + `legal-document` page, footer links | DONE |
| 5 | Port web-only pages: `messages`, `events` (photo-gallery superseded by mobile `gallery`) | DONE |
| 6a | Test parity: mobile specs + fixed pre-existing web specs; **both green** | DONE |
| 6b | Native platform init (`cap add android` / `ios`) + `cap sync` | DONE |

Verification status: `nx build mobile-ionic` green, `nx build web-angular` green, `nx test mobile-ionic` 4/4, `nx test web-angular` 5/5. Both `android/` and `ios/` native projects scaffolded; `cap sync` succeeds.

## Environment
- Node `v22.23.3`, npm `10.9.9` (Windows, PowerShell 5.1). Satisfies `@angular/*` (`^22.12.0`), Capacitor (`>=22`), Vite/Vitest.
- `bcrypt` loads fine under Node 22 (Node-API / ABI-stable) — no `npm ci` rebuild needed.
- `ios/` scaffolds on Windows, but **building/running iOS requires macOS + Xcode**.

---

## DONE — resume steps below kept for reference
The "NEXT STEPS" below were completed on Node 22.23.3. Kept for reproducibility.

---

## NEXT STEPS (resume here after Node install)

### 1. Install Node 22 LTS (22.12.0+)
Requirement intersection: Angular 21 / Vite 7 want `^22.12.0 || >=24`; Capacitor 8 needs `>=22.0.0`.
So install **Node ≥22.12.0** (latest 22 LTS) or **Node 24**. Do NOT use 22.0–22.11.

Verify:
```powershell
node -v   # expect v22.12.0+ or v24.x
```

### 2. Reinstall/rebuild native modules (ABI change 20 -> 22)
The native addon `bcrypt` was built for Node 20 and won't load on Node 22.
```
npm ci        # preferred (clean, lockfile-exact)
# or, faster: npm rebuild bcrypt
```
Only affects `apps/api`; frontends are pure JS/TS.

### 3. Sanity-check the workspace still builds/tests
```
npx nx reset
npx nx build mobile-ionic
npx nx build web-angular
npx nx test mobile-ionic
npx nx test web-angular
```

### 4. Initialize native platforms (Phase 6b)
```
npm run mobile:build          # nx build mobile-ionic  -> dist/apps/mobile-ionic/browser
npx cap add android
npx cap add ios               # macOS only
npx cap sync
```
Then open:
```
npm run cap:open:android
npx cap open ios
```

### 6b acceptance
- `android/` and `ios/` folders created
- `npx cap sync` copies web assets without error
- App boots in Android Studio / Xcode simulator showing the Ionic UI

---

## Repo / command reference
- Build mobile: `npx nx build mobile-ionic`
- Build web: `npx nx build web-angular`
- Test mobile: `npx nx test mobile-ionic`
- Test web: `npx nx test web-angular`
- Lint profile lib: `npx nx lint data-access-profile`
- Reset Nx daemon (asset changes): `npx nx reset`
- Capacitor: `cap:init`, `mobile:build`, `mobile:sync`, `cap:sync`, `cap:open:android`, `cap:open:ios` (from root `package.json`)

## Known environment quirks
- Nx stale-daemon: `project.json` asset edits aren't picked up until `npx nx reset` (plain `--skip-nx-cache` isn't enough).
- Ionic + Vitest: `@ionic/core` has no `exports` map and `@ionic/angular` imports the `@ionic/core/loader` **directory**, causing `EISDIR`. Fixed via `test.server.deps.inline: [/@ionic\/angular/, /@ionic\/core/, /ionicons/]` in `apps/mobile-ionic/vite.config.mts`.
- Tests use `TranslateModule.forRoot({ loader: TranslateFakeLoader })` + `provideHttpClientTesting()` to avoid `TranslateStore`/network errors.
- Pre-existing lint debt remains across the repo (intentionally left as-is per user directive); changed files are lint-clean.
- iOS native build requires macOS; only Android can be added on Windows.

## Key files touched
- `libs/data-access/profile/src/lib/{member.models.ts,member.mapper.ts,member-facade.service.ts}`, `src/index.ts`
- `apps/web-angular/src/app/services/member.service.ts`, `apps/mobile-ionic/src/app/services/member.service.ts`
- `apps/mobile-ionic/src/app/app.routes.ts`, `app.config.ts`, `vite.config.mts`, `project.json`, `src/environments/*`
- `apps/mobile-ionic/src/app/pages/{messages,events,legal-document}/*`
- `apps/mobile-ionic/src/app/pages/my-profile/my-profile.html`, `pages/home/home.html`
- Specs: mobile `src/app/app.spec.ts` + `pages/{login,register,profile-list}/*.spec.ts`; web `pages/{login,register,profile-list}/*.spec.ts`
- `capacitor.config.ts`, root `package.json`
