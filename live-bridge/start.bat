@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Node.js kurulu degil. https://nodejs.org adresinden LTS surumunu yukleyin.
 pause
 exit /b 1
)
if not exist node_modules (
 echo Kutuphaneler kuruluyor...
 call npm install
 if errorlevel 1 (pause & exit /b 1)
)
node server.js
pause
