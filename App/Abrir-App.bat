@echo off
setlocal
title Embriagados - Iniciar App
set "ROOT=%~dp0"

echo ==================================================
echo   EMBRIAGADOS CRUD - Iniciando aplicacion
echo ==================================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.

start "Embriagados - Backend" /D "%ROOT%backend" cmd /k npm start
start "Embriagados - Frontend" /D "%ROOT%frontend" cmd /k npm run dev

echo Esperando a que los servidores inicien...
timeout /t 6 /nobreak >nul
start "" "http://localhost:5173"

echo.
echo Si el navegador no se abrio, entra manualmente a:
echo http://localhost:5173
echo.
echo Para cerrar la app, cierra las dos ventanas negras.
echo.
endlocal
