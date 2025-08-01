# PowerShell script for AI Chatbot Socket Docker execution

Write-Host "Starting AI Chatbot Socket with Docker..." -ForegroundColor Green

# Stop and remove any existing containers
Write-Host "Cleaning up existing containers..." -ForegroundColor Yellow
try {
    docker stop ai-chatbot-socket 2>$null
    docker rm ai-chatbot-socket 2>$null
}
catch {
    # Ignore errors if container doesn't exist
}

# Build the image
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker build -t ai-chatbot-socket ..

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker build failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Run the container
Write-Host "Running Docker container..." -ForegroundColor Yellow
Write-Host "Access the application at:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host ""

docker run --name ai-chatbot-socket -p 3000:3000 -p 5000:5000 ai-chatbot-socket

# If we get here, container has stopped
Write-Host "Container has stopped" -ForegroundColor Yellow
Read-Host "Press Enter to exit"
