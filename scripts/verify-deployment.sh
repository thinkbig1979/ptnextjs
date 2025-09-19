#!/bin/bash
# Deployment Verification Script for Platform Vision Expansion
# Usage: ./scripts/verify-deployment.sh [url]

set -e

echo "🔍 Platform Vision Deployment Verification"
echo "=========================================="

# Configuration
BASE_URL="${1:-http://localhost:3000}"
VERIFICATION_LOG="./deployment-verification.log"
ERROR_COUNT=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "$1" | tee -a "$VERIFICATION_LOG"
}

# Error tracking
track_error() {
    ((ERROR_COUNT++))
    log "${RED}❌ FAIL: $1${NC}"
}

# Success tracking
track_success() {
    log "${GREEN}✅ PASS: $1${NC}"
}

# Warning tracking
track_warning() {
    log "${YELLOW}⚠️  WARN: $1${NC}"
}

# Info tracking
track_info() {
    log "${BLUE}ℹ️  INFO: $1${NC}"
}

# Initialize log
echo "Deployment Verification - $(date)" > "$VERIFICATION_LOG"

# Function to check URL accessibility
check_url() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}

    track_info "Checking: $description ($url)"

    if command -v curl >/dev/null 2>&1; then
        local status=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")

        if [ "$status" = "$expected_status" ]; then
            track_success "$description accessible (HTTP $status)"
        else
            track_error "$description returned HTTP $status (expected $expected_status)"
        fi
    else
        track_warning "curl not available, skipping URL check for $description"
    fi
}

# Function to check build files
check_build_files() {
    track_info "Verifying build files..."

    local build_dir="./out"
    local critical_files=(
        "$build_dir/index.html"
        "$build_dir/_next"
        "$build_dir/vendors/index.html"
        "$build_dir/products/index.html"
        "$build_dir/partners/index.html"
    )

    if [ ! -d "$build_dir" ]; then
        track_error "Build directory '$build_dir' does not exist"
        return
    fi

    for file in "${critical_files[@]}"; do
        if [ -e "$file" ]; then
            track_success "Critical file exists: $(basename "$file")"
        else
            track_error "Critical file missing: $file"
        fi
    done
}

# Function to check package configuration
check_package_config() {
    track_info "Verifying package configuration..."

    # Check if package.json exists and has required scripts
    if [ -f "package.json" ]; then
        local required_scripts=("build" "dev" "start" "lint" "type-check" "test")

        for script in "${required_scripts[@]}"; do
            if grep -q "\"$script\":" package.json; then
                track_success "Script '$script' configured"
            else
                track_error "Script '$script' missing from package.json"
            fi
        done
    else
        track_error "package.json not found"
    fi
}

# Function to check TypeScript configuration
check_typescript_config() {
    track_info "Verifying TypeScript configuration..."

    if npm run type-check >/dev/null 2>&1; then
        track_success "TypeScript compilation passes"
    else
        track_error "TypeScript compilation fails"
    fi
}

# Function to check linting
check_linting() {
    track_info "Verifying code quality..."

    if npm run lint >/dev/null 2>&1; then
        track_success "ESLint validation passes"
    else
        track_warning "ESLint validation has warnings/errors (check manually)"
    fi
}

# Function to check core pages
check_core_pages() {
    track_info "Checking core pages accessibility..."

    local pages=(
        "/"
        "/vendors"
        "/products"
        "/partners"
        "/about"
        "/contact"
    )

    for page in "${pages[@]}"; do
        check_url "$BASE_URL$page" "Page: $page"
    done
}

# Function to check enhanced features
check_enhanced_features() {
    track_info "Checking enhanced platform features..."

    # Check for vendor detail pages
    local vendor_pages=(
        "/vendors/raymarine-teledyne-flir"
        "/vendors/caterpillar-marine"
    )

    for page in "${vendor_pages[@]}"; do
        check_url "$BASE_URL$page" "Enhanced vendor page: $page"
    done

    # Check for product detail pages
    local product_pages=(
        "/products/axiom-pro-mfd-series"
        "/products/c32-acert-marine-engine"
    )

    for page in "${product_pages[@]}"; do
        check_url "$BASE_URL$page" "Enhanced product page: $page"
    done
}

