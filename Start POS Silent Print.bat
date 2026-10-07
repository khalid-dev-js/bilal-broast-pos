@echo off
setlocal
set "POS_URL=http://localhost:3000"
set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"

if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" (
  echo Microsoft Edge was not found.
  pause
  exit /b 1
)

powershell -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing -Uri '%POS_URL%' -TimeoutSec 3 | Out-Null; exit 0 } catch { exit 1 }"
if errorlevel 1 (
  echo POS is not running at %POS_URL%.
  echo Start the project with: npm run dev
  pause
  exit /b 1
)

start "Bilal POS" "%EDGE%" --user-data-dir="%LOCALAPPDATA%\BilalBroastPOS\EdgeSilentPrint" --kiosk-printing "%POS_URL%"
endlocal
