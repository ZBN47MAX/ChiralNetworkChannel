@echo off
REM Chiral Network Channel - unified launcher
REM
REM This is the ONLY entry point for starting the server. It replaces the
REM old ChiralNetworkChannel.bat + bootUp.bat two-file dance, which was
REM race-prone: two nearly-simultaneous clicks could each see "no live
REM server" and each launch a separate node, producing orphan processes
REM and corrupted JSON state. Consolidating to one script plus an atomic
REM mkdir-based boot mutex eliminates that window.
REM
REM Happy path (server already running):
REM   probe .server.port -> curl /api/health -> open browser -> exit
REM
REM Cold start:
REM   acquire .server.boot-lock (mkdir, atomic) -> launch node hidden via
REM   lib\launch-hidden.vbs -> poll /api/health up to BOOT_TIMEOUT seconds
REM   -> open browser on success
REM
REM Second click during cold start:
REM   mkdir fails -> we assume a sibling launcher is booting node -> skip
REM   launch and just join the health-wait loop. No duplicate processes.
REM
REM Debug: every step is timestamped. On failure, server.log / server.err
REM tails are dumped inline so you don't need to open files to diagnose.

setlocal EnableDelayedExpansion

cd /d "%~dp0"

REM Candidate port list - MUST stay in sync with config.PORT_FALLBACKS
REM (and with shutDown.bat). Do NOT add 0 here.
set "PORT_LIST=8080 8081 8088 8888 8090 9090 9091 9191 18080 28080 38080 48080 58080 8000 8001 3000 5000 7000"

set "PIDFILE=.server.pid"
set "PORTFILE=.server.port"
set "LOCKDIR=.server.boot-lock"
set "LOGFILE=server.log"
set "ERRFILE=server.err"
set "CURL=%SystemRoot%\System32\curl.exe"

REM 15s is enough: cold listen is ~31ms on bare metal and <3s even with a
REM first-run Windows Defender scan of node_modules. The old 45s just
REM widened the window for races. If this starts timing out legitimately,
REM investigate server.err - don't raise this number as a fix.
set "BOOT_TIMEOUT=15"

REM NOTE on parens inside this block: any literal ')' inside a
REM parenthesized if-block will silently close the block early, making
REM the rest of the body execute unconditionally. That is a classic
REM batch gotcha and exactly the kind of "fatal silent bug" we need to
REM avoid. Keep all messages inside if-blocks paren-free.
if not exist "%CURL%" (
    echo FATAL: curl.exe not found at %CURL% - need Windows 10 1803+
    pause
    exit /b 1
)

REM Prefer the bundled node.exe (installed by the .iss installer into
REM .\runtime\node.exe). Fall back to the system PATH node if missing.
if exist "%~dp0runtime\node.exe" (
    set "NODE=%~dp0runtime\node.exe"
) else (
    set "NODE=node"
    where node >nul 2>&1
    if errorlevel 1 (
        echo FATAL: 'node' is not on PATH and no runtime\node.exe bundled.
        echo Install Node.js or reinstall via the .iss installer.
        pause
        exit /b 1
    )
)

call :log "launcher starting in %cd%"

REM =====================================================================
REM Phase 1 - Kill any existing server so we always start fresh code.
REM
REM This guarantees that double-clicking the bat after editing server.js
REM picks up new routes instead of reusing the stale process.
REM =====================================================================
call :log "killing any existing server instances"
call :kill_old
del "%PIDFILE%" >nul 2>&1
del "%PORTFILE%" >nul 2>&1
set "ACTIVE_PORT="

REM =====================================================================
REM Phase 3 - Try to acquire the boot mutex. mkdir is atomic on NTFS, so
REM only one launcher can succeed. If another launcher already holds the
REM lock, we join its health-wait loop instead of starting a second node.
REM =====================================================================
call :log "no live server - attempting boot mutex"

