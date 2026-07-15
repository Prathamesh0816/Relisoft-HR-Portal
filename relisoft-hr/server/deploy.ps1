param(
    [string]$TargetDir = "C:\RelisoftHR\Server",
    [string]$DbConnection = "",
    [string]$JwtKey = "",
    [string]$CorsOrigins = ""
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== Relisoft HR Server Publish ===" -ForegroundColor Cyan

dotnet publish $projectRoot -c Release --output $TargetDir --verbosity minimal
if ($LASTEXITCODE -ne 0) { throw "Publish failed" }

if ($DbConnection) {
    [System.Environment]::SetEnvironmentVariable("ConnectionStrings__DefaultConnection", $DbConnection, "Machine")
}
if ($JwtKey) {
    [System.Environment]::SetEnvironmentVariable("Jwt__Key", $JwtKey, "Machine")
}
if ($CorsOrigins) {
    [System.Environment]::SetEnvironmentVariable("CorsOrigins", $CorsOrigins, "Machine")
}

Write-Host "`n=== Published to $TargetDir ===" -ForegroundColor Green
Write-Host "Set these environment variables on the target machine (or use the script above):" -ForegroundColor Yellow
Write-Host "  ConnectionStrings__DefaultConnection = <SQL Server connection string>" -ForegroundColor White
Write-Host "  Jwt__Key                            = <32+ character secret>" -ForegroundColor White
Write-Host "  CorsOrigins                         = https://your-client-domain.com" -ForegroundColor White
Write-Host "  ASPNETCORE_ENVIRONMENT              = Production" -ForegroundColor White
Write-Host "`nTo run: cd $TargetDir && .\RelisoftHR.exe" -ForegroundColor Cyan
Write-Host "Or install as Windows Service:"
Write-Host "  sc.exe create RelisoftHR binPath=$TargetDir\RelisoftHR.exe start=auto" -ForegroundColor Gray
