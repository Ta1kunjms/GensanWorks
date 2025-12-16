# Start FAST Tunnel (Production build)
# - Builds the app (optional)
# - Starts the production server (serves bundled assets)
# - Exposes it via devtunnel
#
# Usage:
#   .\start-tunnel-fast.ps1                # start prod server + tunnel
#   .\start-tunnel-fast.ps1 -Build         # build first, then start
#   .\start-tunnel-fast.ps1 -Port 5000

param(
  [int]$Port = 5000,
  [switch]$Build
)

$ErrorActionPreference = "Stop"

function Resolve-DevtunnelCommand {
  $cmd = Get-Command devtunnel -ErrorAction SilentlyContinue
  if ($cmd) {
    return "devtunnel"
  }

  $devtunnelPath = "C:\Users\Tycoon James Flores\AppData\Local\Microsoft\WinGet\Packages\Microsoft.devtunnel_Microsoft.Winget.Source_8wekyb3d8bbwe\devtunnel.exe"
  if (Test-Path $devtunnelPath) {
    return $devtunnelPath
  }

  throw "devtunnel not found. Install with: winget install Microsoft.devtunnel"
}

function Wait-ForHealth {
  param(
    [int]$Port,
    [int]$TimeoutSeconds = 30
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  $url = "http://127.0.0.1:$Port/api/health"

  while ((Get-Date) -lt $deadline) {
    try {
      $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
      if ($resp.StatusCode -eq 200) {
        return
      }
    } catch {
      Start-Sleep -Milliseconds 500
    }
  }

  throw "Timed out waiting for server health at $url"
}

Write-Host "[FAST TUNNEL] Port: $Port" -ForegroundColor Green

if ($Build) {
  Write-Host "[FAST TUNNEL] Building (npm run build)..." -ForegroundColor Green
  npm run build
}

# Ensure PORT is applied to the prod server
$env:PORT = "$Port"

Write-Host "[FAST TUNNEL] Starting production server (npm start)..." -ForegroundColor Green
$serverProcess = Start-Process -FilePath "npm.cmd" -ArgumentList @("start") -NoNewWindow -PassThru

try {
  Write-Host "[FAST TUNNEL] Waiting for /api/health..." -ForegroundColor Green
  Wait-ForHealth -Port $Port -TimeoutSeconds 45

  $devtunnel = Resolve-DevtunnelCommand
  Write-Host "[FAST TUNNEL] Starting devtunnel..." -ForegroundColor Green

  if ($devtunnel -eq "devtunnel") {
    devtunnel host -p $Port --allow-anonymous
  } else {
    & $devtunnel host -p $Port --allow-anonymous
  }
} finally {
  if ($serverProcess -and -not $serverProcess.HasExited) {
    Write-Host "[FAST TUNNEL] Stopping production server..." -ForegroundColor Yellow
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
  }
}
