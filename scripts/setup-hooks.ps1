#
# Setup script to install git hooks for Peekachoo
# Run this script after cloning the repository
#

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$HooksSrc = Join-Path $RootDir "hooks"
$HooksDest = Join-Path $RootDir ".git\hooks"

Write-Host "Installing git hooks..." -ForegroundColor Cyan

# Check if hooks source directory exists
if (-not (Test-Path $HooksSrc)) {
    Write-Host "Error: hooks directory not found at $HooksSrc" -ForegroundColor Red
    exit 1
}

# Copy pre-push hook
$PrePushSrc = Join-Path $HooksSrc "pre-push"
$PrePushDest = Join-Path $HooksDest "pre-push"

if (Test-Path $PrePushSrc) {
    Copy-Item -Path $PrePushSrc -Destination $PrePushDest -Force
    Write-Host "✓ Installed pre-push hook" -ForegroundColor Green
} else {
    Write-Host "⚠ pre-push hook not found, skipping" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Git hooks installed successfully!" -ForegroundColor Green
Write-Host "The pre-push hook will run lint on all modules before each push."
