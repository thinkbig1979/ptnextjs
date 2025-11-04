#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:3000"

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Manual Authentication Test${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Check if server is running
echo "Checking if server is running..."
if ! curl -s "$BASE_URL/api/auth/login" > /dev/null 2>&1; then
  echo -e "${RED}Server not responding at $BASE_URL${NC}"
  echo "Please start the server with: npm run dev"
  exit 1
fi
echo -e "${GREEN}✓ Server is running${NC}"
echo ""

# Generate unique credentials
TIMESTAMP=$(date +%s%N)
EMAIL="test-${TIMESTAMP}@test.example.com"
PASSWORD="TestPass123!@#"
COMPANY="Test Company ${TIMESTAMP}"

echo "Test Credentials:"
echo "  Company: $COMPANY"
echo "  Email: $EMAIL"
echo "  Password: $PASSWORD"
echo ""

# Step 1: Create vendor via seed API
echo "Step 1: Creating vendor via seed API..."
SEED_RESPONSE=$(curl -s -X POST "$BASE_URL/api/test/vendors/seed" \
  -H "Content-Type: application/json" \
  -d "{
    \"companyName\": \"$COMPANY\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"tier\": \"free\",
    \"status\": \"approved\"
  }")

echo "Response: $SEED_RESPONSE"

VENDOR_ID=$(echo "$SEED_RESPONSE" | grep -o '"vendorIds":\[[^]]*\]' | head -1 | sed 's/"vendorIds":\[//; s/\]//' | sed 's/"//g' | awk '{print $1}')

if [ -z "$VENDOR_ID" ]; then
  echo -e "${RED}✗ Failed to create vendor${NC}"
  echo "Full response: $SEED_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Vendor created with ID: $VENDOR_ID${NC}"
echo ""

# Step 2: Test login
echo "Step 2: Testing login..."
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo "Response: $RESPONSE_BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Login successful!${NC}"
  echo ""

  # Check response has user data
  if echo "$RESPONSE_BODY" | grep -q '"id"'; then
    echo -e "${GREEN}✓ Response contains user data${NC}"
    USER_ID=$(echo "$RESPONSE_BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "  User ID: $USER_ID"
  else
    echo -e "${RED}✗ Response missing user data${NC}"
  fi
else
  echo -e "${RED}✗ Login failed with HTTP $HTTP_CODE${NC}"
  exit 1
fi

echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}Authentication test passed!${NC}"
echo -e "${BLUE}======================================${NC}"
