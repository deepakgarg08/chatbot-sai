#!/bin/bash

# Test runner script for AI Chatbot Socket Frontend

echo "🧪 Running Redux Store Tests for AI Chatbot Socket Frontend"
echo "============================================================"

# Change to frontend directory
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🚀 Running all tests..."
echo ""

# Run tests with different options based on argument
case "$1" in
    "watch")
        echo "👀 Running tests in watch mode..."
        npm run test:watch
        ;;
    "ui")
        echo "🖥️  Running tests with UI..."
        npm run test:ui
        ;;
    "coverage")
        echo "📊 Running tests with coverage..."
        npm run test:coverage
        ;;
    "silent")
        echo "🤫 Running tests silently..."
        npm run test:run > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo "✅ All tests passed!"
        else
            echo "❌ Some tests failed!"
            exit 1
        fi
        ;;
    *)
        echo "🏃 Running tests once..."
        npm run test:run
        ;;
esac

echo ""
echo "✨ Test execution completed!"
