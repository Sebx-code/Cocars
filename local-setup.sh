#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   CoCar Local + Cloudflare Setup                          ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"

# Get project root
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_PATH="$PROJECT_ROOT/cocar-backend"
FRONTEND_PATH="$PROJECT_ROOT/cocar-frontend"

echo -e "${YELLOW}📁 Project Root: $PROJECT_ROOT${NC}\n"

# ============================================================================
# Step 1: Validate Environment
# ============================================================================

echo -e "${YELLOW}🔍 Step 1: Validating environment...${NC}"

if ! command -v php &> /dev/null; then
    echo -e "${RED}❌ PHP not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ PHP found: $(php --version | head -1)${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"

if ! command -v cloudflared &> /dev/null; then
    echo -e "${RED}❌ cloudflared not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ cloudflared found: $(cloudflared --version)${NC}"

# ============================================================================
# Step 2: Setup Backend
# ============================================================================

echo -e "\n${YELLOW}🛠️  Step 2: Setting up Backend...${NC}"

cd "$BACKEND_PATH" || exit

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}  📝 Creating .env from .env.example...${NC}"
    cp .env.example .env
fi

# Generate app key if needed
if grep -q "APP_KEY=base64:$" .env; then
    echo -e "${YELLOW}  🔑 Generating APP_KEY...${NC}"
    php artisan key:generate
fi

echo -e "${GREEN}✅ Backend setup complete${NC}"

# ============================================================================
# Step 3: Setup Frontend
# ============================================================================

echo -e "\n${YELLOW}📦 Step 3: Setting up Frontend...${NC}"

cd "$FRONTEND_PATH" || exit

if [ ! -f .env ]; then
    echo -e "${YELLOW}  📝 Creating .env${NC}"
    cat > .env << 'ENVEOF'
VITE_APP_NAME=CoCar
VITE_API_URL=http://localhost:8000/api
VITE_APP_URL=http://localhost:5173
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
VITE_REVERB_APP_KEY=43lmfcbuxcv4fdou1a6u
ENVEOF
    echo -e "${GREEN}✅ Frontend .env created${NC}"
else
    echo -e "${GREEN}✅ Frontend .env exists${NC}"
fi

# Install dependencies if needed
if [ ! -d node_modules ]; then
    echo -e "${YELLOW}  📦 Installing npm dependencies...${NC}"
    npm install
fi

# ============================================================================
# Display Instructions
# ============================================================================

echo -e "\n${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🚀 READY TO START - Run these commands in separate terminals:${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${YELLOW}Terminal 1 - Backend (Laravel):${NC}"
echo -e "${GREEN}  cd $BACKEND_PATH${NC}"
echo -e "${GREEN}  php artisan migrate${NC}"
echo -e "${GREEN}  php artisan serve${NC}"

echo -e "\n${YELLOW}Terminal 2 - Frontend (Vite):${NC}"
echo -e "${GREEN}  cd $FRONTEND_PATH${NC}"
echo -e "${GREEN}  npm run dev${NC}"

echo -e "\n${YELLOW}Terminal 3 - Backend WebSocket (Reverb):${NC}"
echo -e "${GREEN}  cd $BACKEND_PATH${NC}"
echo -e "${GREEN}  php artisan reverb:start${NC}"

echo -e "\n${YELLOW}Terminal 4 - Cloudflare Tunnels (When all above are running):${NC}"
echo -e "${GREEN}  export BACKEND_PORT=8000${NC}"
echo -e "${GREEN}  export FRONTEND_PORT=5173${NC}"
echo -e "${GREEN}  export REVERB_PORT=8080${NC}"
echo -e "${GREEN}  ./cloudflare-tunnels.sh${NC}"

echo -e "\n${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   📊 LOCAL URLs:${NC}"
echo -e "${BLUE}║   Backend API: http://localhost:8000/api${NC}"
echo -e "${BLUE}║   Frontend: http://localhost:5173${NC}"
echo -e "${BLUE}║   WebSocket: ws://localhost:8080${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${GREEN}✅ Setup complete! Following the instructions above to start the project.${NC}\n"