REM If PID file points at a live node.exe, assume it's booting and just
REM join its health-wait. This handles the window between "node launched"
REM and "node listening" without us needing to kill anyone.
if exist "%PIDFILE%" (
    set /p OLD_PID=<"%PIDFILE%"
    if defined OLD_PID (
        tasklist /fi "pid eq !OLD_PID!" 2>nul | findstr /i "node.exe" >nul
        if not errorlevel 1 (
            call :log "  node PID=!OLD_PID! is alive - joining its health-wait"
            set "PID=!OLD_PID!"
            set "PID_LOGGED=1"
            goto health_wait
        )
        call :log "  PID=!OLD_PID! dead - removing stale %PIDFILE%"
        del "%PIDFILE%" >nul 2>&1
    )
)

mkdir "%LOCKDIR%" 2>nul
if errorlevel 1 (
    REM Another launcher holds the lock - don't start a second node.
    REM Just poll for health. If the other launcher's node is good, we'll
    REM open the browser once it becomes healthy; if it never does, we'll
    REM time out cleanly without killing anything.
    call :log "  boot lock held by sibling launcher - joining health-wait only"
    goto health_wait
)
call :log "  acquired boot mutex (%LOCKDIR%)"

REM Truncate old log/err so the tail dump on failure only shows THIS boot.
if exist "%LOGFILE%" del "%LOGFILE%" >nul 2>&1
if exist "%ERRFILE%" del "%ERRFILE%" >nul 2>&1
if exist "%PORTFILE%" del "%PORTFILE%" >nul 2>&1

REM =====================================================================
REM Phase 4 - Launch node hidden and detached via the VBS shim.
REM =====================================================================
call :log "launching node hidden"
call :log "  NODE = %NODE%"
call :log "  LOG  = %LOGFILE%"
call :log "  ERR  = %ERRFILE%"

if not exist "%~dp0lib\launch-hidden.vbs" (
    call :log "FATAL: lib\launch-hidden.vbs missing - cannot start hidden"
    rmdir "%LOCKDIR%" >nul 2>&1
    pause
    exit /b 1
)
wscript.exe "%~dp0lib\launch-hidden.vbs" "%NODE%" "server.js" "%LOGFILE%" "%ERRFILE%"
if errorlevel 1 (
    call :log "FATAL: wscript failed - is WSH disabled by policy?"
    call :log "       HKLM\Software\Microsoft\Windows Script Host\Settings\Enabled"
    rmdir "%LOCKDIR%" >nul 2>&1
    pause
    exit /b 1
)
call :log "  wscript returned - node is starting in background"

REM =====================================================================
REM Phase 5 - Poll /api/health up to BOOT_TIMEOUT seconds.
REM =====================================================================
:health_wait
call :log "waiting up to %BOOT_TIMEOUT%s for /api/health"
set "PID="
if not defined PID_LOGGED set "PID_LOGGED="
set /a waited=0
:health_loop
if exist "%PORTFILE%" (
    set /p ACTIVE_PORT=<"%PORTFILE%"
    if defined ACTIVE_PORT (
        call :probe !ACTIVE_PORT!
        if not errorlevel 1 goto ready
    )
)

REM Once node writes .server.pid, use it for early crash detection.
if exist "%PIDFILE%" (
    set /p PID=<"%PIDFILE%"
    if defined PID (
        if not defined PID_LOGGED (
            call :log "  .server.pid appeared - node PID=!PID!"
            set "PID_LOGGED=1"
        )
        tasklist /fi "pid eq !PID!" 2>nul | findstr /i "node.exe" >nul
        if errorlevel 1 (
            call :log "  node PID=!PID! exited before becoming healthy"
            del "%PIDFILE%" >nul 2>&1
            goto fail_dump
        )
    )
)

REM Heartbeat every 3 seconds so the user sees we're alive.
set /a mod=waited %% 3
if !mod! equ 0 (
    if !waited! gtr 0 (
        if exist "%PORTFILE%" (
            call :log "  +!waited!s - portfile present, health not yet OK"
        ) else (
            if exist "%PIDFILE%" (
                call :log "  +!waited!s - node alive, portfile not yet written"
            ) else (
                call :log "  +!waited!s - waiting for node to write %PIDFILE%"
            )
        )
    )
)

