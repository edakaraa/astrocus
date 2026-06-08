# Dev-only helper: sets JAVA_HOME + ANDROID_HOME, then runs expo run:android.
# Not bundled in the app APK.
$ErrorActionPreference = "Stop"

$androidStudioJbr = "C:\Program Files\Android\Android Studio\jbr"
$androidSdk = "$env:LOCALAPPDATA\Android\Sdk"

if (-not (Test-Path $androidStudioJbr)) {
  Write-Error "Android Studio JDK not found: $androidStudioJbr"
}

if (-not (Test-Path $androidSdk)) {
  Write-Error "Android SDK not found: $androidSdk (install via Android Studio SDK Manager)"
}

$env:JAVA_HOME = $androidStudioJbr
$env:ANDROID_HOME = $androidSdk
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:PATH"

$localProps = Join-Path $PSScriptRoot "..\android\local.properties"
$escapedSdk = $androidSdk -replace "\\", "\\\\"
"sdk.dir=$escapedSdk" | Set-Content -Path $localProps -Encoding ASCII

Write-Host "[Astrocus] JAVA_HOME=$env:JAVA_HOME"
Write-Host "[Astrocus] ANDROID_HOME=$env:ANDROID_HOME"

Set-Location (Join-Path $PSScriptRoot "..")
npx expo run:android @args
