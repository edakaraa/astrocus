# Haftalık rapor Edge Function'ını manuel tetikler (eksik haftaları backfill eder).
# Gerekli: SUPABASE_URL ve CRON_SECRET (backend/.env veya ortam değişkeni)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$envFile = Join-Path $repoRoot "backend\.env"

if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') {
      $key = $matches[1].Trim()
      $value = $matches[2].Trim().Trim('"').Trim("'")
      if (-not (Get-Item -Path "Env:$key" -ErrorAction SilentlyContinue)) {
        Set-Item -Path "Env:$key" -Value $value
      }
    }
  }
}

$baseUrl = $env:SUPABASE_URL
$secret = $env:CRON_SECRET

if (-not $baseUrl -or -not $secret) {
  Write-Error "SUPABASE_URL ve CRON_SECRET gerekli."
}

$url = "$($baseUrl.TrimEnd('/'))/functions/v1/generate-weekly-reports"
$body = '{"backfill":true}'

Write-Host "Tetikleniyor: $url"

$response = Invoke-RestMethod -Method Post -Uri $url `
  -Headers @{
    "x-cron-secret" = $secret
    "Content-Type"  = "application/json"
  } `
  -Body $body

$response | ConvertTo-Json -Depth 6
Write-Host "Tamam. En güncel hafta: $($response.week_start)"
