#!/bin/bash
# Add DISABLE_RATE_LIMIT to .env file for E2E testing

ENV_FILE=".env"

# Check if DISABLE_RATE_LIMIT already exists
if grep -q "DISABLE_RATE_LIMIT" "$ENV_FILE"; then
  echo "DISABLE_RATE_LIMIT already exists in $ENV_FILE"
  exit 0
fi

# Add the setting after DISABLE_EMAILS
echo "# Disable rate limiting for E2E testing (prevents test failures from rate limits)" >> "$ENV_FILE"
echo "DISABLE_RATE_LIMIT=true" >> "$ENV_FILE"

echo "Added DISABLE_RATE_LIMIT=true to $ENV_FILE"