# Function to check static assets
check_static_assets() {
    track_info "Checking static assets..."

    local asset_paths=(
        "_next/static"
        "images"
        "icons"
    )

    local build_dir="./out"

    for asset_path in "${asset_paths[@]}"; do
        if [ -d "$build_dir/$asset_path" ]; then
            track_success "Asset directory exists: $asset_path"
        else
            track_warning "Asset directory missing or empty: $asset_path"
        fi
    done
}

# Function to check responsive design
check_responsive_design() {
    track_info "Verifying responsive design elements..."

    local test_file="./out/index.html"

    if [ -f "$test_file" ]; then
        if grep -q "viewport" "$test_file"; then
            track_success "Viewport meta tag found"
        else
            track_error "Viewport meta tag missing"
        fi

        if grep -q "responsive\|md:\|lg:\|sm:" "$test_file"; then
            track_success "Responsive classes detected"
        else
            track_warning "Responsive classes not detected in main page"
        fi
    else
        track_error "Cannot check responsive design - index.html missing"
    fi
}

# Function to check performance budgets
check_performance_budgets() {
    track_info "Checking performance budgets..."

    local build_dir="./out"

    if [ -d "$build_dir/_next/static" ]; then
        # Check main bundle size
        local main_bundle=$(find "$build_dir/_next/static" -name "*.js" -type f | head -1)

        if [ -n "$main_bundle" ] && [ -f "$main_bundle" ]; then
            local bundle_size=$(stat -f%z "$main_bundle" 2>/dev/null || stat -c%s "$main_bundle" 2>/dev/null || echo "0")
            local bundle_size_kb=$((bundle_size / 1024))

            if [ "$bundle_size_kb" -lt 300 ]; then
                track_success "Bundle size within budget: ${bundle_size_kb}KB"
            else
                track_warning "Bundle size large: ${bundle_size_kb}KB (consider optimization)"
            fi
        else
            track_warning "Could not find main bundle for size check"
        fi
    else
        track_error "Static assets directory not found"
    fi
}

# Function to check external dependencies
check_external_dependencies() {
    track_info "Verifying external dependencies..."

    local dependencies=(
        "@react-three/fiber"
        "react-pdf"
        "react-player"
        "framer-motion"
    )

    for dep in "${dependencies[@]}"; do
        if npm list "$dep" >/dev/null 2>&1; then
            track_success "Dependency available: $dep"
        else
            track_error "Dependency missing: $dep"
        fi
    done
}

# Function to generate summary report
generate_summary() {
    echo ""
    log "${BLUE}=========================================="
    log "DEPLOYMENT VERIFICATION SUMMARY"
    log "==========================================${NC}"

    if [ "$ERROR_COUNT" -eq 0 ]; then
        log "${GREEN}🎉 ALL CHECKS PASSED${NC}"
        log "${GREEN}Deployment appears to be successful!${NC}"
        exit 0
    else
        log "${RED}❌ $ERROR_COUNT ERRORS FOUND${NC}"
        log "${RED}Please review the errors above before deploying.${NC}"
        log ""
        log "Detailed log available at: $VERIFICATION_LOG"
        exit 1
    fi
}

# Main execution
main() {
    track_info "Starting deployment verification for: $BASE_URL"
    track_info "Log file: $VERIFICATION_LOG"

    # Build and configuration checks
    check_build_files
    check_package_config
    check_typescript_config
    check_linting

    # Feature-specific checks
    check_core_pages
    check_enhanced_features
    check_static_assets
    check_responsive_design
    check_performance_budgets
    check_external_dependencies

    # Generate final report
    generate_summary
}

# Handle script arguments
case "${1:-verify}" in
    "help"|"-h"|"--help")
        echo "Usage: $0 [base-url|help]"
        echo ""
        echo "Arguments:"
        echo "  base-url    Base URL to verify (default: http://localhost:3000)"
        echo "  help        Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0                                    # Verify localhost:3000"
        echo "  $0 https://your-domain.com            # Verify production site"
        echo "  $0 help                               # Show help"
        ;;
    *)
        main
        ;;
esac