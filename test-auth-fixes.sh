#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Authentication Fixes Testing${NC}"
echo -e "${BLUE}======================================${NC}"

# First, apply the fixes
echo -e "\n${YELLOW}Step 1: Applying fixes...${NC}"
bash /home/edwin/development/ptnextjs/fix-auth-issues.sh

# Check if dev server is running
echo -e "\n${YELLOW}Step 2: Checking if dev server is running...${NC}"
if curl -s http://localhost:3000/api/auth/login > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Dev server is running${NC}"
else
  echo -e "${RED}✗ Dev server not running${NC}"
  echo -e "${YELLOW}Starting dev server...${NC}"
  cd /home/edwin/development/ptnextjs
  npm run dev:clean > /tmp/dev-server.log 2>&1 &
  sleep 10
fi

# Test 1: Create a vendor via seed API
echo -e "\n${YELLOW}Step 3: Test 3.1 - Creating vendor via seed API...${NC}"
TIMESTAMP=$(date +%s)
SEED_RESPONSE=$(curl -s -X POST http://localhost:3000/api/test/vendors/seed \
  -H "Content-Type: application/json" \
  -d "[{
    \"companyName\": \"Auth Fix Test ${TIMESTAMP}\",
    \"email\": \"authfix-${TIMESTAMP}@test.example.com\",
    \"password\": \"AuthTest123!@#\",
    \"tier\": \"free\",
    \"status\": \"approved\"
  }]")

echo "Seed API Response: $SEED_RESPONSE"

# Extract vendor ID
VENDOR_ID=$(echo "$SEED_RESPONSE" | grep -o '"vendorIds":\[[^]]*\]' | sed 's/"vendorIds":\[//; s/\]//' | sed 's/"//g')
VENDOR_EMAIL="authfix-${TIMESTAMP}@test.example.com"

if [ -z "$VENDOR_ID" ]; then
  echo -e "${RED}✗ Failed to create vendor${NC}"
  exit 1
else
  echo -e "${GREEN}✓ Vendor created: $VENDOR_ID${NC}"
fi

# Test 2: Try to login with the created vendor
echo -e "\n${YELLOW}Step 3.2: Test login with created vendor...${NC}"
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${VENDOR_EMAIL}\",
    \"password\": \"AuthTest123!@#\"
  }")

# Extract HTTP status code
HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | head -n-1)

echo "Login Response Code: $HTTP_CODE"
echo "Login Response Body: $RESPONSE_BODY"

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Login successful (HTTP 200)${NC}"

  # Check if response contains user data
  if echo "$RESPONSE_BODY" | grep -q '"id"'; then
    echo -e "${GREEN}✓ Response contains user data${NC}"
  else
    echo -e "${RED}✗ Response missing user data${NC}"
  fi
else
  echo -e "${RED}✗ Login failed with HTTP $HTTP_CODE${NC}"
  echo -e "${RED}Response: $RESPONSE_BODY${NC}"
  exit 1
fi

# Test 3: Test with invalid credentials
echo -e "\n${YELLOW}Step 3.3: Test login with invalid credentials...${NC}"
INVALID_LOGIN=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"nonexistent@test.example.com\",
    \"password\": \"InvalidPass123!@#\"
  }")

INVALID_CODE=$(echo "$INVALID_LOGIN" | tail -n1)
INVALID_BODY=$(echo "$INVALID_LOGIN" | head -n-1)

echo "Invalid Login Response Code: $INVALID_CODE"

if [ "$INVALID_CODE" = "401" ] || [ "$INVALID_CODE" = "400" ]; then
  echo -e "${GREEN}✓ Correctly rejected invalid credentials (HTTP $INVALID_CODE)${NC}"
else
  echo -e "${RED}✗ Unexpected response code: $INVALID_CODE${NC}"
fi

# Test 4: Run E2E authentication tests
echo -e "\n${YELLOW}Step 4: Running E2E authentication tests...${NC}"
cd /home/edwin/development/ptnextjs
npm run test:e2e -- tests/e2e/vendor-onboarding/03-authentication.spec.ts --reporter=list 2>&1 | tee /tmp/e2e-results.log

# Check test results
if grep -q "passed" /tmp/e2e-results.log; then
  echo -e "${GREEN}✓ E2E tests completed${NC}"
else
  echo -e "${YELLOW}⚠ Check E2E test results above${NC}"
fi

echo -e "\n${BLUE}======================================${NC}"
echo -e "${BLUE}Testing Complete${NC}"
echo -e "${BLUE}======================================${NC}"
