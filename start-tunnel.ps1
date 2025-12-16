# Start Dev Tunnel for Beta Testing
# This script starts the dev tunnel on port 5000

Write-Host "Starting dev tunnel on port 5000..." -ForegroundColor Green

# Try using devtunnel from PATH first
$devtunnelCmd = Get-Command devtunnel -ErrorAction SilentlyContinue

if ($devtunnelCmd) {
    # devtunnel is in PATH
    devtunnel host -p 5000 --allow-anonymous
} else {
    # Use full path
    $devtunnelPath = "C:\Users\Tycoon James Flores\AppData\Local\Microsoft\WinGet\Packages\Microsoft.devtunnel_Microsoft.Winget.Source_8wekyb3d8bbwe\devtunnel.exe"
    
    if (Test-Path $devtunnelPath) {
        & $devtunnelPath host -p 5000 --allow-anonymous
    } else {
        Write-Host "Error: devtunnel not found!" -ForegroundColor Red
        Write-Host "Please install it with: winget install Microsoft.devtunnel" -ForegroundColor Yellow
    }
}
