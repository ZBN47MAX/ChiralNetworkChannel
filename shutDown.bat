@echo off
REM Chiral Network Channel - one-click stop
REM
REM Three-stage kill with increasing aggression:
REM
REM   1. PID file path:   read .server.pid, verify it's node.exe, taskkill /F
REM   2. Port scan path:  netstat every candidate port, kill node LISTENING there
REM   3. Command-line sweep (safety net): PowerShell Get-CimInstance to find
REM      any node.exe whose command line contains the absolute path to THIS
REM      install's server.js, and kill those too. This catches orphan
REM      processes that landed on unexpected ports or got their PID file
REM      clobbered by a racing boot.
REM
REM Absolute path match in stage 3 means we won't nuke another project on
REM the same machine that also runs a server.js.
REM
REM taskkill /F is TerminateProcess on Windows - it does NOT deliver
REM SIGTERM, so server.js's shutdown() won't run. The on-exit cleanup
REM hooks in server.js also do not fire. That's why this script also
REM manually cleans the dotfiles (.server.pid/.server.port/.server.boot-lock).

setlocal EnableDelayedExpansion

cd /d "%~dp0"

set "PIDFILE=.server.pid"
set "PORTFILE=.server.port"
set "LOCKDIR=.server.boot-lock"
REM Candidate port list - MUST stay in sync with config.PORT_FALLBACKS
REM and ChiralNetworkChannel.bat.
set "PORT_LIST=8080 8081 8088 8888 8090 9090 9091 9191 18080 28080 38080 48080 58080 8000 8001 3000 5000 7000"
set "PS=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"

set "KILLED="

REM =====================================================================
REM Stage 1 - PID file
REM =====================================================================
if exist "%PIDFILE%" (
    set /p PID=<"%PIDFILE%"
    if defined PID (
        tasklist /fi "pid eq !PID!" 2>nul | findstr /i "node.exe" >nul
        if errorlevel 1 (
            echo PID file points at dead process !PID! - discarding
        ) else (
            echo Stopping node PID=!PID!
            taskkill /F /PID !PID! >nul 2>&1
            if errorlevel 1 (
                echo taskkill failed for PID=!PID!
            ) else (
                echo Killed PID !PID!
                set "KILLED=1"
            )
        )
    )
    del "%PIDFILE%" >nul 2>&1
)

REM =====================================================================
REM Stage 2 - Port scan
REM =====================================================================
set "SCAN_PORTS="
if exist "%PORTFILE%" (
    set /p REAL_PORT=<"%PORTFILE%"
    if defined REAL_PORT set "SCAN_PORTS=!REAL_PORT!"
)
if not defined SCAN_PORTS set "SCAN_PORTS=%PORT_LIST%"

set "FOUND="
for %%P in (!SCAN_PORTS!) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%P " ^| findstr "LISTENING"') do (
        set "FOUND=%%a"
        tasklist /fi "pid eq %%a" 2>nul | findstr /i "node.exe" >nul
        if not errorlevel 1 (
            echo Stopping node on port %%P PID=%%a
            taskkill /F /PID %%a >nul 2>&1
            if not errorlevel 1 set "KILLED=1"
        ) else (
            echo Port %%P held by non-node PID=%%a - leaving alone
        )
    )
)

if exist "%PORTFILE%" del "%PORTFILE%" >nul 2>&1

REM =====================================================================
REM Stage 3 - Command-line sweep safety net
REM
REM Catches orphan node.exe whose PID we lost track of (fast-boot races,
REM ephemeral ports, crashed launchers, etc.). Uses Get-CimInstance
REM because wmic is being removed in recent Win11 and was slow anyway.
REM The match is against the ABSOLUTE path to this install's server.js,
REM so unrelated node projects on the same machine are not affected.
REM =====================================================================
set "SERVER_JS=%~dp0server.js"
if exist "%PS%" (
    REM Single-line PS invocation. Using -like with a literal absolute
    REM path avoids regex-escape headaches and the cmd-vs-powershell
    REM double-quote war zone entirely. Get-CimInstance without -Filter
    REM is slightly slower but far less error-prone.
    "%PS%" -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -and ($_.CommandLine -like ('*' + '%SERVER_JS%' + '*')) } | ForEach-Object { Write-Host ('Sweep kill orphan node PID=' + $_.ProcessId); Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"
) else (
    echo WARN: powershell.exe not found - skipping orphan sweep
)

REM =====================================================================
REM Clean up the boot lock in case a launcher died mid-boot.
REM =====================================================================
if exist "%LOCKDIR%" rmdir "%LOCKDIR%" >nul 2>&1

if not defined KILLED (
    if not defined FOUND (
        echo No running server found on candidate ports.
    )
)

echo Done.
endlocal
exit /b 0
