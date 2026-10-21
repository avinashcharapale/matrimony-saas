#!/usr/bin/env node
/**
 * Version Management Script for Mobile Builds
 * 
 * Usage:
 *   node scripts/version.mjs get                    # Get current version
 *   node scripts/version.mjs bump [patch|minor|major]  # Bump version
 *   node scripts/version.mjs set 1.2.3              # Set specific version
 *   node scripts/version.mjs next-beta              # Generate next beta version
 *   node scripts/version.mjs next-rc                # Generate next RC version
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// Version file location (shared across platforms)
const VERSION_FILE = path.join(root, 'mobile-version.json');

function readVersion() {
  try {
    const content = readFileSync(VERSION_FILE, 'utf8');
    return JSON.parse(content);
  } catch {
    // Default version
    return {
      major: 1,
      minor: 0,
      patch: 0,
      prerelease: null,
      build: 0
    };
  }
}

function writeVersion(version) {
  writeFileSync(VERSION_FILE, JSON.stringify(version, null, 2), 'utf8');
}

function formatVersion(version) {
  let str = `${version.major}.${version.minor}.${version.patch}`;
  if (version.prerelease) {
    str += `-${version.prerelease}`;
  }
  return str;
}

function formatVersionCode(version) {
  // Android versionCode: major * 10000 + minor * 100 + patch + build
  return version.major * 10000 + version.minor * 100 + version.patch + version.build;
}

function bumpVersion(type) {
  const version = readVersion();
  
  switch (type) {
    case 'major':
      version.major += 1;
      version.minor = 0;
      version.patch = 0;
      break;
    case 'minor':
      version.minor += 1;
      version.patch = 0;
      break;
    case 'patch':
      version.patch += 1;
      break;
    case 'prerelease':
      if (version.prerelease) {
        const [name, num] = version.prerelease.split('.');
        version.prerelease = `${name}.${parseInt(num) + 1}`;
      } else {
        version.prerelease = 'beta.1';
      }
      break;
    default:
      console.error(`Unknown bump type: ${type}`);
      process.exit(1);
  }
  
  version.build += 1;
  writeVersion(version);
  return version;
}

function setVersion(versionStr) {
  const match = versionStr.match(/^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z]+(?:\.\d+)?))?$/);
  if (!match) {
    console.error(`Invalid version format: ${versionStr}`);
    process.exit(1);
  }
  
  const version = {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3]),
    prerelease: match[4] || null,
    build: 0
  };
  
  writeVersion(version);
  return version;
}

function getNextBeta() {
  const version = readVersion();
  version.prerelease = 'beta.1';
  version.build += 1;
  writeVersion(version);
  return version;
}

function getNextRC() {
  const version = readVersion();
  version.prerelease = 'rc.1';
  version.build += 1;
  writeVersion(version);
  return version;
}

function promoteToRelease() {
  const version = readVersion();
  version.prerelease = null;
  version.build += 1;
  writeVersion(version);
  return version;
}

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'get': {
    const version = readVersion();
    console.log(`Version: ${formatVersion(version)}`);
    console.log(`Version Code: ${formatVersionCode(version)}`);
    console.log(`Build: ${version.build}`);
    break;
  }
  case 'bump': {
    const type = args[1] || 'patch';
    const version = bumpVersion(type);
    console.log(`Bumped to: ${formatVersion(version)} (code: ${formatVersionCode(version)})`);
    break;
  }
  case 'set': {
    const versionStr = args[1];
    if (!versionStr) {
      console.error('Version required for set command');
      process.exit(1);
    }
    const version = setVersion(versionStr);
    console.log(`Set to: ${formatVersion(version)} (code: ${formatVersionCode(version)})`);
    break;
  }
  case 'next-beta': {
    const version = getNextBeta();
    console.log(`Next beta: ${formatVersion(version)} (code: ${formatVersionCode(version)})`);
    break;
  }
  case 'next-rc': {
    const version = getNextRC();
    console.log(`Next RC: ${formatVersion(version)} (code: ${formatVersionCode(version)})`);
    break;
  }
  case 'promote': {
    const version = promoteToRelease();
    console.log(`Promoted to release: ${formatVersion(version)} (code: ${formatVersionCode(version)})`);
    break;
  }
  case 'ci-export': {
    // Output for CI/CD (GitHub Actions)
    const version = readVersion();
    console.log(`VERSION_NAME=${formatVersion(version)}`);
    console.log(`VERSION_CODE=${formatVersionCode(version)}`);
    console.log(`BUILD_NUMBER=${version.build}`);
    break;
  }
  default: {
    console.log(`
Mobile Version Management

Usage:
  node scripts/version.mjs get                    # Get current version
  node scripts/version.mjs bump [patch|minor|major|prerelease]  # Bump version
  node scripts/version.mjs set 1.2.3              # Set specific version
  node scripts/version.mjs next-beta              # Generate next beta version
  node scripts/version.mjs next-rc                # Generate next RC version
  node scripts/version.mjs promote                # Promote prerelease to release
  node scripts/version.mjs ci-export              # Export for CI/CD

Examples:
  node scripts/version.mjs bump patch    # 1.0.0 -> 1.0.1
  node scripts/version.mjs bump minor    # 1.0.1 -> 1.1.0
  node scripts/version.mjs bump major    # 1.1.0 -> 2.0.0
  node scripts/version.mjs next-beta     # 1.0.0 -> 1.0.0-beta.1
  node scripts/version.mjs promote       # 1.0.0-beta.1 -> 1.0.0
`);
    process.exit(1);
  }
}