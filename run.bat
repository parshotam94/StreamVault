@echo off
echo ====================================================
echo  Starting StreamVault - YouTube Downloader Server
echo ====================================================
echo.
cd /d "%~dp0"
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
pause
