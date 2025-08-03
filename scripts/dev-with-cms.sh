
#!/bin/bash

echo "🚀 Starting ISOLATED Next.js and Payload CMS Development Servers"
echo "=================================================================="
echo ""
echo "🏗️  STEP 6: Payload CMS Isolation - Complete Architectural Separation"
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
echo "✅ Both servers are starting up as ISOLATED services..."
echo ""
echo "🌐 ISOLATED ACCESS POINTS:"
echo "📱 Next.js App: http://localhost:3000"
echo "🎨 CMS Admin Panel: http://localhost:3001/admin (ISOLATED)"
echo "📡 CMS API: http://localhost:3001/api (ISOLATED)"
echo ""
echo "🔧 ARCHITECTURAL BENEFITS:"
echo "✨ No routing conflicts between services"
echo "🚀 Independent deployment capability"
echo "🔒 Complete service isolation"
echo "🔄 API communication via explicit endpoints"
echo ""
echo "🔐 Default CMS Login:"
echo "📧 Email: admin@paulthamessuperyachttechnology.com"
echo "🔑 Password: admin123"
echo ""
echo "💡 Press Ctrl+C to stop both servers"
echo "=================================================================="

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
