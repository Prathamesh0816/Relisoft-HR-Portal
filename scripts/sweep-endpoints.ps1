<#
.SYNOPSIS
Sweeps every GET endpoint exposed in the Swagger spec and reports non-200
responses so route-level 404s / 500s are caught quickly.

.DESCRIPTION
1. Logs in as preeti (demo HRL2 user).
2. Pulls the Swagger JSON from the backend and enumerates all GET paths.
3. Substitutes path parameters with demo-friendly values.
4. Calls every endpoint and reports any response that is not 2xx.
5. Exits with code 1 if any 500 (unhandled) is found.

.PARAMETER BaseUrl
Base URL of the backend. Defaults to http://localhost:5049

.EXAMPLE
.\scripts\sweep-endpoints.ps1
#>
param(
    [string]$BaseUrl = "http://localhost:5049"
)

$ErrorActionPreference = "Stop"

$loginBody = @{ username = "preeti"; password = "password" } | ConvertTo-Json
$login = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
$headers = @{ Authorization = "Bearer $($login.token)" }

$swagger = Invoke-RestMethod -Uri "$BaseUrl/swagger/v1/swagger.json" -Headers $headers -TimeoutSec 60
$paths = $swagger.paths.PSObject.Properties.Name

function Resolve-Param([string]$name) {
    if ($name -match "month") { return "8" }
    if ($name -match "year") { return "2026" }
    if ($name -match "date") { return "2026-08-20" }
    return "1"
}

$results = @()
foreach ($path in $paths) {
    $get = $swagger.paths.$path.get
    if (-not $get) { continue }
    $resolved = $path
    foreach ($m in [regex]::Matches($path, '\{([^}]+)\}')) {
        $resolved = $resolved.Replace($m.Value, (Resolve-Param $m.Groups[1].Value))
    }
    try {
        $resp = Invoke-WebRequest -Uri "$BaseUrl$resolved" -Headers $headers -UseBasicParsing -TimeoutSec 30
        $results += [pscustomobject]@{ Path = $path; Status = $resp.StatusCode }
    } catch {
        $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { "ERR" }
        $results += [pscustomobject]@{ Path = $path; Status = $status }
    }
}

$grouped = $results | Group-Object Status | Sort-Object Name
$grouped | ForEach-Object { Write-Host ("Status {0}: {1} endpoints" -f $_.Name, $_.Count) }

$bad = $results | Where-Object { $_.Status -eq 500 -or $_.Status -eq "ERR" }
$notFound = $results | Where-Object { $_.Status -eq 404 }
$other = $results | Where-Object { [int]$_.Status -lt 200 -or [int]$_.Status -ge 400 } | Where-Object { $_.Status -ne 404 }

if ($bad) {
    Write-Host "`nUnhandled server errors:" -ForegroundColor Red
    $bad | ForEach-Object { Write-Host ("  {0} -> {1}" -f $_.Path, $_.Status) -ForegroundColor Red }
    exit 1
}

Write-Host "`nNo unhandled 500s."
Write-Host "Total GET endpoints swept: $($results.Count)" -ForegroundColor Green
if ($notFound) {
    Write-Host "`n404 responses ($($notFound.Count)) - review whether they are expected:" -ForegroundColor Yellow
    $notFound | ForEach-Object { Write-Host ("  {0}" -f $_.Path) -ForegroundColor Yellow }
}
if ($other) {
    Write-Host "`nOther non-2xx responses:" -ForegroundColor Yellow
    $other | ForEach-Object { Write-Host ("  {0} -> {1}" -f $_.Path, $_.Status) -ForegroundColor Yellow }
}
exit 0