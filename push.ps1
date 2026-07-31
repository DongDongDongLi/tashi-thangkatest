# Push to: https://github.com/DongDongDongLi/tashi-thangkatest
# Keep Clash proxy ON (127.0.0.1:10809). Create PAT with "repo" scope first.

$ErrorActionPreference = "Stop"
$env:HTTP_PROXY = "http://127.0.0.1:10809"
$env:HTTPS_PROXY = "http://127.0.0.1:10809"
$env:ALL_PROXY = "http://127.0.0.1:10809"

Set-Location $PSScriptRoot

Write-Host ""
Write-Host "=== Push to DongDongDongLi/tashi-thangkatest ===" -ForegroundColor Cyan
Write-Host "Password prompt = paste Personal Access Token (NOT account password)"
Write-Host "Create token: https://github.com/settings/tokens  (check repo)"
Write-Host ""

$secure = Read-Host "Paste Personal Access Token" -AsSecureString
$BSTR = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
$token = [Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)

if ([string]::IsNullOrWhiteSpace($token)) {
  Write-Host "Token empty. Exit." -ForegroundColor Red
  exit 1
}

$remote = "https://DongDongDongLi:$token@github.com/DongDongDongLi/tashi-thangkatest.git"
git push -u $remote main

if ($LASTEXITCODE -eq 0) {
  git remote set-url origin "https://github.com/DongDongDongLi/tashi-thangkatest.git"
  Write-Host ""
  Write-Host "SUCCESS: https://github.com/DongDongDongLi/tashi-thangkatest" -ForegroundColor Green
} else {
  Write-Host "Push failed. Check token scope=repo and proxy is on." -ForegroundColor Red
}

Read-Host "Press Enter to close"
