
#!/bin/bash

# Development script to run Next.js and Payload CMS simultaneously
# This script starts both servers in development mode

echo "🚀 Starting Next.js with Payload CMS in development mode..."
echo "📝 Note: This will start two servers:"
echo "   - Next.js: http://localhost:3000"
echo "   - Payload CMS: http://localhost:3001"
echo ""

# Set environment to development
export NODE_ENV=development

# Function to cleanup child processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down development servers..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start Next.js development server in background
echo "🔵 Starting Next.js development server..."
npm run dev &
NEXTJS_PID=$!

# Wait a moment for Next.js to start
sleep 3

# Start Payload CMS development server in background
echo "🟡 Starting Payload CMS development server..."
npx tsx scripts/start-payload-dev.ts &
PAYLOAD_PID=$!

# Wait for both processes
echo ""
echo "✅ Both servers are starting up..."
echo "🔗 Next.js: http://localhost:3000"
echo "🔗 Payload CMS Admin: http://localhost:3001/admin"
echo "🔗 Payload CMS API: http://localhost:3001/api"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for either process to exit
wait $NEXTJS_PID $PAYLOAD_PID
