#!/bin/bash

# Optional: source the port checking script if available
if [ -f "./docker/check_server.sh" ]; then
  source ./docker/check_server.sh
else
  echo "Warning: check_server.sh not found. Skipping port kill step."
fi

# Check if gnome-terminal is installed (Linux)
if command -v gnome-terminalx &> /dev/null; then
  echo "gnome-terminal detected. Starting servers in new terminal windows..."

  gnome-terminal -- bash -c "npm start --prefix backend; exec bash"
  gnome-terminal -- bash -c "npm run dev --prefix frontend; exec bash"

else
  echo "gnome-terminal not found. You can run servers manually or use the same terminal fallback."

  # Run in same terminal instead of manual
  npm start --prefix backend &
  npm run dev --prefix frontend &
  wait
fi
