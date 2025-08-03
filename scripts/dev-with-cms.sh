
#!/bin/bash

echo "🚀 Starting Next.js Development Server with Payload CMS Integration"
echo "=================================================="
echo ""

# Set development environment
export NODE_ENV=development

echo "📦 Starting Next.js Development Server (Port 3000)..."
npm run dev &
NEXTJS_PID=$!

echo "⚡ Starting Payload CMS Development Server (Port 3001)..."
node scripts/start-payload-dev.js &
PAYLOAD_PID=$!

echo ""
echo "✅ Both servers are starting up..."
echo ""
echo "🌐 ACCESS POINTS:"
echo "📱 Next.js App: http://localhost:3000"
echo "🎨 CMS Admin Panel: http://localhost:3000/admin (INTEGRATED)"
echo "📡 CMS API: http://localhost:3000/api/payload (INTEGRATED)"
echo ""
echo "🔧 DIRECT CMS ACCESS (Development):"
echo "🛠️  Direct Admin: http://localhost:3001/admin"
echo "🔗 Direct API: http://localhost:3001/api"
echo ""
echo "🔐 Default CMS Login:"
echo "📧 Email: admin@paulthamessuperyachttechnology.com"
echo "🔑 Password: admin123"
echo ""
echo "💡 Press Ctrl+C to stop both servers"
echo "=================================================="

# Function to handle cleanup
cleanup() {
    echo ""
    echo "🛑 Shutting down development servers..."
    kill $NEXTJS_PID 2>/dev/null
    kill $PAYLOAD_PID 2>/dev/null
    echo "✅ Both servers stopped successfully"
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Wait for either process to exit
wait
