@echo off

:: 设置颜色
echo. & color 0A

:: 输出标题
echo =================================================
echo            Rent Reminder System - Startup Script
echo =================================================

:: 检查Node.js是否安装
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js not found. Please install Node.js first!
    pause
    exit /b 1
)

echo Node.js environment detected, starting services...
echo.

:: 获取脚本目录的绝对路径
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
set "BACKEND_DIR=%PROJECT_ROOT%\backend"
set "FRONTEND_DIR=%PROJECT_ROOT%\frontend"

:: 检查目录是否存在
if not exist "%BACKEND_DIR%" (
    echo Error: Backend directory not found at %BACKEND_DIR%
    pause
    exit /b 1
)

if not exist "%FRONTEND_DIR%" (
    echo Error: Frontend directory not found at %FRONTEND_DIR%
    pause
    exit /b 1
)

:: 启动后端服务
echo Starting backend service...
start "Backend Service" cmd /c "cd %BACKEND_DIR% && npm install --no-audit --no-fund && node index.js && pause"

:: 等待几秒钟让后端启动
ping -n 3 127.0.0.1 >nul

:: 启动前端服务
echo.
echo Starting frontend service...
start "Frontend Service" cmd /c "cd %FRONTEND_DIR% && npm install --no-audit --no-fund && npm run dev && pause"

:end
echo.
echo =================================================
echo Services started successfully!
echo Please check the popped-up terminal windows to confirm services are running normally
echo Frontend service is usually at http://localhost:5173
echo Backend service is usually at http://localhost:3000
echo =================================================
echo.
echo Press any key to close this window...
pause >nul