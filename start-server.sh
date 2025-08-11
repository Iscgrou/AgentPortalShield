#!/bin/bash

# SHERLOCK v17.8 Server Startup Script
# Fix deployment and command configuration issues

echo "🚀 Starting SHERLOCK v17.8 CRM System..."

# Set environment variables
export NODE_ENV=development
export PORT=5000

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Clear any existing processes on port 5000
echo "🧹 Clearing existing processes..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || true
pkill -f "tsx server" 2>/dev/null || true

# Start the server
echo "▶️  Starting development server on port $PORT..."
echo "📝 Environment: $NODE_ENV"
echo "🌐 Server will be available at: http://0.0.0.0:$PORT"
echo "🏥 Health check: http://0.0.0.0:$PORT/health"
echo "👤 Admin Panel: http://0.0.0.0:$PORT/"
echo "📊 CRM Panel: http://0.0.0.0:$PORT/crm"

# Execute the server with proper binding
exec npx tsx server/index.ts