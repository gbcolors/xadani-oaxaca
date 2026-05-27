$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Node = "C:\Program Files\nodejs\node.exe"
$Cloudflared = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Cloudflare.cloudflared_Microsoft.Winget.Source_8wekyb3d8bbwe\cloudflared.exe"
$Logs = Join-Path $ProjectRoot "logs"

New-Item -ItemType Directory -Force $Logs | Out-Null

if (!(Test-Path $Node)) {
  throw "Node.js not found at $Node"
}

if (!(Test-Path $Cloudflared)) {
  throw "cloudflared not found at $Cloudflared"
}

$ServerRunning = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if (!$ServerRunning) {
  Start-Process `
    -FilePath $Node `
    -ArgumentList "local-server.js" `
    -WorkingDirectory $ProjectRoot `
    -RedirectStandardOutput (Join-Path $Logs "local-server.out.log") `
    -RedirectStandardError (Join-Path $Logs "local-server.err.log") `
    -WindowStyle Hidden
}

$TunnelRunning = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if (!$TunnelRunning) {
  Start-Process `
    -FilePath $Cloudflared `
    -ArgumentList "tunnel", "--url", "http://127.0.0.1:3000", "--no-autoupdate" `
    -WorkingDirectory $ProjectRoot `
    -RedirectStandardOutput (Join-Path $Logs "cloudflared.out.log") `
    -RedirectStandardError (Join-Path $Logs "cloudflared.err.log") `
    -WindowStyle Hidden
}

Start-Sleep -Seconds 5

Write-Host "Servidor local: http://127.0.0.1:3000"
Select-String -Path (Join-Path $Logs "cloudflared.err.log") -Pattern "https://[-a-z0-9]+\.trycloudflare\.com" |
  Select-Object -Last 1 |
  ForEach-Object { Write-Host "Tunel publico: $($_.Matches.Value)" }
