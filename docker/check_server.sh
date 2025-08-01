#!/bin/bash

# Function to check port and kill process (Linux/macOS only)
kill_port_process() {
  PORT=$1
  PIDS=$(sudo lsof -t -i :$PORT)
  if [ -z "$PIDS" ]; then
    echo "Port $PORT is free."
  else
    echo "Port $PORT is occupied by process(es): $PIDS"
    echo "Killing process(es) on port $PORT..."
    sudo kill -9 $PIDS
    echo "Process(es) on port $PORT killed."
  fi
}

# Detect OS type
OS_TYPE=$(uname | tr '[:upper:]' '[:lower:]')

if [[ "$OS_TYPE" == "linux" || "$OS_TYPE" == "darwin" ]]; then
  echo "Detected OS: $OS_TYPE (Linux/macOS)"
  kill_port_process 5000
  kill_port_process 3000
elif [[ "$OS_TYPE" == *"mingw"* || "$OS_TYPE" == *"cygwin"* || "$OS_TYPE" == *"msys"* ]]; then
  echo "Detected Windows OS. Skipping port killing step."
else
  echo "Unknown OS: $OS_TYPE. Skipping port killing step."
fi