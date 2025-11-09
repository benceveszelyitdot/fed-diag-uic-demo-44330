#!/bin/bash

# Monitoring Dashboard Startup Script for Raspberry Pi

echo "==================================="
echo "Starting Monitoring Dashboard"
echo "==================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js first:"
    echo "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "sudo apt-get install -y nodejs"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Get the local IP address
IP_ADDRESS=$(hostname -I | awk '{print $1}')

echo ""
echo "Starting development server..."
echo "Access the dashboard at:"
echo "  Local:   http://localhost:8080"
echo "  Network: http://$IP_ADDRESS:8080"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm run dev
