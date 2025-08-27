#!/bin/bash

# Start both Strapi CMS and Next.js development server
# This script provides a complete development environment

set -e

echo "🚀 Starting Paul Thames development environment with Strapi CMS integration"

# Function to cleanup on exit
cleanup() {
    echo "🧹 Shutting down servers..."
    pkill -f "strapi develop" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Strapi CMS server
echo "📊 Starting Strapi CMS server..."
if [[ -d "strapi-cms" ]]; then
    cd strapi-cms
    npm run develop &
    STRAPI_PID=$!
    cd ..
    echo "🆔 Strapi CMS PID: $STRAPI_PID"
    
    # Wait for Strapi to be ready
    echo "⏳ Waiting for Strapi CMS to be ready..."
    for i in {1..30}; do
        if curl -s http://localhost:1337/admin > /dev/null 2>&1; then
            echo "✅ Strapi CMS is ready!"
            break
        fi
        if [[ $i -eq 30 ]]; then
            echo "❌ Strapi CMS failed to start in time"
            kill $STRAPI_PID 2>/dev/null || true
            exit 1
        fi
        sleep 2
    done
else
    echo "❌ strapi-cms directory not found"
    exit 1
fi

# Start Next.js development server
echo "🌐 Starting Next.js development server..."
npm run dev &
NEXTJS_PID=$!
echo "🆔 Next.js server PID: $NEXTJS_PID"

echo ""
echo "🎉 Development environment is running!"
echo "┌─────────────────────────────────────────┐"
echo "│  Next.js:     http://localhost:3000    │"
echo "│  Strapi API:  http://localhost:1337/api │"
echo "│  Strapi Admin: http://localhost:1337/admin │"
echo "└─────────────────────────────────────────┘"
echo ""
echo "📊 Next Steps:"
echo "   1. Visit http://localhost:1337/admin to set up your first admin user"
echo "   2. Create content types (Partners, Products, Blog Posts, etc.)"
echo "   3. Add content through the Strapi admin panel"
echo "   4. Content will be available at http://localhost:1337/api/{content-type}"
echo ""
echo "⚡ Both servers will restart automatically on file changes"
echo "💡 Press Ctrl+C to stop both servers"

# Wait for user interrupt
wait