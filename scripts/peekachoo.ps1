# Peekachoo - Start/Stop Both Frontend and Backend
param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop")]
    [string]$Action = "start"
)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendPath = Join-Path $scriptPath "..\peekachoo-frontend"
$backendPath = Join-Path $scriptPath "..\peekachoo-backend"

switch ($Action) {
    "start" {
        Write-Host "Starting Peekachoo Backend..." -ForegroundColor Green
        
        # Install backend dependencies if needed
        if (-not (Test-Path "$backendPath\node_modules")) {
            Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
            Push-Location $backendPath
            npm install
            Pop-Location
        }

        # Start backend in background
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; npm run dev" -WindowStyle Normal

        Write-Host "Starting Peekachoo Frontend..." -ForegroundColor Green
        
        # Install frontend dependencies if needed
        if (-not (Test-Path "$frontendPath\node_modules")) {
            Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
            Push-Location $frontendPath
            npm install
            Pop-Location
        }

        # Start frontend in background
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendPath'; npm start" -WindowStyle Normal

        Write-Host "Both frontend and backend started in separate windows." -ForegroundColor Cyan
    }
    "stop" {
        Write-Host "Stopping Peekachoo Services..." -ForegroundColor Yellow

        # Find and kill backend processes
        $backendProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
            $_.CommandLine -match "server\.js"
        }

        if ($backendProcesses) {
            $backendProcesses | ForEach-Object {
                Write-Host "Stopping backend process ID: $($_.Id)" -ForegroundColor Red
                Stop-Process -Id $_.Id -Force
            }
            Write-Host "Backend stopped." -ForegroundColor Green
        } else {
            Write-Host "No backend processes found." -ForegroundColor Cyan
        }

        # Find and kill frontend processes
        $frontendProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
            $_.CommandLine -match "webpack" -or $_.CommandLine -match "browser-sync"
        }

        if ($frontendProcesses) {
            $frontendProcesses | ForEach-Object {
                Write-Host "Stopping frontend process ID: $($_.Id)" -ForegroundColor Red
                Stop-Process -Id $_.Id -Force
            }
            Write-Host "Frontend stopped." -ForegroundColor Green
        } else {
            Write-Host "No frontend processes found." -ForegroundColor Cyan
        }

        Write-Host "All services stopped." -ForegroundColor Green
    }
}
