#!/bin/bash
echo "🧹 Cleaning up dev servers..."

# Kill all npm run dev processes
pkill -f "npm run dev" 2>/dev/null || true

# Kill all next dev processes
pkill -f "next dev" 2>/dev/null || true

# Kill processes on common Next.js ports
lsof -ti:3000,3001,3002,3003 | xargs kill -9 2>/dev/null || true

echo "✅ All dev servers stopped"