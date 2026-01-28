#!/bin/bash

# restart_frontend.sh - Script to restart the GenXAI Studio frontend

echo "🔄 Restarting GenXAI Studio Frontend..."

# Find and kill any existing frontend processes
echo "🛑 Stopping existing frontend processes..."
pkill -f "vite" || echo "No existing frontend process found"
pkill -f "node.*vite" || true

# Wait a moment for processes to fully terminate
sleep 2

# Navigate to the project root directory
cd "$(dirname "$0")"

# Navigate to frontend directory
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the frontend development server
echo "🚀 Starting frontend development server..."
npm run dev &

# Store the PID
FRONTEND_PID=$!
echo "✅ Frontend started with PID: $FRONTEND_PID"
echo "🌐 Frontend should be available at http://localhost:3000"
echo ""
echo "To stop the frontend, run: kill $FRONTEND_PID"

# Wait a moment for the server to start
sleep 3

# Open the site in the default browser
echo "🌐 Opening site in browser..."
open http://localhost:3000
