#!/bin/bash
# Logs viewing utility for Docker VPS deployment

# Default to following logs
MODE="${1:-follow}"

case "$MODE" in
  follow|f)
    echo "📝 Following application logs (Ctrl+C to exit)..."
    docker-compose logs -f app
    ;;
  tail|t)
    LINES="${2:-100}"
    echo "📝 Last ${LINES} lines of application logs..."
    docker-compose logs --tail="${LINES}" app
    ;;
  all)
    echo "📝 All logs (including older logs)..."
    docker-compose logs app
    ;;
  errors|e)
    echo "📝 Filtering for errors..."
    docker-compose logs app | grep -i "error"
    ;;
  *)
    echo "Usage: ./logs.sh [follow|tail|all|errors] [lines]"
    echo ""
    echo "Examples:"
    echo "  ./logs.sh follow       # Follow logs (default)"
    echo "  ./logs.sh tail 50      # Show last 50 lines"
    echo "  ./logs.sh all          # Show all logs"
    echo "  ./logs.sh errors       # Filter for errors"
    ;;
esac
