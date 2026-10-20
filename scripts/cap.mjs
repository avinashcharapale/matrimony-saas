#!/usr/bin/env node
/**
 * Cross-platform Capacitor launcher that injects per-tenant / live-reload config
 * before invoking the Capacitor CLI.
 *
 * The Capacitor CLI has no --config flag, so `capacitor.config.ts` reads
 * CAP_TENANT (which native project + app id to use) and CAP_SERVER_URL
 * (whether to live-reload from a dev server). This script sets those safely on
 * Windows/macOS/Linux, then runs `npx cap <command>`.
 *
 * Usage:
 *   node scripts/cap.mjs [options] -- <capacitor command...>
 *
 * Options:
 *   --tenant <id>   Tenant id from the manifest (e.g. demo). Default: CAP_TENANT env.
 *   --server <url>  Dev server URL for live reload (http://<LAN-IP>:4200).
 *                   Default: CAP_SERVER_URL env. When omitted, assets are bundled.
 *
 * Examples:
 *   node scripts/cap.mjs --tenant demo -- sync
 *   node scripts/cap.mjs --tenant demo --server http://192.168.1.10:4200 -- run android
 */
import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);

let tenant;
let server;
const capArgs = [];

for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (arg === '--tenant') {
    tenant = argv[++i];
  } else if (arg === '--server') {
    server = argv[++i];
  } else if (arg === '--') {
    capArgs.push(...argv.slice(i + 1));
    break;
  } else {
    capArgs.push(arg);
  }
}

if (tenant) {
  process.env.CAP_TENANT = tenant;
}
if (server) {
  process.env.CAP_SERVER_URL = server;
}
if (!process.env.CAP_TENANT) {
  process.env.CAP_TENANT = 'demo';
}

if (capArgs.length === 0) {
  capArgs.push('sync');
}

const result = spawnSync('npx', ['cap', ...capArgs], {
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
