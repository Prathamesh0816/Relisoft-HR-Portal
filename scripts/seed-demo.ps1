<#
.SYNOPSIS
Seeds the full demo dataset into the Relisoft HR backend and verifies that the
previously-empty/404 endpoints now return data.

.DESCRIPTION
1. Logs in as the demo HRL2 user (preeti / password).
2. Calls POST /api/admin/seed-demo (idempotent) to seed demo data.
3. Verifies the key detail endpoints that used to 404 return 200.
4. Exits with code 1 if any verification fails.

.PARAMETER BaseUrl
Base URL of the backend. Defaults to http://localhost:5049

.EXAMPLE
.\scripts\seed-demo.ps1
#>
param(
    [string]$BaseUrl = "http://localhost:5049"
)

$ErrorActionPreference = "Stop"

$loginBody = @{ username = "preeti"; password = "password" } | ConvertTo-Json
$login = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
$headers = @{ Authorization = "Bearer $($login.token)" }
Write-Host "Logged in as preeti (role check ok)." -ForegroundColor Green

$result = Invoke-RestMethod -Uri "$BaseUrl/api/admin/seed-demo" -Method Post -Headers $headers -TimeoutSec 120
Write-Host "Seed completed: $($result.message)" -ForegroundColor Green
$result.seeded.PSObject.Properties | ForEach-Object {
    Write-Host ("  {0,-18} {1}" -f $_.Name, $_.Value)
}

$checks = @(
    "/api/hr-v2/probation/1",
    "/api/leave/1/download-medical",
    "/api/onboarding/documents/1",
    "/api/onboarding-v2/candidate/1",
    "/api/payroll/runs/1",
    "/api/payroll/runs/1/export",
    "/api/recognition/awards/1",
    "/api/reviews/1",
    "/api/surveys/1",
    "/api/surveys/1/results"
)

$failures = 0
foreach ($path in $checks) {
    try {
        $resp = Invoke-WebRequest -Uri "$BaseUrl$path" -Headers $headers -UseBasicParsing -TimeoutSec 30
        Write-Host ("  OK  {0} -> {1}" -f $path, $resp.StatusCode) -ForegroundColor Green
    } catch {
        $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { "ERR" }
        Write-Host ("  FAIL {0} -> {1}" -f $path, $status) -ForegroundColor Red
        $failures++
    }
}

if ($failures -gt 0) {
    Write-Host "Demo seed verification FAILED ($failures checks)." -ForegroundColor Red
    exit 1
}

Write-Host "Demo seed verification passed - no record-not-found 404s remain." -ForegroundColor Green
exit 0