REM Sleep ~1 second. We deliberately avoid `timeout /t 1 /nobreak` here
REM because timeout.exe bails out instantly when stdin is not an
REM interactive console (e.g. started from a redirected subshell, a
REM scheduled task, or certain installers), which would spin this loop
REM to 0-duration iterations and fire a false TIMEOUT. `ping -n 2` to
REM loopback is the classic, stdin-agnostic 1-second sleep.
ping -n 2 127.0.0.1 >nul 2>&1
set /a waited+=1
if !waited! lss %BOOT_TIMEOUT% goto health_loop

call :log "TIMEOUT: server did not respond within %BOOT_TIMEOUT%s"
if defined PID call :log "  node PID=!PID! may still be running - left for inspection"
goto fail_dump

:fail_dump
REM Release the boot lock no matter what. server.js's exit handler would
REM also clean it up, but we own it from the bat side so we release it too.
rmdir "%LOCKDIR%" >nul 2>&1
echo.
echo ================ %LOGFILE% ================
if exist "%LOGFILE%" (
    type "%LOGFILE%" 2>nul
) else (
    echo [no %LOGFILE% produced - node likely never wrote stdout]
)
echo ================ %ERRFILE% ================
if exist "%ERRFILE%" (
    type "%ERRFILE%" 2>nul
) else (
    echo [no %ERRFILE% produced]
)
echo ===========================================
echo.
call :log "startup failed - see output above"
pause
exit /b 1

:ready
call :log "server ready on port !ACTIVE_PORT! after !waited!s"
REM Release boot lock (server.js also rmdir's it on 'listening', but
REM double-rmdir is harmless and ensures cleanup even if server.js is
REM an older build).
rmdir "%LOCKDIR%" >nul 2>&1
goto open

:open
set "LOCAL_URL=http://localhost:!ACTIVE_PORT!/"
set "DS124_PORT=!ACTIVE_PORT!"
call :log "service ready on port %DS124_PORT%"

REM ---- Banner + LAN URL list ---------------------------------------
REM
REM We show URLs first so the user has the IP they need before any
REM prompt fires; both subsequent prompts (firewall, browser) are
REM strictly opt-in. Nothing is touched without an explicit keystroke.
REM
REM IP-list filtering rationale: Get-NetIPAddress returns ALL IPv4
REM interfaces, including VPN tunnels (WireGuard / OpenVPN / TAP),
REM virtualization (Hyper-V / WSL / vEthernet), and Bluetooth PAN.
REM A user with a VPN client active would otherwise see their tunnel
REM address (e.g. 10.7.0.2) and try pasting it into the phone, which
REM can't reach the tunnel. We exclude common virtual / VPN
REM InterfaceAlias patterns so only physical Ethernet and Wi-Fi
REM adapters surface, tagging each line with its alias for
REM disambiguation when multiple physical NICs are up.
echo.
echo ============================================================
echo   Chiral Network Channel - service started on port %DS124_PORT%
echo ============================================================
echo.
echo   Local access:
echo     %LOCAL_URL%
echo.
echo   LAN access (phones / tablets on the same Wi-Fi):
REM Filter strategy: name-based blacklist (VPN|Tunnel|WireGuard|...)
REM is unreliable -- field test showed a WireGuard tunnel registered
REM as "以太网 2" with no telltale name and slipped through. Use
REM Get-NetAdapter -Physical instead; that cmdlet excludes virtual
REM adapters (WireGuard/wintun, OpenVPN/TAP, Hyper-V vSwitch, WSL
REM vEthernet, Bluetooth PAN, etc.) and only returns visible
REM physical NICs (real Ethernet + Wi-Fi). Status=Up filters out
REM disabled adapters (cable unplugged etc.).
powershell -NoProfile -Command "Get-NetAdapter -Physical -ErrorAction SilentlyContinue | Where-Object Status -eq 'Up' | ForEach-Object { Get-NetIPAddress -InterfaceAlias $_.Name -AddressFamily IPv4 -ErrorAction SilentlyContinue } | Where-Object { $_.IPAddress -ne '127.0.0.1' -and $_.IPAddress -notlike '169.254.*' } | Sort-Object IPAddress | ForEach-Object { Write-Host ('    http://' + $_.IPAddress + ':' + $env:DS124_PORT + '/    [' + $_.InterfaceAlias + ']') }"
echo.
echo   Service runs in the background; closing this window does NOT
echo   stop it. To stop the service, run shutDown.bat.
echo.
echo ============================================================
echo   Windows-as-server is an EXPERIMENTAL deployment path.
echo   Before pressing [A], please read README section B and B.7:
echo     %~dp0README\README.zh.md  (Chinese)
echo     %~dp0README\README.en.md  (English)
echo   Disclaimer + risks + troubleshooting all covered there.
echo ============================================================
echo.
echo ============================================================
echo   Security notice -- read before choosing [A]
echo ============================================================
echo.
echo   Choosing [A] grants admin rights once via UAC and then:
echo     1. Disables any inbound Block rules attached to a node.exe
echo        on this PC (legacy "Node.js JavaScript Runtime" rules
echo        from past Windows-Firewall popups override our Allow
echo        rule and silently drop phone packets). Reversible -- [R]
echo        re-enables exactly the rules [A] disabled.
echo     2. Adds an inbound TCP %DS124_PORT% Allow rule on profile
echo        Any (Private + Public + Domain).
echo.
echo   Implications:
echo     - Anyone reachable on your network at TCP %DS124_PORT% can
echo       attempt to connect. Login is required to see content;
echo       passwords are stored in plaintext (single-user / family
echo       use, by design).
echo     - Profile=Any means the rule is also active on PUBLIC
echo       networks (cafe / airport / hotel Wi-Fi). Press [R] before
echo       joining an untrusted network.
echo     - Step 1 affects ALL node.exe programs on this PC, not just
echo       this app. Any other Node project that explicitly denied
echo       Public access loses that block until you run [R].
echo     - Third-party security software (Huorong, 360, Norton...)
echo       may add another layer; if a phone still cannot connect
echo       after [A], allow inbound for node.exe in that product too.
echo.
echo ============================================================
echo.

