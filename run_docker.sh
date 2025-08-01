#!/bin/bash

# Universal Docker runner for AI Chatbot Socket
# Auto-detects platform and runs appropriate Docker script

echo "🚀 AI Chatbot Socket - Docker Runner"
echo

# Check if we're in the right directory
if [ ! -d "docker" ]; then
    echo "❌ Error: docker/ directory not found"
    echo "   Please run this script from the project root directory"
    exit 1
fi

# Detect platform and run appropriate script
case "$(uname -s)" in
    Linux*|Darwin*)
        echo "🐧 Detected Unix-like system, using bash script..."
        cd docker && ./docker_run.sh
        ;;
    CYGWIN*|MINGW*|MSYS*)
        echo "🪟 Detected Windows environment, use:"
        echo "   docker\\docker_run.bat (Command Prompt)"
        echo "   docker\\docker_run.ps1 (PowerShell)"
        ;;
    *)
        echo "❓ Unknown platform, trying bash script..."
        cd docker && ./docker_run.sh
        ;;
esac
