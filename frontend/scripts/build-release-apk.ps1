# Release APK/AAB without EAS. Usage: .\scripts\build-release-apk.ps1 [-Bundle]
param([switch]$Bundle)

$ErrorActionPreference = "Stop"

$androidStudioJbr = "C:\Program Files\Android\Android Studio\jbr"
$androidSdk = "$env:LOCALAPPDATA\Android\Sdk"
$frontendRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

if (-not (Test-Path $androidStudioJbr)) {
  Write-Error "Android Studio JDK not found: $androidStudioJbr"
}
if (-not (Test-Path $androidSdk)) {
  Write-Error "Android SDK not found: $androidSdk"
}

$env:JAVA_HOME = $androidStudioJbr
$env:ANDROID_HOME = $androidSdk
$env:APP_ENV = "production"
$env:NODE_ENV = "production"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"

if (-not $env:SENTRY_AUTH_TOKEN) {
  $env:SENTRY_DISABLE_AUTO_UPLOAD = "true"
  Write-Host '[Astrocus] SENTRY_AUTH_TOKEN yok — source map yuklemesi atlaniyor.'
}

$localProps = Join-Path $frontendRoot "android\local.properties"
$escapedSdk = $androidSdk -replace "\\", "\\\\"
"sdk.dir=$escapedSdk" | Set-Content -Path $localProps -Encoding ASCII

if (-not (Test-Path (Join-Path $frontendRoot "android"))) {
  Write-Host '[Astrocus] android/ yok — prebuild calistiriliyor...'
  Set-Location $frontendRoot
  npx expo prebuild --platform android
}

Set-Location (Join-Path $frontendRoot "android")
$task = if ($Bundle) { "bundleRelease" } else { "assembleRelease" }
Write-Host ('[Astrocus] gradlew {0} (APP_ENV=production)' -f $task)
.\gradlew.bat $task
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

if ($Bundle) {
  Write-Host '[Astrocus] AAB: android\app\build\outputs\bundle\release\app-release.aab'
} else {
  Write-Host '[Astrocus] APK: android\app\build\outputs\apk\release\app-release.apk'
}
