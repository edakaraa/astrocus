# Astrocus Android imza parmak izleri (Google Sign-In / Firebase).
# Kullanım: .\scripts\print-android-sha1.ps1
$ErrorActionPreference = "Stop"

$frontendRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$androidStudioJbr = "C:\Program Files\Android\Android Studio\jbr"
$keytool = Join-Path $androidStudioJbr "bin\keytool.exe"

if (-not (Test-Path $keytool)) {
  Write-Error "keytool bulunamadi: $keytool"
}

function Get-ShaFingerprints {
  param(
    [string]$Label,
    [string]$Keystore,
    [string]$Alias,
    [string]$StorePass
  )

  if (-not (Test-Path $Keystore)) {
    Write-Host "[Astrocus] $Label — keystore yok: $Keystore"
    return
  }

  Write-Host ""
  Write-Host "=== $Label ===" -ForegroundColor Cyan
  Write-Host "Keystore: $Keystore"
  Write-Host "Alias:    $Alias"
  $out = & $keytool -list -v -keystore $Keystore -alias $Alias -storepass $StorePass 2>&1 | Out-String
  $sha1 = if ($out -match 'SHA1:\s*([0-9A-F:]+)') { $Matches[1] } else { '?' }
  $sha256 = if ($out -match 'SHA256:\s*([0-9A-F:]+)') { $Matches[1] } else { '?' }
  Write-Host "SHA-1:    $sha1"
  Write-Host "SHA-256:  $sha256"
}

$gradleProps = Join-Path $frontendRoot "android\gradle.properties"
$releaseStore = "astrocus-release.jks"
$releaseAlias = "astrocus"
$releasePass = ""
if (Test-Path $gradleProps) {
  Get-Content $gradleProps | ForEach-Object {
    if ($_ -match "^ASTROCUS_UPLOAD_STORE_FILE=(.+)$") { $releaseStore = $Matches[1].Trim() }
    if ($_ -match "^ASTROCUS_UPLOAD_KEY_ALIAS=(.+)$") { $releaseAlias = $Matches[1].Trim() }
    if ($_ -match "^ASTROCUS_UPLOAD_STORE_PASSWORD=(.+)$") { $releasePass = $Matches[1].Trim() }
  }
}

Get-ShaFingerprints -Label "Release (yerel APK / Play upload key)" `
  -Keystore (Join-Path $frontendRoot "android\app\$releaseStore") `
  -Alias $releaseAlias `
  -StorePass $releasePass

Get-ShaFingerprints -Label "Debug (gelistirme)" `
  -Keystore (Join-Path $frontendRoot "android\app\debug.keystore") `
  -Alias "androiddebugkey" `
  -StorePass "android"

Write-Host ""
Write-Host "Google Cloud / Firebase'e eklenecekler:" -ForegroundColor Yellow
Write-Host "  1. Google Cloud -> APIs & Services -> Credentials -> Android OAuth client"
Write-Host "     Package: com.astrocus.app + yukaridaki Release SHA-1"
Write-Host "  2. Play Console -> App integrity -> App signing key certificate SHA-1"
Write-Host "  3. Firebase -> Project settings -> Android app -> Add fingerprint"
Write-Host ""
