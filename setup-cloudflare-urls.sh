#!/bin/bash

# ============================================================================
# Cloudflare Tunnel URL Auto-Detection & Configuration Script
# ============================================================================
# This script automatically detects Cloudflare Tunnel URLs and updates
# all project configuration files (.env files, config files, etc.)
#
# Usage:
#   ./setup-cloudflare-urls.sh <backend_url> <frontend_url> <reverb_url>
#   ./setup-cloudflare-urls.sh https://backend.trycloudflare.com https://frontend.trycloudflare.com https://reverb.trycloudflare.com
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# Helper Functions
# ============================================================================

print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║ $1${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Validate URL format
validate_url() {
    local url=$1
    if [[ $url =~ ^https?:// ]]; then
        return 0
    else
        return 1
    fi
}

# Extract domain from URL
extract_domain() {
    local url=$1
    echo "$url" | sed 's|https://||g' | sed 's|http://||g' | cut -d'/' -f1
}

# ============================================================================
# Main Script
# ============================================================================

main() {
    print_header "Cloudflare Tunnel URL Configuration"

    # Get project root
    PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    
    # Check if URLs are provided
    if [ $# -eq 0 ]; then
        print_error "Missing arguments!"
        echo ""
        echo "Usage: $0 <backend_url> <frontend_url> <reverb_url>"
        echo ""
        echo "Examples:"
        echo "  $0 https://backend.trycloudflare.com https://frontend.trycloudflare.com https://reverb.trycloudflare.com"
        exit 1
    fi

    BACKEND_URL=$1
    FRONTEND_URL=$2
    REVERB_URL=$3

    # Validate URLs
    print_info "Validating URLs..."
    
    if ! validate_url "$BACKEND_URL"; then
        print_error "Invalid backend URL: $BACKEND_URL"
        exit 1
    fi
    print_success "Backend URL: $BACKEND_URL"

    if ! validate_url "$FRONTEND_URL"; then
        print_error "Invalid frontend URL: $FRONTEND_URL"
        exit 1
    fi
    print_success "Frontend URL: $FRONTEND_URL"

    if ! validate_url "$REVERB_URL"; then
        print_error "Invalid Reverb URL: $REVERB_URL"
        exit 1
    fi
    print_success "Reverb URL: $REVERB_URL"

    echo ""
    print_header "Updating Configuration Files"

    # ========================================================================
    # 1. Create/Update cloudflare.env (Central Configuration)
    # ========================================================================
    print_info "Creating cloudflare.env..."
    
    cat > "$PROJECT_ROOT/cloudflare.env" << EOF
# ============================================================================
# Cloudflare Tunnel URLs Configuration
# ============================================================================
# This is the single source of truth for Cloudflare Tunnel URLs
# All other .env files and configurations derive from this
#
# Generated: $(date)
# ============================================================================

# Backend API URL
CLOUDFLARE_BACKEND=$BACKEND_URL

# Frontend URL (for CORS)
CLOUDFLARE_FRONTEND=$FRONTEND_URL

# WebSocket (Reverb) URL
CLOUDFLARE_REVERB=$REVERB_URL

# Extracted domains for convenience
CLOUDFLARE_BACKEND_DOMAIN=$(extract_domain "$BACKEND_URL")
CLOUDFLARE_FRONTEND_DOMAIN=$(extract_domain "$FRONTEND_URL")
CLOUDFLARE_REVERB_DOMAIN=$(extract_domain "$REVERB_URL")
EOF
    
    print_success "cloudflare.env created"

    # ========================================================================
    # 2. Update Backend .env
    # ========================================================================
    print_info "Updating cocar-backend/.env..."
    
    BACKEND_ENV="$PROJECT_ROOT/cocar-backend/.env"
    
    # Source cloudflare.env to get values
    source "$PROJECT_ROOT/cloudflare.env"
    
    # Update or add APP_URL
    if grep -q "^APP_URL=" "$BACKEND_ENV"; then
        sed -i.bak "s|^APP_URL=.*|APP_URL=$BACKEND_URL|" "$BACKEND_ENV"
    else
        echo "APP_URL=$BACKEND_URL" >> "$BACKEND_ENV"
    fi
    
    # Update or add ALLOWED_ORIGINS (for CORS)
    if grep -q "^ALLOWED_ORIGINS=" "$BACKEND_ENV"; then
        sed -i.bak "s|^ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=$FRONTEND_URL,$REVERB_URL|" "$BACKEND_ENV"
    else
        echo "ALLOWED_ORIGINS=$FRONTEND_URL,$REVERB_URL" >> "$BACKEND_ENV"
    fi
    
    # Update Reverb configuration in .env
    if grep -q "^REVERB_HOST=" "$BACKEND_ENV"; then
        sed -i.bak "s|^REVERB_HOST=.*|REVERB_HOST=$(extract_domain "$REVERB_URL")|" "$BACKEND_ENV"
    else
        echo "REVERB_HOST=$(extract_domain "$REVERB_URL")" >> "$BACKEND_ENV"
    fi
    
    if grep -q "^REVERB_SCHEME=" "$BACKEND_ENV"; then
        sed -i.bak "s|^REVERB_SCHEME=.*|REVERB_SCHEME=https|" "$BACKEND_ENV"
    else
        echo "REVERB_SCHEME=https" >> "$BACKEND_ENV"
    fi
    
    # Clean up backup files
    rm -f "$BACKEND_ENV.bak"
    
    print_success "cocar-backend/.env updated"

    # ========================================================================
    # 3. Update Frontend .env
    # ========================================================================
    print_info "Updating cocar-frontend/.env..."
    
    FRONTEND_ENV="$PROJECT_ROOT/cocar-frontend/.env"
    
    # Update or add VITE_API_URL
    if grep -q "^VITE_API_URL=" "$FRONTEND_ENV"; then
        sed -i.bak "s|^VITE_API_URL=.*|VITE_API_URL=$BACKEND_URL/api|" "$FRONTEND_ENV"
    else
        echo "VITE_API_URL=$BACKEND_URL/api" >> "$FRONTEND_ENV"
    fi
    
    # Update or add VITE_REVERB_HOST
    if grep -q "^VITE_REVERB_HOST=" "$FRONTEND_ENV"; then
        sed -i.bak "s|^VITE_REVERB_HOST=.*|VITE_REVERB_HOST=$(extract_domain "$REVERB_URL")|" "$FRONTEND_ENV"
    else
        echo "VITE_REVERB_HOST=$(extract_domain "$REVERB_URL")" >> "$FRONTEND_ENV"
    fi
    
    # Update or add VITE_REVERB_SCHEME
    if grep -q "^VITE_REVERB_SCHEME=" "$FRONTEND_ENV"; then
        sed -i.bak "s|^VITE_REVERB_SCHEME=.*|VITE_REVERB_SCHEME=https|" "$FRONTEND_ENV"
    else
        echo "VITE_REVERB_SCHEME=https" >> "$FRONTEND_ENV"
    fi
    
    # Update or add VITE_APP_URL (for frontend access)
    if grep -q "^VITE_APP_URL=" "$FRONTEND_ENV"; then
        sed -i.bak "s|^VITE_APP_URL=.*|VITE_APP_URL=$FRONTEND_URL|" "$FRONTEND_ENV"
    else
        echo "VITE_APP_URL=$FRONTEND_URL" >> "$FRONTEND_ENV"
    fi
    
    # Clean up backup files
    rm -f "$FRONTEND_ENV.bak"
    
    print_success "cocar-frontend/.env updated"

    # ========================================================================
    # 4. Update vite.config.ts (Frontend)
    # ========================================================================
    print_info "Updating cocar-frontend/vite.config.ts..."
    
    VITE_CONFIG="$PROJECT_ROOT/cocar-frontend/vite.config.ts"
    
    # Use a temporary file to update vite.config.ts
    cat > "$VITE_CONFIG.tmp" << 'VITE_EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
const envConfig = dotenv.config({ path: '../cloudflare.env' })
const BACKEND_URL  = envConfig.parsed?.CLOUDFLARE_BACKEND || 'https://localhost:8000'
const REVERB_URL   = envConfig.parsed?.CLOUDFLARE_REVERB || 'https://localhost:9000'
const FRONTEND_URL = envConfig.parsed?.CLOUDFLARE_FRONTEND || 'http://localhost:5173'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      // Extract domain from FRONTEND_URL
      FRONTEND_URL.replace(/https?:\/\//, '').split('/')[0],
    ],
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
      '/sanctum': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
      '/broadcasting': {
        target: REVERB_URL,
        changeOrigin: true,
        ws: true,           // Enable WebSocket proxy
      },
    },
  },
})
VITE_EOF

    # Replace the vite.config.ts
    mv "$VITE_CONFIG.tmp" "$VITE_CONFIG"
    print_success "cocar-frontend/vite.config.ts updated"

    # ========================================================================
    # 5. Display Summary
    # ========================================================================
    echo ""
    print_header "Configuration Summary"
    
    echo ""
    print_info "Central Configuration File:"
    echo "  📄 cloudflare.env"
    
    echo ""
    print_info "Backend Configuration:"
    echo "  📝 cocar-backend/.env"
    echo "     - APP_URL: $BACKEND_URL"
    echo "     - ALLOWED_ORIGINS: $FRONTEND_URL, $REVERB_URL"
    echo "     - REVERB_HOST: $(extract_domain "$REVERB_URL")"
    
    echo ""
    print_info "Frontend Configuration:"
    echo "  📝 cocar-frontend/.env"
    echo "     - VITE_API_URL: $BACKEND_URL/api"
    echo "     - VITE_REVERB_HOST: $(extract_domain "$REVERB_URL")"
    echo "     - VITE_APP_URL: $FRONTEND_URL"
    
    echo ""
    print_info "Vite Configuration:"
    echo "  ⚙️  cocar-frontend/vite.config.ts"
    echo "     - Backend proxy: $BACKEND_URL"
    echo "     - WebSocket proxy: $REVERB_URL"
    
    echo ""
    print_header "✅ Configuration Complete!"
    
    echo ""
    print_success "All files have been updated successfully!"
    print_warning "Make sure to rebuild your frontend and restart your backend services"
    
    echo ""
    print_info "Next steps:"
    echo "  1. Backend:  cd cocar-backend && php artisan serve"
    echo "  2. Frontend: cd cocar-frontend && npm run dev"
    echo "  3. Reverb:   cd cocar-backend && php artisan reverb:start"
}

# Run main function
main "$@"
