# Peekachoo Start Script (PowerShell)
# Starts both frontend and backend servers

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir
$FrontendDir = Join-Path $ProjectDir "peekachoo-frontend"
$BackendDir = Join-Path $ProjectDir "peekachoo-backend"
$PidDir = Join-Path $ScriptDir ".pids"

Write-Host "========================================" -ForegroundColor Green
Write-Host "   Starting Peekachoo Services" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Check if directories exist
if (-not (Test-Path $FrontendDir)) {
    Write-Host "Error: Frontend directory not found at $FrontendDir" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $BackendDir)) {
    Write-Host "Error: Backend directory not found at $BackendDir" -ForegroundColor Red
    exit 1
}

# Create PID directory
if (-not (Test-Path $PidDir)) {
    New-Item -ItemType Directory -Path $PidDir | Out-Null
}

# Start Backend
Write-Host "Starting Backend..." -ForegroundColor Yellow
Set-Location $BackendDir

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if .env exists
if (-not (Test-Path ".env") -and (Test-Path ".env.example")) {
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

$BackendLog = Join-Path $PidDir "backend.log"
$BackendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden -PassThru -RedirectStandardOutput $BackendLog -RedirectStandardError (Join-Path $PidDir "backend.error.log")
$BackendProcess.Id | Out-File (Join-Path $PidDir "backend.pid")
Write-Host "Backend started with PID: $($BackendProcess.Id)" -ForegroundColor Green

# Wait for backend to initialize
Start-Sleep -Seconds 2

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Yellow
Set-Location $FrontendDir

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

$FrontendLog = Join-Path $PidDir "frontend.log"
$FrontendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden -PassThru -RedirectStandardOutput $FrontendLog -RedirectStandardError (Join-Path $PidDir "frontend.error.log")
$FrontendProcess.Id | Out-File (Join-Path $PidDir "frontend.pid")
Write-Host "Frontend started with PID: $($FrontendProcess.Id)" -ForegroundColor Green

Set-Location $ProjectDir

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   All Services Started Successfully" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  " -NoNewline
Write-Host "http://localhost:3000" -ForegroundColor Yellow -NoNewline
Write-Host " (API)"
Write-Host "Frontend: " -NoNewline
Write-Host "http://localhost:3000" -ForegroundColor Yellow -NoNewline
Write-Host " (Game)"
Write-Host ""
Write-Host "Logs:"
Write-Host "  Backend:  $BackendLog"
Write-Host "  Frontend: $FrontendLog"
Write-Host ""
Write-Host "Run " -NoNewline
Write-Host ".\scripts\stop.ps1" -ForegroundColor Yellow -NoNewline
Write-Host " to stop all services"
