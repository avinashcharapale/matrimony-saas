<#
  generate-clients.ps1 — NSwag TypeScript client generator for matrimony-saas
  Usage:
    ./scripts/generate-clients.ps1                    # Generate from gateway (primary)
    ./scripts/generate-clients.ps1 -All               # Generate from gateway + all microservices
    ./scripts/generate-clients.ps1 -Service identity   # Generate from a single microservice
#>
param(
  [switch]$All,
  [string]$Service
)

$ErrorActionPreference = "Stop"

$gatewayConfig = "nswag.gateway.json"
$services = @{
  identity     = "nswag.identity.json"
  profile      = "nswag.profile.json"
  tenant       = "nswag.tenant.json"
  subscription = "nswag.subscription.json"
  chat         = "nswag.chat.json"
}

$rawDir = "libs/generated/src/_raw"
if (-not (Test-Path $rawDir)) {
  New-Item -ItemType Directory -Force -Path $rawDir | Out-Null
}

Write-Host "=== NSwag TypeScript Client Generation ===" -ForegroundColor Cyan

function Invoke-NswagGenerate {
  param([string]$ConfigFile, [string]$Label)

  if (-not (Test-Path $ConfigFile)) {
    Write-Host "  [SKIP] Config not found: $ConfigFile" -ForegroundColor Yellow
    return $false
  }

  Write-Host "  Generating from $Label ..." -ForegroundColor White
  $sw = [System.Diagnostics.Stopwatch]::StartNew()

  try {
    nswag run $ConfigFile 2>&1 | ForEach-Object {
      if ($_ -match "error|Error|ERROR") {
        Write-Host "    $_" -ForegroundColor Red
      }
    }

    if ($LASTEXITCODE -ne 0) {
      Write-Host "  [FAIL] $Label (exit code $LASTEXITCODE)" -ForegroundColor Red
      return $false
    }

    $sw.Stop()
    Write-Host "  [OK] $Label ($($sw.ElapsedMilliseconds)ms)" -ForegroundColor Green
    return $true
  }
  catch {
    $sw.Stop()
    Write-Host "  [FAIL] $Label - $($_.Exception.Message)" -ForegroundColor Red
    return $false
  }
}

# ── Gateway (primary) ──────────────────────────────────────────────────────
Write-Host "`n--- Gateway (http://localhost:8000) ---" -ForegroundColor Yellow
Invoke-NswagGenerate -ConfigFile $gatewayConfig -Label "Gateway"

# ── Individual microservices (optional) ────────────────────────────────────
if ($All -or $Service) {
  if ($Service) {
    if ($services.ContainsKey($Service)) {
      Write-Host "`n--- Service: $Service ---" -ForegroundColor Yellow
      Invoke-NswagGenerate -ConfigFile $services[$Service] -Label $Service
    } else {
      Write-Host "Unknown service: $Service. Available: $($services.Keys -join ', ')" -ForegroundColor Red
      exit 1
    }
  } else {
    foreach ($entry in $services.GetEnumerator()) {
      Write-Host "`n--- Service: $($entry.Key) ---" -ForegroundColor Yellow
      Invoke-NswagGenerate -ConfigFile $entry.Value -Label $entry.Key
    }
  }
}

Write-Host "`n=== Done ===" -ForegroundColor Cyan
Write-Host "Generated files:"
if (Test-Path "$rawDir/clients.ts") {
  Write-Host "  Gateway: $rawDir/clients.ts" -ForegroundColor Green
}
Get-ChildItem "$rawDir/*.ts" -ErrorAction SilentlyContinue | ForEach-Object {
  Write-Host "  $($_.FullName)" -ForegroundColor Gray
}
