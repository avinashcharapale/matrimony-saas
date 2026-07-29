<#
  post-process-clients.ps1 — Rewrites NSwag-generated clients for YARP gateway routing.
#>
param(
  [string]$RawDir = "libs/generated/src/_raw",
  [string]$OutDir = "libs/generated/src"
)

$ErrorActionPreference = "Stop"
Write-Host "=== Post-processing NSwag clients ===" -ForegroundColor Cyan

function Rewrite-Paths {
  param([string]$Content)
  
  $result = $Content
  
  # Identity: /api/Auth/* → /identity/Auth/*
  $result = $result -replace '"/api/Auth/', '"/identity/Auth/'
  
  # Identity: /api/Users/* → /identity/Users/*
  $result = $result -replace '"/api/Users/', '"/identity/Users/'
  $result = $result -replace '"/api/Users"', '"/identity/Users"'
  
  # Tenant: /api/Tenants/* → /tenant/Tenants/*
  $result = $result -replace '"/api/Tenants/', '"/tenant/Tenants/'
  $result = $result -replace '"/api/Tenants"', '"/tenant/Tenants"'
  
  # Profile master-data: /api/master-data/* → /gateway/master-data/*
  $result = $result -replace '"/api/master-data/', '"/gateway/master-data/'
  
  # Profile: /api/UserProfiles/* → /profile/UserProfiles/*
  $result = $result -replace '"/api/UserProfiles/', '"/profile/UserProfiles/'
  $result = $result -replace '"/api/UserProfiles"', '"/profile/UserProfiles"'
  
  # Subscription: /api/TenantSubscriptionPlans/* → /subscription/TenantSubscriptionPlans/*
  $result = $result -replace '"/api/TenantSubscriptionPlans/', '"/subscription/TenantSubscriptionPlans/'
  $result = $result -replace '"/api/TenantSubscriptionPlans"', '"/subscription/TenantSubscriptionPlans"'
  
  # Subscription status: /api/subscription/status → /subscription/subscription/status
  $result = $result -replace '"/api/subscription/status', '"/subscription/subscription/status'
  
  return $result
}

function Rewrite-ClassNames {
  param([string]$Content)
  
  $result = $Content
  $result = $result.Replace("export class AuthClient", "export class IdentityClient")
  $result = $result.Replace("export class TenantsClient", "export class TenantClient")
  $result = $result.Replace("export class UserProfilesClient", "export class ProfileClient")
  $result = $result.Replace("export class TenantSubscriptionPlansClient", "export class SubscriptionClient")
  return $result
}

function Fix-OpaqueToken {
  param([string]$Content)
  
  $result = $Content
  $result = $result.Replace("OpaqueToken", "InjectionToken")
  return $result
}

function Fix-NullReturns {
  param([string]$Content)
  
  # Fix: _observableOf<Type>(null as any) → _observableOf<Type>(null as any as Type)
  $result = [regex]::Replace($Content, '_observableOf<([^>]+)>\(null as any\)', '_observableOf<$1>(null as any as $1)')
  return $result
}

# ── Process each raw file ──────────────────────────────────────────────────
$mapping = @{
  "identity.ts"     = "identity-client.ts"
  "tenant.ts"       = "tenant-client.ts"
  "profile.ts"      = "profile-client.ts"
  "subscription.ts" = "subscription-client.ts"
}

foreach ($entry in $mapping.GetEnumerator()) {
  $src = Join-Path $RawDir $entry.Key
  $dst = Join-Path $OutDir $entry.Value
  
  if (-not (Test-Path $src)) {
    Write-Host "  [SKIP] $($entry.Key) not found" -ForegroundColor Yellow
    continue
  }
  
  Write-Host "  Processing $($entry.Key) ..." -ForegroundColor White
  $content = Get-Content $src -Raw
  $content = Rewrite-Paths $content
  $content = Rewrite-ClassNames $content
  $content = Fix-OpaqueToken $content
  $content = Fix-NullReturns $content
  Set-Content -Path $dst -Value $content -Encoding UTF8
  Write-Host "  [OK] $($entry.Value)" -ForegroundColor Green
}

Write-Host "  [SKIP] chat-client.ts (no swagger endpoints, keeping hand-written)" -ForegroundColor Yellow

Write-Host "`n=== Done ===" -ForegroundColor Cyan
