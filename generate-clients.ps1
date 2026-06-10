# generate-clients.ps1
# Run this after all services are running (dotnet run or IIS)

param(
    [string[]]$Service
)

$ErrorActionPreference = "Stop"

function Test-CommandExists {
    param([string]$Name)
    return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Resolve-JavaExecutable {
    if (Test-CommandExists "java") {
        return "java"
    }

    $candidates = @()

    if ($env:JAVA_HOME) {
        $candidates += (Join-Path $env:JAVA_HOME "bin\\java.exe")
    }

    $commonRoots = @(
        "C:\\Program Files\\Eclipse Adoptium",
        "C:\\Program Files\\Java"
    )

    foreach ($root in $commonRoots) {
        if (Test-Path $root) {
            $jdkFolders = Get-ChildItem $root -Directory -ErrorAction SilentlyContinue |
                Sort-Object LastWriteTime -Descending
            foreach ($jdk in $jdkFolders) {
                $candidates += (Join-Path $jdk.FullName "bin\\java.exe")
            }
        }
    }

    foreach ($candidate in $candidates) {
        if ($candidate -and (Test-Path $candidate)) {
            return $candidate
        }
    }

    return $null
}

$javaExe = Resolve-JavaExecutable

if (-not $javaExe) {
    Write-Host "Missing prerequisite: Java runtime was not found on PATH." -ForegroundColor Red
    Write-Host "Install JDK 17+ (or set JAVA_HOME) and rerun this script." -ForegroundColor Yellow
    exit 1
}

if ($javaExe -ne "java") {
    Write-Host "Using detected Java executable: $javaExe" -ForegroundColor DarkGray
}

$gatewayBase = "http://localhost:8000"
$outputRoot  = "src/app/api"   # adjust to your Angular src path
$generatorCliVersion = ((Get-Content -Raw (Join-Path $PSScriptRoot "openapitools.json") | ConvertFrom-Json).'generator-cli').version
$generatorJarDir = Join-Path $PSScriptRoot ".openapi-generator"

function Resolve-GeneratorJar {
    param([string]$Version)

    $jarPath = Join-Path $generatorJarDir "openapi-generator-cli-$Version.jar"
    if (Test-Path $jarPath) {
        return $jarPath
    }

    New-Item -ItemType Directory -Force -Path $generatorJarDir | Out-Null

    $downloadUrl = "https://repo1.maven.org/maven2/org/openapitools/openapi-generator-cli/$Version/openapi-generator-cli-$Version.jar"
    Write-Host "Downloading OpenAPI Generator $Version ..." -ForegroundColor DarkGray
    Invoke-WebRequest -Uri $downloadUrl -OutFile $jarPath
    return $jarPath
}

$generatorJar = Resolve-GeneratorJar -Version $generatorCliVersion

$services = @(
    @{ name = "identity";     specUrl = "http://localhost:8001/swagger/v1/swagger.json" },
    @{ name = "tenant";       specUrl = "http://localhost:8002/swagger/v1/swagger.json" },
    @{ name = "profile";      specUrl = "http://localhost:8003/swagger/v1/swagger.json" },
    @{ name = "subscription"; specUrl = "http://localhost:8004/swagger/v1/swagger.json" },
    @{ name = "match";        specUrl = "http://localhost:8005/swagger/v1/swagger.json" },
    @{ name = "chat";         specUrl = "http://localhost:8006/swagger/v1/swagger.json" }
)

if ($Service) {
    $requestedServices = $Service | ForEach-Object { $_.ToLowerInvariant() }
    $services = $services | Where-Object { $requestedServices -contains $_.name }

    if (-not $services -or $services.Count -eq 0) {
        Write-Host "No matching services requested. Valid values are: identity, tenant, profile, subscription, match, chat." -ForegroundColor Red
        exit 1
    }
}

foreach ($svc in $services) {
    $out = "$outputRoot/$($svc.name)"
    Write-Host "Generating client: $($svc.name) → $out" -ForegroundColor Cyan

    try {
        Invoke-WebRequest -Uri $svc.specUrl -Method Get -UseBasicParsing | Out-Null
    }
    catch {
        Write-Host "Swagger endpoint is unreachable: $($svc.specUrl)" -ForegroundColor Red
        Write-Host "Start the service for '$($svc.name)' and try again." -ForegroundColor Yellow
        exit 1
    }

    & $javaExe -jar $generatorJar generate `
        -i $svc.specUrl `
        -g typescript-angular `
        -o $out `
        --additional-properties=ngVersion=17,supportsES6=true,withInterfaces=true,fileNaming=kebab-case

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Generation failed for service '$($svc.name)' with exit code $LASTEXITCODE." -ForegroundColor Red
        exit $LASTEXITCODE
    }

    Write-Host "✅ Done: $($svc.name)" -ForegroundColor Green
}

Write-Host "`nAll clients generated. Set base URL to $gatewayBase in each ApiModule." -ForegroundColor Yellow