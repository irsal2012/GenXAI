#!/bin/bash

# restart_backend.sh - Script to restart the GenXAI Studio backend

echo "🔄 Restarting GenXAI Studio Backend..."

# Find and kill any existing backend processes
echo "🛑 Stopping existing backend processes..."
pkill -f "uvicorn.*main:app" || echo "No existing backend process found"
pkill -f "python.*backend/main.py" || true

# Wait a moment for processes to fully terminate
sleep 2

# Navigate to the project root directory (parent of studio/)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "📁 Project root: $PROJECT_ROOT"

# Check if virtual environment exists in project root
if [ -d "venv" ]; then
    echo "🐍 Activating virtual environment..."
    source venv/bin/activate
elif [ -d ".venv" ]; then
    echo "🐍 Activating virtual environment..."
    source .venv/bin/activate
else
    echo "⚠️  No virtual environment found. Using system Python."
fi

# Check if required dependencies are installed
echo "🔍 Checking dependencies..."
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "❌ Error: fastapi is not installed."
    echo "Please install dependencies: pip install fastapi uvicorn"
    exit 1
fi

if ! python3 -c "import uvicorn" 2>/dev/null; then
    echo "❌ Error: uvicorn is not installed."
    echo "Please install dependencies: pip install fastapi uvicorn"
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_ROOT/studio/logs"

# Start the backend server
echo "🚀 Starting backend server..."
cd "$PROJECT_ROOT/studio/backend"

# Run uvicorn directly with output redirected to log file
nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload > "$PROJECT_ROOT/studio/logs/backend.log" 2>&1 &

# Store the PID
BACKEND_PID=$!
echo $BACKEND_PID > "$PROJECT_ROOT/studio/logs/backend.pid"

# Wait a moment for the server to start
sleep 3

# Check if the server is actually running
if ps -p $BACKEND_PID > /dev/null 2>&1; then
    echo "✅ Backend started successfully with PID: $BACKEND_PID"
    echo "📡 Backend should be available at http://localhost:8000"
    echo "📚 API docs available at http://localhost:8000/docs"
    echo "📝 Logs available at: $PROJECT_ROOT/studio/logs/backend.log"
    echo ""
    echo "To stop the backend, run: kill $BACKEND_PID"
    echo "Or use: pkill -f 'uvicorn.*main:app'"
else
    echo "❌ Error: Backend failed to start. Check logs at: $PROJECT_ROOT/studio/logs/backend.log"
    exit 1
fi
