@echo off
title Iniciar Embriagados
cd /d "%~dp0"
start "Embriagados - Backend" cmd /k "cd /d C:\Users\ACER NITRO 5\Desktop\appppppsss\archivembriagados\universidad-embriagados\backend && npm start"
start "Embriagados - Frontend" cmd /k "cd /d C:\Users\ACER NITRO 5\Desktop\appppppsss\archivembriagados\universidad-embriagados\frontend && npm run dev"
echo.
echo ==================================================
echo  Sistema Embriagados iniciado
echo  Abre el navegador en:  http://localhost:5173
echo ==================================================
echo.
pause