#!/bin/bash
# SHERLOCK v17.8 Development Server Startup Script
# This script configures and starts the dual-panel CRM system

echo "🚀 Starting SHERLOCK v17.8 CRM System..."
echo "📊 Admin Panel + CRM Panel Architecture"

# Kill any existing processes
pkill -f "tsx server/index.ts" 2>/dev/null || true
pkill -f "node.*server/index.ts" 2>/dev/null || true

# Check dependencies
echo "🔍 Checking environment..."
node --version
npm --version

# Check database connection
echo "🗄️  Verifying database connection..."
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not found in environment"
    exit 1
fi

# Start the development server
echo "⚡ Starting development server on port 5000..."
echo "📱 Admin Panel: http://localhost:5000/"
echo "🤖 CRM Panel: http://localhost:5000/crm"
echo "💊 Health Check: http://localhost:5000/health"

NODE_ENV=development ./node_modules/.bin/tsx server/index.ts