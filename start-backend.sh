#!/bin/bash

# Backend UART Server Startup Script for Raspberry Pi

echo "==================================="
echo "Starting UART Backend Server"
echo "==================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

# Check if UART device exists
if [ ! -e /dev/ttyS0 ]; then
    echo "Warning: /dev/ttyS0 not found"
    echo "Make sure UART is enabled in raspi-config"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Compile TypeScript backend
echo "Compiling backend..."
npx tsc backend/uart-server.ts --outDir backend/dist --module es2020 --target es2020 --moduleResolution node --esModuleInterop

echo ""
echo "Backend server starting on port 3001..."
echo "Press Ctrl+C to stop the server"
echo ""

# Start the backend server
node backend/dist/uart-server.js
