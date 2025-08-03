
#!/bin/bash

# Script to start only Payload CMS in development mode
# Useful for CMS-only development or testing

echo "🚀 Starting Payload CMS only in development mode..."

# Set environment to development
export NODE_ENV=development

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down Payload CMS server..."
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start Payload CMS development server
echo "🟡 Starting Payload CMS development server..."
echo "🔗 Admin Panel: http://localhost:3001/admin"
echo "🔗 API Endpoint: http://localhost:3001/api"
echo ""
echo "Press Ctrl+C to stop the server"

npx tsx scripts/start-payload-dev.ts
