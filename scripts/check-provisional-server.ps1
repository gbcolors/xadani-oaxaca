$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Logs = Join-Path $ProjectRoot "logs"

Write-Host "Procesos:"
Get-Process | Where-Object { $_.ProcessName -match "node|cloudflared" } | Select-Object ProcessName, Id, Path

Write-Host ""
Write-Host "Servidor local:"
try {
  Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:3000/api/db/init" -TimeoutSec 10 | ConvertTo-Json
} catch {
  Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "Ultimo URL Cloudflare:"
Select-String -Path (Join-Path $Logs "cloudflared.err.log") -Pattern "https://[-a-z0-9]+\.trycloudflare\.com" |
  Select-Object -Last 1 |
  ForEach-Object { $_.Matches.Value }
