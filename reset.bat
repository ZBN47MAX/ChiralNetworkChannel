@echo off
REM Chiral Network Channel - factory reset
REM Wipes all state JSON (users / sessions / progress / categories / ...) and
REM removes log files. Leaves ./media and ./audio and all .collection.json
REM files on disk untouched so the actual media library is preserved.
setlocal EnableDelayedExpansion

cd /d "%~dp0"

echo ============================================================
echo  Chiral Network Channel - FACTORY RESET
echo ============================================================
echo.
echo This will delete all accounts, sessions, watch progress,
echo comments, favorites, custom category labels, and logs.
echo.
echo Your media files under .\media and .\audio will NOT be touched.
echo Existing .collection.json files inside each folder will NOT
echo be touched either (the collection metadata stays).
echo.

set /p CONFIRM=Type YES to confirm:
if /i not "%CONFIRM%"=="YES" (
    echo Aborted.
    endlocal
    exit /b 1
)

REM ----- 1. Stop the server first (so it doesn't rewrite the files) -----
echo.
echo Stopping server if running...
call "%~dp0shutDown.bat"

REM ----- 2. Delete state files in ./data -----
echo.
echo Wiping data\ ...
if exist "data\users.json"            del /f /q "data\users.json"            >nul 2>&1
if exist "data\sessions.json"         del /f /q "data\sessions.json"         >nul 2>&1
if exist "data\progress.json"         del /f /q "data\progress.json"         >nul 2>&1
if exist "data\audio-progress.json"   del /f /q "data\audio-progress.json"   >nul 2>&1
if exist "data\comments.json"         del /f /q "data\comments.json"         >nul 2>&1
if exist "data\audio-comments.json"   del /f /q "data\audio-comments.json"   >nul 2>&1
if exist "data\favorites.json"        del /f /q "data\favorites.json"        >nul 2>&1
if exist "data\audio-favorites.json"  del /f /q "data\audio-favorites.json"  >nul 2>&1
if exist "data\categories.json"       del /f /q "data\categories.json"       >nul 2>&1

REM Also sweep any *.tmp leftover from atomic writes.
del /f /q "data\*.tmp" >nul 2>&1

REM ----- 3. Delete runtime logs and all launcher dotfiles -----
if exist "server.log"        del /f /q "server.log"   >nul 2>&1
if exist "server.err"        del /f /q "server.err"   >nul 2>&1
if exist ".server.pid"       del /f /q ".server.pid"  >nul 2>&1
if exist ".server.port"      del /f /q ".server.port" >nul 2>&1
if exist ".server.boot-lock" rmdir    ".server.boot-lock" >nul 2>&1

REM ----- 4. Report -----
echo.
echo Reset complete. On next startup:
echo   - data\ files will be recreated with empty state
echo   - First user to register becomes admin
echo   - Default categories will be reseeded from config.js
echo.
echo You can now run ChiralNetworkChannel.bat.
echo.
pause

endlocal
exit /b 0
