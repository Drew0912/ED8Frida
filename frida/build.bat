@echo off
cd/d "%~dp0"

call D:\Dev\nodejs\nodevars.bat

:loop
npm run build%1
goto:loop