REM ---- Firewall prompt (security-sensitive, must opt in) -----------
REM
REM Three-way choice instead of Y/N because [R] needs to be a
REM first-class action -- the rule may need to come down before
REM joining an untrusted Wi-Fi. [N] is the safe default -- leaves
REM Windows Firewall untouched.
REM
REM Input mechanism: `set /p` + `if /i ==` not `choice` -- on at
REM least one user box `choice` returned errorlevel 255 (no-console
REM / stdin redirected) and the if-chain fell through to the final
REM exit path, closing the launcher window. `set /p` fails LOUDLY
REM (empty input loop visible to user) instead of silently.
:firewall_prompt
echo   Firewall (type N if unsure):
echo     A = Allow phones on this LAN (one-stop: cleanup + Allow rule, asks UAC)
echo     R = Restore previous state (re-enable Block rules, drop Allow, asks UAC)
echo     N = No change
echo.
set "FW_ANS="
set /p "FW_ANS=Type A, R, or N then press Enter: "
if /i "%FW_ANS%"=="A" goto firewall_allow
if /i "%FW_ANS%"=="R" goto firewall_remove
if /i "%FW_ANS%"=="N" goto firewall_skip
echo.
echo Unrecognised input "%FW_ANS%". Type A, R, or N.
echo.
goto firewall_prompt

:firewall_allow
echo.
echo Configuring firewall for "Chiral Network Channel %DS124_PORT%" ...
echo (Approve the UAC prompt that pops up on the desktop.)
REM Single-layer call. firewall-rule.ps1 self-elevates internally
REM and writes to lib\firewall-rule.log; we type the log so the
REM user can read what the elevated window did (it flashes too
REM fast to read live). We rely on the elevated VERIFY OK line
REM as the source of truth -- bat-side non-admin verification was
REM removed because Get-NetFirewallRule from a non-admin token
REM sometimes cannot see rules added by an elevated process,
REM producing a misleading MISSING.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0lib\firewall-rule.ps1" -Action Add -Port %DS124_PORT%
echo.
echo ---- firewall-rule.log -------------------------------------
if exist "%~dp0lib\firewall-rule.log" (
    type "%~dp0lib\firewall-rule.log"
) else (
    echo (no log file produced -- elevated child never started?)
    echo See README troubleshooting section for next steps.
)
echo ------------------------------------------------------------
echo.
echo If the log above contains "VERIFY OK" -- you are done. Type the
echo http://...  URL above into your phone's browser. If a phone still
echo cannot connect, see README troubleshooting section.
echo.
echo Press any key to continue to the browser prompt . . .
pause >nul
goto firewall_done

