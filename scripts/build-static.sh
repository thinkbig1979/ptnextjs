#!/bin/bash

# Static Site Generation Build Script
# This script builds the website as a fully static site using CMS data

echo "🚀 Starting Static Site Generation Build..."
echo "========================================"

# Set environment variables for static build
export NODE_ENV=production
export DISABLE_CONTENT_FALLBACK=true
export NEXT_OUTPUT_MODE=export

# Check if Strapi is running
echo "🔍 Checking Strapi CMS availability..."
STRAPI_URL="${STRAPI_API_URL:-http://localhost:1337}"
if curl -f -s "$STRAPI_URL/api/categories" > /dev/null; then
    echo "✅ Strapi CMS is running at $STRAPI_URL"
else
    echo "❌ Strapi CMS is not accessible at $STRAPI_URL"
    echo "Please ensure your Strapi server is running with content before building."
    exit 1
fi

# Validate CMS content before building
echo "🔍 Validating CMS content..."
npm run validate-cms
if [ $? -ne 0 ]; then
    echo "❌ CMS validation failed. Build cannot proceed."
    exit 1
fi

# Build the static site
echo "🏗️  Building static site..."
next build
if [ $? -ne 0 ]; then
    echo "❌ Build failed."
    exit 1
fi

# Check if build was successful
if [ -d ".next" ]; then
    echo "✅ Static site build completed successfully!"
    echo ""
    echo "📁 Output directory: .next/"
    echo "🌐 The website is now ready for static deployment"
    echo ""
    echo "To test the static build locally:"
    echo "  npm start"
    echo ""
    echo "To deploy to static hosting (Netlify, Vercel, etc.):"
    echo "  Upload the contents of '.next/' to your hosting provider"
else
    echo "❌ Build directory not found. Build may have failed."
    exit 1
fi