#!/bin/bash
echo "🧹 Cleaning up dev servers..."

# Kill all npm run dev processes
pkill -f "npm run dev" 2>/dev/null || true

# Kill all next dev processes
pkill -f "next dev" 2>/dev/null || true

# Kill next-server (production) processes
pkill -f "next-server" 2>/dev/null || true

# Kill processes on common Next.js ports using ss (more reliable than lsof for IPv6)
for port in 3000 3001 3002 3003; do
  pid=$(ss -tlnp "sport = :$port" 2>/dev/null | grep -oP 'pid=\K\d+' | head -1)
  if [ -n "$pid" ]; then
    kill -9 "$pid" 2>/dev/null && echo "  Killed process $pid on port $port"
  fi
done

# Fallback: also try lsof (for older systems)
lsof -ti:3000,3001,3002,3003 2>/dev/null | xargs -r kill -9 2>/dev/null || true

echo "✅ All dev servers stopped"