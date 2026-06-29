#!/bin/sh
echo "[entrypoint] Starting diagnostic..."
echo "[entrypoint] PORT=${PORT:-not set}"
echo "[entrypoint] ASPNETCORE_ENVIRONMENT=${ASPNETCORE_ENVIRONMENT:-not set}"
echo "[entrypoint] Checking dotnet..."
dotnet --info 2>&1
echo "[entrypoint] dotnet OK. Starting app..."
exec dotnet Coworkspace.API.dll
echo "[entrypoint] App exited with code $?"