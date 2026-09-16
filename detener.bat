@echo off
title Detener Embriagados
taskkill /f /im node.exe >nul 2>&1
echo.
echo ==================================================
echo  Programa detenido
echo ==================================================
echo.
pause