:firewall_remove
echo.
echo Restoring previous firewall state ...
echo (Approve the UAC prompt that pops up on the desktop.)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0lib\firewall-rule.ps1" -Action Remove -Port %DS124_PORT%
echo.
echo ---- firewall-rule.log -------------------------------------
if exist "%~dp0lib\firewall-rule.log" (
    type "%~dp0lib\firewall-rule.log"
) else (
    echo (no log file produced -- elevated child never started?)
)
echo ------------------------------------------------------------
echo.
echo Press any key to continue to the browser prompt . . .
pause >nul
goto firewall_done

:firewall_skip
echo.
echo [Skipped] Windows Firewall is unchanged.
echo.
echo Press any key to continue to the browser prompt . . .
pause >nul
goto firewall_done

:firewall_done
echo.
echo ============================================================
echo.

REM ---- Prompt 2: open browser (no longer automatic) ----------------
REM
REM User asked for this to be opt-in: some workflows want the
REM service running headless (e.g. just to share to phones) without
REM the launcher hijacking focus to open a browser tab.
:browser_prompt
set "BR_ANS="
set /p "BR_ANS=Open the player in your default browser now? Type Y or N then Enter: "
if /i "%BR_ANS%"=="Y" goto browser_open
if /i "%BR_ANS%"=="N" goto browser_skip
echo.
echo Unrecognised input "%BR_ANS%". Type Y or N.
echo.
goto browser_prompt

:browser_open
echo.
call :log "opening %LOCAL_URL%"
start "" "%LOCAL_URL%"
echo [Done] Browser launch requested for %LOCAL_URL%.
goto final

:browser_skip
echo.
echo [Skipped] Browser not opened. Service keeps running headless;
echo           type one of the URLs above into any device on the LAN.
goto final

:final
echo.
echo ============================================================
echo   All done. The service is still running in the background.
echo   Closing THIS window does NOT stop the service.
echo   To stop the service, run shutDown.bat.
echo ============================================================
echo.
echo Press any key to close this window . . .
pause >nul
endlocal
exit /b 0

REM ---------------------------------------------------------------
REM Helpers
REM ---------------------------------------------------------------

:log
REM Timestamped echo. %TIME:~0,8% is "HH:MM:SS" regardless of locale.
echo [%TIME:~0,8%] %~1
exit /b 0

:probe
REM In:  %1 = port number
REM Out: errorlevel 0 if our server responds on that port, else 1
REM
REM --fail makes curl return non-zero on HTTP >=400. -m 1 caps the whole
REM request at 1s so a stuck peer can't hang us. The findstr check looks
REM for "uptime" so we only accept our own /api/health response, not
REM some random service squatting the port.
"%CURL%" -s -m 1 --fail "http://127.0.0.1:%1/api/health" 2>nul | findstr /c:"uptime" >nul
exit /b %errorlevel%

:kill_old
REM Kill any node.exe whose command line references THIS project's server.js.
REM Uses PowerShell for reliable command-line matching (same as shutDown.bat
REM stage 3). The absolute path match prevents killing other node projects.
set "ABS_SERVER=%~dp0server.js"
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ForEach-Object { if ($_.CommandLine -and $_.CommandLine -match [regex]::Escape('%ABS_SERVER%')) { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue } }" >nul 2>&1
REM Also kill by PID file as fallback
if exist "%PIDFILE%" (
    set /p KILL_PID=<"%PIDFILE%"
    if defined KILL_PID (
        tasklist /fi "pid eq !KILL_PID!" 2>nul | findstr /i "node.exe" >nul
        if not errorlevel 1 (
            taskkill /F /PID !KILL_PID! >nul 2>&1
        )
    )
)
REM Brief wait for port release
ping -n 2 127.0.0.1 >nul 2>&1
exit /b 0
