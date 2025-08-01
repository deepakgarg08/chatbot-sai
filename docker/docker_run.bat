@echo off
REM Simple Docker run script for AI Chatbot Socket (Windows)

echo Starting AI Chatbot Socket with Docker...

REM Stop and remove any existing containers
docker stop ai-chatbot-socket >nul 2>&1
docker rm ai-chatbot-socket >nul 2>&1

REM Build the image
echo Building Docker image...
docker build -t ai-chatbot-socket ..

REM Check if build was successful
if %ERRORLEVEL% neq 0 (
    echo Error: Docker build failed
    pause
    exit /b 1
)

REM Run the container
echo Running Docker container...
docker run --name ai-chatbot-socket -p 3000:3000 -p 5000:5000 ai-chatbot-socket

REM If we get here, container has stopped
echo Container has stopped
pause
