@echo off
chcp 65001 >nul
title Pixel Adventure Web - Port 2222

:: Chuyển về thư mục chứa file .bat
cd /d "%~dp0"

set PORT=2222

echo ========================================================
echo   🎮 KHỞI ĐỘNG PIXEL ADVENTURE WEB (CỔNG %PORT%)
echo ========================================================
echo.

:: Tìm Python (ưu tiên venv -> python -> py)
if exist ".venv\Scripts\python.exe" (
    set "PY=.venv\Scripts\python.exe"
    echo [*] Sử dụng môi trường ảo: .venv
) else if exist "venv\Scripts\python.exe" (
    set "PY=venv\Scripts\python.exe"
    echo [*] Sử dụng môi trường ảo: venv
) else (
    where python >nul 2>&1
    if not errorlevel 1 (
        set "PY=python"
    ) else (
        where py >nul 2>&1
        if not errorlevel 1 (
            set "PY=py"
        ) else (
            echo [LỖI] Không tìm thấy Python trên máy tính!
            echo Vui lòng cài đặt Python (https://www.python.org/) và nhớ tick chọn "Add Python to PATH".
            echo.
            pause
            exit /b 1
        )
    )
)

:: Kiểm tra phiên bản Python
%PY% --version >nul 2>&1
if errorlevel 1 (
    echo [LỖI] Lệnh Python (%PY%) không thực thi được.
    pause
    exit /b 1
)

:: Kiểm tra và cài đặt thư viện cần thiết
echo [1/3] Kiểm tra thư viện (FastAPI, Uvicorn, Pydantic)...
%PY% -c "import fastapi, uvicorn, pydantic" >nul 2>&1
if errorlevel 1 (
    echo [*] Đang tự động cài đặt các thư viện còn thiếu từ backend/requirements.txt...
    %PY% -m pip install -r backend\requirements.txt
    if errorlevel 1 (
        echo.
        echo [LỖI] Không thể cài đặt thư viện qua pip! Vui lòng kiểm tra kết nối mạng.
        pause
        exit /b 1
    )
)

:: Tự động mở trình duyệt sau 2 giây
echo [2/3] Tự động mở trình duyệt: http://127.0.0.1:%PORT% ...
start "" cmd /c "ping 127.0.0.1 -n 3 >nul & start http://127.0.0.1:%PORT%"

:: Khởi chạy Server
echo [3/3] Đang khởi chạy Game Server tại cổng %PORT%...
echo --------------------------------------------------------
echo Web Server đang chạy tại: http://127.0.0.1:%PORT%
echo Nhấn Ctrl + C để dừng server.
echo --------------------------------------------------------
echo.

%PY% backend\run.py

echo.
echo ========================================================
echo Server đã dừng.
echo ========================================================
pause
