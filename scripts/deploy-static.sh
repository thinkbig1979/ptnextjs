#!/bin/bash

# Complete Static Deployment Script
# This script handles the full deployment pipeline for static site generation

echo "🚀 Paul Thames Static Deployment Pipeline"
echo "=========================================="

# Parse command line arguments
DEPLOY_TARGET=${1:-"build-only"}
STRAPI_URL=${STRAPI_API_URL:-"http://localhost:1337"}

echo "🎯 Deployment target: $DEPLOY_TARGET"
echo "📡 Strapi CMS URL: $STRAPI_URL"
echo ""

# Set production environment
export NODE_ENV=production
export DISABLE_CONTENT_FALLBACK=true
export NEXT_OUTPUT_MODE=export

# Step 1: Environment validation
echo "1️⃣  Validating environment..."
if [ -z "$STRAPI_API_URL" ] && [ -z "$NEXT_PUBLIC_STRAPI_API_URL" ]; then
    echo "❌ Missing Strapi API URL configuration"
    echo "Please set STRAPI_API_URL or NEXT_PUBLIC_STRAPI_API_URL environment variable"
    exit 1
fi

# Check if we have required dependencies
if ! command -v tsx &> /dev/null; then
    echo "❌ tsx not found. Installing dependencies..."
    npm install
fi

# Step 2: Strapi health check
echo ""
echo "2️⃣  Checking Strapi CMS health..."
if ! curl -f -s "$STRAPI_URL/api/categories" > /dev/null 2>&1; then
    echo "❌ Strapi CMS is not accessible at $STRAPI_URL"
    echo ""
    echo "🔧 Troubleshooting steps:"
    echo "  1. Ensure Strapi server is running"
    echo "  2. Verify the STRAPI_API_URL is correct"
    echo "  3. Check firewall and network connectivity"
    echo "  4. Confirm Strapi has content in all required collections"
    exit 1
fi
echo "✅ Strapi CMS is accessible and responding"

# Step 3: Content validation
echo ""
echo "3️⃣  Validating CMS content..."
npm run validate-cms
if [ $? -ne 0 ]; then
    echo "❌ CMS content validation failed"
    echo ""
    echo "🔧 Required actions:"
    echo "  1. Add missing content to Strapi CMS"
    echo "  2. Ensure all partners have valid slugs"
    echo "  3. Verify product-partner relationships"
    echo "  4. Check for duplicate slugs"
    exit 1
fi
echo "✅ CMS content validation passed"

# Step 4: Clean previous build
echo ""
echo "4️⃣  Cleaning previous build..."
rm -rf .next
rm -rf out
echo "✅ Build directories cleaned"

# Step 5: Static site generation
echo ""
echo "5️⃣  Generating static site..."
next build
BUILD_STATUS=$?

if [ $BUILD_STATUS -ne 0 ]; then
    echo "❌ Static site generation failed"
    echo ""
    echo "🔧 Common issues and solutions:"
    echo "  1. CMS content changed during build - re-run validation"
    echo "  2. Network connectivity issues - check Strapi accessibility"
    echo "  3. Memory issues - ensure sufficient RAM for build process"
    echo "  4. TypeScript errors - run 'npm run lint' to check"
    exit 1
fi

echo "✅ Static site generated successfully"

# Step 6: Build verification
echo ""
echo "6️⃣  Verifying build output..."
if [ ! -d ".next" ]; then
    echo "❌ Build output directory not found"
    exit 1
fi

# Count generated pages
PAGE_COUNT=$(find .next -name "*.html" 2>/dev/null | wc -l)
echo "📄 Generated $PAGE_COUNT static pages"

# Check for key files
if [ ! -f ".next/static/chunks/pages/_app.js" ]; then
    echo "⚠️  Warning: Main app bundle not found - build may be incomplete"
fi

echo "✅ Build verification completed"

# Step 7: Deployment based on target
echo ""
echo "7️⃣  Processing deployment target: $DEPLOY_TARGET"

case $DEPLOY_TARGET in
    "build-only")
        echo "✅ Build completed successfully!"
        echo ""
        echo "📁 Static files ready in: .next/"
        echo "🌐 To serve locally: npm start"
        echo "☁️  To deploy: Use your preferred static hosting provider"
        ;;
    
    "netlify")
        echo "🌐 Preparing for Netlify deployment..."
        # Netlify typically uses the .next folder directly
        echo "✅ Ready for Netlify deployment from .next/ directory"
        ;;
    
    "vercel")
        echo "▲ Preparing for Vercel deployment..."
        # Vercel handles Next.js builds automatically
        echo "✅ Ready for Vercel deployment (use 'vercel deploy')"
        ;;
    
    "aws-s3")
        if [ -z "$AWS_S3_BUCKET" ]; then
            echo "❌ AWS_S3_BUCKET environment variable required for S3 deployment"
            exit 1
        fi
        echo "☁️  Deploying to AWS S3..."
        aws s3 sync .next/ s3://$AWS_S3_BUCKET --delete --exclude "*.map"
        echo "✅ Deployed to S3: $AWS_S3_BUCKET"
        ;;
    
    "github-pages")
        echo "📦 Preparing for GitHub Pages..."
        # GitHub Pages typically needs files in /docs or root
        mkdir -p docs
        cp -r .next/* docs/
        echo "✅ Ready for GitHub Pages from docs/ directory"
        ;;
    
    *)
        echo "⚠️  Unknown deployment target: $DEPLOY_TARGET"
        echo "Available targets: build-only, netlify, vercel, aws-s3, github-pages"
        ;;
esac

# Final summary
echo ""
echo "🎉 Deployment pipeline completed successfully!"
echo "=========================================="
echo "📊 Summary:"
echo "  • CMS content validated ✅"
echo "  • Static site generated ✅"
echo "  • $PAGE_COUNT pages pre-rendered ✅"
echo "  • Ready for $DEPLOY_TARGET ✅"
echo ""
echo "🔗 Next steps:"
echo "  1. Test the static build locally: npm start"
echo "  2. Deploy to your hosting provider"
echo "  3. Configure CDN and custom domain"
echo "  4. Set up monitoring and analytics"
echo ""
echo "📚 Documentation: README-STATIC-GENERATION.md"