# Peekachoo Stop Script (PowerShell)
# Stops both frontend and backend servers

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir
$PidDir = Join-Path $ScriptDir ".pids"

Write-Host "========================================" -ForegroundColor Red
Write-Host "   Stopping Peekachoo Services" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red

function Stop-Service {
    param (
        [string]$ServiceName
    )

    $PidFile = Join-Path $PidDir "$ServiceName.pid"

    if (Test-Path $PidFile) {
        $Pid = Get-Content $PidFile
        try {
            $Process = Get-Process -Id $Pid -ErrorAction SilentlyContinue
            if ($Process) {
                Write-Host "Stopping $ServiceName (PID: $Pid)..." -ForegroundColor Yellow
                Stop-Process -Id $Pid -Force -ErrorAction SilentlyContinue

                # Wait for process to terminate
                $timeout = 10
                while ($timeout -gt 0) {
                    $Process = Get-Process -Id $Pid -ErrorAction SilentlyContinue
                    if (-not $Process) {
                        break
                    }
                    Start-Sleep -Milliseconds 500
                    $timeout--
                }

                Write-Host "$ServiceName stopped" -ForegroundColor Green
            } else {
                Write-Host "$ServiceName is not running (stale PID file)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "$ServiceName is not running" -ForegroundColor Yellow
        }
        Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
    } else {
        Write-Host "$ServiceName PID file not found" -ForegroundColor Yellow
    }
}

# Stop Frontend first
Stop-Service -ServiceName "frontend"

# Stop Backend
Stop-Service -ServiceName "backend"

# Also kill any remaining node processes on common ports
Write-Host "Cleaning up any remaining processes..." -ForegroundColor Yellow

# Kill processes on port 3000
try {
    $connections = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    foreach ($conn in $connections) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    }
} catch {
    # Port might not be in use
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   All Services Stopped" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
