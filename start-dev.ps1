$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$BackendDir = Join-Path $RepoRoot "backend"
$FrontendDir = Join-Path $RepoRoot "frontend"
$BackendPort = 5000
$MaxPort = 5010
$BackendLog = Join-Path $RepoRoot ".backend-port.txt"

Write-Host "=== Coworkspace Development Server ===" -ForegroundColor Cyan
Write-Host ""

# Cleanup on exit
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -SupportEvent -Action {
    $jobs = Get-Job -Name "coworkspace-*" -ErrorAction SilentlyContinue
    foreach ($j in $jobs) { Stop-Job $j -ErrorAction SilentlyContinue; Remove-Job $j -ErrorAction SilentlyContinue }
    if (Test-Path $BackendLog) { Remove-Item $BackendLog -Force }
} | Out-Null

# Step 1: Kill orphaned dotnet processes from previous runs
Write-Host "[1/5] Cleaning up orphaned backend processes..." -ForegroundColor Yellow
$existing = Get-Process -Name "dotnet" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -match "Coworkspace" -or $_.CommandLine -match "Coworkspace.API"
}
if ($existing) {
    $existing | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "  Killed $($existing.Count) stale process(es)" -ForegroundColor Gray
} else {
    Write-Host "  No stale processes found" -ForegroundColor Gray
}

# Step 2: Find available port
Write-Host "[2/5] Checking port availability..." -ForegroundColor Yellow
$listeners = [System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners()
$port = $BackendPort
while ($listeners.Port -contains $port -and $port -le $MaxPort) {
    $port++
}
if ($port -gt $MaxPort) {
    Write-Host "  ERROR: No available port found between $BackendPort and $MaxPort" -ForegroundColor Red
    exit 1
}
if ($port -ne $BackendPort) {
    Write-Host "  Port $BackendPort is in use, using port $port instead" -ForegroundColor DarkYellow
} else {
    Write-Host "  Port $BackendPort is available" -ForegroundColor Green
}
$env:ASPNETCORE_URLS = "http://localhost:$port"
$env:API_BACKEND_URL = "http://localhost:$port"

# Save port for frontend reference
Set-Content -Path $BackendLog -Value $port

# Step 3: Start backend
Write-Host "[3/5] Starting backend on http://localhost:$port ..." -ForegroundColor Yellow
$backendJob = Start-Job -Name "coworkspace-backend" -ScriptBlock {
    param($dir, $urls)
    Set-Location $dir
    $env:ASPNETCORE_URLS = $urls
    dotnet run --project (Join-Path $dir "Coworkspace.API.csproj")
} -ArgumentList $BackendDir, "http://localhost:$port"

Write-Host "  Backend PID: $($backendJob.Id) (background job)" -ForegroundColor Gray

# Wait for backend to be ready
Write-Host "  Waiting for backend to respond..." -ForegroundColor Gray
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    try {
        $resp = Invoke-WebRequest -Uri "http://localhost:$port/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($resp.StatusCode -eq 200) {
            $ready = $true
            break
        }
    } catch { }
}
if (-not $ready) {
    Write-Host "  WARNING: Backend may not have started. Check 'Receive-Job -Name coworkspace-backend' for errors." -ForegroundColor Red
} else {
    Write-Host "  Backend is ready!" -ForegroundColor Green
}

# Step 4: Start frontend
Write-Host "[4/5] Starting frontend on http://localhost:3000 ..." -ForegroundColor Yellow
$env:API_BACKEND_URL = "http://localhost:$port"
$frontendJob = Start-Job -Name "coworkspace-frontend" -ScriptBlock {
    param($dir)
    Set-Location $dir
    npm run dev
} -ArgumentList $FrontendDir

Write-Host "  Frontend PID: $($frontendJob.Id) (background job)" -ForegroundColor Gray

Start-Sleep -Seconds 3

# Step 5: Show status
Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:$port  (swagger: http://localhost:$port/swagger)" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "  Environment variables set for this session:" -ForegroundColor Gray
Write-Host "    ASPNETCORE_URLS=http://localhost:$port" -ForegroundColor Gray
Write-Host "    API_BACKEND_URL=http://localhost:$port" -ForegroundColor Gray
Write-Host ""
Write-Host "  To stop: Close this window, or run: Stop-Job coworkspace-backend, coworkspace-frontend | Remove-Job" -ForegroundColor Yellow
Write-Host "  To view backend logs: Receive-Job -Name coworkspace-backend" -ForegroundColor Yellow
Write-Host ""

# Keep the script running so jobs stay alive
Write-Host "Press Ctrl+C to stop all servers..." -ForegroundColor Magenta
while ($true) {
    Start-Sleep -Seconds 10
    # Check if jobs are still running
    $b = Get-Job -Name "coworkspace-backend" -ErrorAction SilentlyContinue
    $f = Get-Job -Name "coworkspace-frontend" -ErrorAction SilentlyContinue
    if (-not $b -and -not $f) {
        Write-Host "Both servers have stopped. Exiting." -ForegroundColor Red
        break
    }
    if (-not $b) {
        Write-Host "Backend has stopped. Frontend may still be running." -ForegroundColor DarkYellow
    }
    if (-not $f) {
        Write-Host "Frontend has stopped. Backend may still be running." -ForegroundColor DarkYellow
    }
    # Show job output if any
    Receive-Job -Name "coworkspace-backend" -Keep -ErrorAction SilentlyContinue | Write-Host
    Receive-Job -Name "coworkspace-frontend" -Keep -ErrorAction SilentlyContinue | Write-Host
}
