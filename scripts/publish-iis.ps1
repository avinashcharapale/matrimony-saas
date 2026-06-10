param(
  [string]$PublishRoot = 'C:\inetpub\matrimony-saas',
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$webTarget = Join-Path $PublishRoot 'web-angular'
$apiTarget = Join-Path $PublishRoot 'api'

if (-not $SkipBuild) {
  Write-Host 'Building web-angular (production)...' -ForegroundColor Cyan
  npx nx run web-angular:build:production

  Write-Host 'Building api (production)...' -ForegroundColor Cyan
  npx nx run api:build:production
}

New-Item -Path $webTarget -ItemType Directory -Force | Out-Null
New-Item -Path $apiTarget -ItemType Directory -Force | Out-Null

Write-Host 'Publishing web output...' -ForegroundColor Cyan
$webBuildRoot = Join-Path $repoRoot 'dist\apps\web-angular\browser'
if (-not (Test-Path $webBuildRoot)) {
  throw "Expected web build output was not found at $webBuildRoot"
}
Copy-Item -Path (Join-Path $webBuildRoot '*') -Destination $webTarget -Recurse -Force

Write-Host 'Publishing api output...' -ForegroundColor Cyan
Copy-Item -Path (Join-Path $repoRoot 'apps\api\dist\*') -Destination $apiTarget -Recurse -Force

if (Test-Path (Join-Path $repoRoot 'apps\api\dist\package.json')) {
  Push-Location $apiTarget
  try {
    Write-Host 'Installing API runtime dependencies...' -ForegroundColor Cyan
    npm install --omit=dev
  }
  finally {
    Pop-Location
  }
}

Write-Host ''
Write-Host 'Publish complete.' -ForegroundColor Green
Write-Host "Web folder: $webTarget"
Write-Host "API folder: $apiTarget"
Write-Host ''
Write-Host 'Next: configure IIS site root to web folder, then run API with a process manager on port 3333.' -ForegroundColor Yellow
