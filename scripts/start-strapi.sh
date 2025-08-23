#!/bin/bash

# Start Strapi-compatible server with complete data migration
# This script starts the Strapi server with full data from the research JSON

set -e  # Exit on any error

echo "🚀 Starting Strapi-compatible server..."
echo "📍 Server will run on http://localhost:1337/api"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js to continue."
    exit 1
fi

# Check if the server file exists
if [[ ! -f "strapi-server-complete.js" ]]; then
    echo "❌ Server file not found: strapi-server-complete.js"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Check if data file exists
if [[ ! -f "data/superyacht_technology_research.json" ]]; then
    echo "❌ Data file not found: data/superyacht_technology_research.json"
    echo "Please ensure the data file is in the correct location."
    exit 1
fi

# Check if port 1337 is available
if lsof -i :1337 > /dev/null 2>&1; then
    echo "⚠️  Port 1337 is already in use. Stopping existing process..."
    pkill -f "strapi-server-complete.js" || true
    sleep 2
fi

echo "📊 Loading data from: data/superyacht_technology_research.json"
echo "🔄 Starting server with complete Strapi API compatibility..."

# Start the server in background
nohup node strapi-server-complete.js > strapi-server.log 2>&1 &
SERVER_PID=$!

echo "🆔 Server PID: $SERVER_PID"

# Wait a moment for server to start
sleep 3

# Check if server is responding
if curl -s http://localhost:1337/api/health > /dev/null 2>&1; then
    echo "✅ Strapi server is running successfully!"
    echo "📊 Server details:"
    echo "   - URL: http://localhost:1337/api"
    echo "   - Health: http://localhost:1337/api/health" 
    echo "   - Categories: http://localhost:1337/api/categories"
    echo "   - Partners: http://localhost:1337/api/partners"
    echo "   - Products: http://localhost:1337/api/products"
    echo "   - Blog Posts: http://localhost:1337/api/blog-posts"
    echo "   - Team Members: http://localhost:1337/api/team-members"
    echo "   - Company Info: http://localhost:1337/api/company-info"
    echo ""
    echo "📋 To stop the server: kill $SERVER_PID"
    echo "📋 Server logs: tail -f strapi-server.log"
else
    echo "❌ Server failed to start properly"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi