<#
.SYNOPSIS
    Starts the DataSphere Analytics & Prediction Dashboard.
.DESCRIPTION
    Launches FastAPI backend on port 8001, waits for it, then launches Vite frontend on port 5173.
#>

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

$DashDir = (Get-Location).Path

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "   Starting DataSphere Dashboard    " -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# 1. Start Backend Server
Write-Host ""
Write-Host "[1/3] Launching FastAPI Backend (Port 8001)..." -ForegroundColor Yellow
$BackendCmd = "Set-Location '$DashDir\backend'; python run.py"
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", $BackendCmd

# 2. Wait for backend to be ready
Write-Host "[2/3] Waiting for backend to become ready..." -ForegroundColor Yellow
$maxWait = 60
$waited = 0
$ready = $false
while ($waited -lt $maxWait) {
    Start-Sleep -Seconds 2
    $waited += 2
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:8001/" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $ready = $true
            break
        }
    } catch {
        Write-Host "      Waiting... ($waited s)" -ForegroundColor DarkGray
    }
}

if ($ready) {
    Write-Host "      Backend is READY!" -ForegroundColor Green
} else {
    Write-Host "      Backend did not respond within $maxWait seconds." -ForegroundColor Red
    Write-Host "      Starting frontend anyway." -ForegroundColor Red
}

# 3. Start Frontend Server
Write-Host "[3/3] Launching Vite React Frontend (Port 5173)..." -ForegroundColor Yellow
$FrontendCmd = "Set-Location '$DashDir\frontend'; npm run dev"
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", $FrontendCmd

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "  DataSphere is up and running!     " -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173   " -ForegroundColor Green
Write-Host "  Backend:  http://127.0.0.1:8001   " -ForegroundColor Green
Write-Host "  API Docs: http://127.0.0.1:8001/docs" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
