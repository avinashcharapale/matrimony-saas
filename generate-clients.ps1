# generate-clients.ps1
# Run this after all services are running (dotnet run or IIS)

$gatewayBase = "http://localhost:8000"
$outputRoot  = "src/app/api"   # adjust to your Angular src path

$services = @(
    @{ name = "identity";     specUrl = "http://localhost:8001/swagger/v1/swagger.json" },
    @{ name = "tenant";       specUrl = "http://localhost:8002/swagger/v1/swagger.json" },
    @{ name = "profile";      specUrl = "http://localhost:8003/swagger/v1/swagger.json" },
    @{ name = "subscription"; specUrl = "http://localhost:8004/swagger/v1/swagger.json" },
    @{ name = "match";        specUrl = "http://localhost:8005/swagger/v1/swagger.json" },
    @{ name = "chat";         specUrl = "http://localhost:8006/swagger/v1/swagger.json" }
)

foreach ($svc in $services) {
    $out = "$outputRoot/$($svc.name)"
    Write-Host "Generating client: $($svc.name) → $out" -ForegroundColor Cyan

    openapi-generator-cli generate `
        -i $svc.specUrl `
        -g typescript-angular `
        -o $out `
        --additional-properties=ngVersion=17,supportsES6=true,withInterfaces=true,fileNaming=kebab-case

    Write-Host "✅ Done: $($svc.name)" -ForegroundColor Green
}

Write-Host "`nAll clients generated. Set base URL to $gatewayBase in each ApiModule." -ForegroundColor Yellow