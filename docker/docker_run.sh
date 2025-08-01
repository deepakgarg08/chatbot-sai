#!/bin/bash

# Simple Docker run script for AI Chatbot Socket

# Stop and remove any existing containers
sudo docker stop ai-chatbot-socket 2>/dev/null || true
sudo docker rm ai-chatbot-socket 2>/dev/null || true

# Build the image
sudo docker build -t ai-chatbot-socket ..

# Run the container
sudo docker run --name ai-chatbot-socket -p 3000:3000 -p 5000:5000 ai-chatbot-socket
