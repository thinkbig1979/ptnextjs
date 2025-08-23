#!/bin/bash

# Start both Strapi server and Next.js development server
# This script provides a complete development environment

set -e

echo "🚀 Starting Paul Thames development environment with Strapi integration"

# Function to cleanup on exit
cleanup() {
    echo "🧹 Shutting down servers..."
    pkill -f "strapi-server-complete.js" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Strapi server
echo "📊 Starting Strapi-compatible server..."
if [[ -f "strapi-server-complete.js" ]]; then
    node strapi-server-complete.js &
    STRAPI_PID=$!
    echo "🆔 Strapi server PID: $STRAPI_PID"
    
    # Wait for Strapi to be ready
    echo "⏳ Waiting for Strapi server to be ready..."
    for i in {1..10}; do
        if curl -s http://localhost:1337/api/health > /dev/null 2>&1; then
            echo "✅ Strapi server is ready!"
            break
        fi
        if [[ $i -eq 10 ]]; then
            echo "❌ Strapi server failed to start in time"
            kill $STRAPI_PID 2>/dev/null || true
            exit 1
        fi
        sleep 2
    done
else
    echo "❌ strapi-server-complete.js not found"
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
echo "│  Next.js: http://localhost:3000        │"
echo "│  Strapi:  http://localhost:1337/api    │"
echo "└─────────────────────────────────────────┘"
echo ""
echo "📊 Available Strapi endpoints:"
echo "   • Categories: http://localhost:1337/api/categories"
echo "   • Partners:   http://localhost:1337/api/partners"
echo "   • Products:   http://localhost:1337/api/products"
echo "   • Blog Posts: http://localhost:1337/api/blog-posts"
echo ""
echo "🔄 Data source: data/superyacht_technology_research.json"
echo "⚡ Both servers will restart automatically on file changes"
echo ""
echo "💡 Press Ctrl+C to stop both servers"

# Wait for user interrupt
wait