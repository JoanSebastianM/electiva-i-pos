@echo off
setlocal
title POS Granizados - Entrega actual
set "ROOT=%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js no encontrado. Instala Node.js 20+ y vuelve a intentar.
  pause
  exit /b 1
)

if not exist "%ROOT%backend\node_modules" (
  echo Instalando dependencias del backend...
  call npm --prefix "%ROOT%backend" install
  if errorlevel 1 goto :error
)

if not exist "%ROOT%frontend-react\node_modules" (
  echo Instalando dependencias de React...
  call npm --prefix "%ROOT%frontend-react" install
  if errorlevel 1 goto :error
)

echo Iniciando backend, React y Vanilla...
start "POS Granizados - Backend" /D "%ROOT%" cmd /k npm run dev:backend
start "POS Granizados - React" /D "%ROOT%" cmd /k npm run dev:react
start "POS Granizados - Vanilla" /D "%ROOT%" cmd /k npm run dev:vanilla

echo Esperando servidores...
timeout /t 8 /nobreak >nul
start "" "http://localhost:5173"
start "" "http://localhost:5500"

echo.
echo App actual abierta:
echo React:   http://localhost:5173
echo Vanilla: http://localhost:5500
echo Backend: http://localhost:3001
echo Login:   admin / admin123
echo.
echo Cierra las tres ventanas negras para detener la app.
endlocal
exit /b 0

:error
echo Fallo instalando dependencias. Revisa la ventana de npm.
pause
exit /b 1
