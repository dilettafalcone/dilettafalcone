@echo off
cd /d "%~dp0"
echo Invio su GitHub...
git add -A
git commit -m "Aggiorna contenuto"
git push origin main
echo.
echo Pubblicato!
pause
