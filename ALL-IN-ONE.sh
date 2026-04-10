#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🚀 CoCar - ALL IN ONE LAUNCHER                          ║${NC}"
echo -e "${BLUE}║   Local Development + Cloudflare Tunnel                   ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"

PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_PATH="$PROJECT_ROOT/cocar-backend"
FRONTEND_PATH="$PROJECT_ROOT/cocar-frontend"

# Store tunnel URLs
TUNNEL_LOG="/tmp/cloudflare-tunnels.log"
rm -f $TUNNEL_LOG

echo -e "\n${YELLOW}Step 1: Validating setup...${NC}"

# Run local setup
./local-setup.sh

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Setup failed${NC}"
    exit 1
fi

echo -e "\n${GREEN}✅ Setup validated${NC}"

# ============================================================================
# Launch Services
# ============================================================================

echo -e "\n${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Launching Services...                                   ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"

# Create log directory
mkdir -p /tmp/cocar-logs

# Terminal 1: Backend
echo -e "\n${GREEN}[1/4]${NC} Starting Backend (Laravel)..."
cd "$BACKEND_PATH"
php artisan migrate --seed 2>/dev/null || php artisan migrate 2>/dev/null
php artisan serve --host=127.0.0.1 --port=8000 > /tmp/cocar-logs/backend.log 2>&1 &
BACKEND_PID=$!
sleep 3
echo -e "${GREEN}✅ Backend running (PID: $BACKEND_PID)${NC}"

# Terminal 2: Frontend
echo -e "${GREEN}[2/4]${NC} Starting Frontend (Vite)..."
cd "$FRONTEND_PATH"
npm run dev > /tmp/cocar-logs/frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 3
echo -e "${GREEN}✅ Frontend running (PID: $FRONTEND_PID)${NC}"

# Terminal 3: Reverb (WebSocket)
echo -e "${GREEN}[3/4]${NC} Starting Reverb (WebSocket)..."
cd "$BACKEND_PATH"
php artisan reverb:start --host=127.0.0.1 --port=8080 > /tmp/cocar-logs/reverb.log 2>&1 &
REVERB_PID=$!
sleep 2
echo -e "${GREEN}✅ Reverb running (PID: $REVERB_PID)${NC}"

# ============================================================================
# Create Cloudflare Tunnels
# ============================================================================

echo -e "\n${GREEN}[4/4]${NC} Creating Cloudflare Tunnels..."
echo -e "${YELLOW}  ⏳ This will generate public URLs...${NC}\n"

# Create named tunnels for better stability
TUNNEL_NAME_BACKEND="cocar-backend-$(date +%s)"
TUNNEL_NAME_FRONTEND="cocar-frontend-$(date +%s)"
TUNNEL_NAME_REVERB="cocar-reverb-$(date +%s)"

# Start tunnels in background and capture URLs
(
  echo -e "Backend Tunnel:"
  cloudflared tunnel --url http://localhost:8000 2>&1 | tee -a $TUNNEL_LOG
) > /tmp/cocar-logs/tunnel-backend.log 2>&1 &
TUNNEL_BACKEND_PID=$!

(
  echo -e "\nFrontend Tunnel:"
  cloudflared tunnel --url http://localhost:5173 2>&1 | tee -a $TUNNEL_LOG
) > /tmp/cocar-logs/tunnel-frontend.log 2>&1 &
TUNNEL_FRONTEND_PID=$!

(
  echo -e "\nReverb Tunnel:"
  cloudflared tunnel --url http://localhost:8080 2>&1 | tee -a $TUNNEL_LOG
) > /tmp/cocar-logs/tunnel-reverb.log 2>&1 &
TUNNEL_REVERB_PID=$!

sleep 5

# Extract URLs from logs
echo -e "\n${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   📡 YOUR PUBLIC CLOUDFLARE TUNNEL URLS                   ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${YELLOW}Check these URLs from Cloudflare tunnel output:${NC}"
echo -e "${CYAN}  Backend API:  $(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cocar-logs/tunnel-backend.log 2>/dev/null | head -1 || echo 'https://xxx.trycloudflare.com')${NC}"
echo -e "${CYAN}  Frontend:     $(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cocar-logs/tunnel-frontend.log 2>/dev/null | head -1 || echo 'https://xxx.trycloudflare.com')${NC}"
echo -e "${CYAN}  Reverb WS:    $(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cocar-logs/tunnel-reverb.log 2>/dev/null | head -1 || echo 'https://xxx.trycloudflare.com')${NC}"

# ============================================================================
# Display Summary
# ============================================================================

echo -e "\n${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   ✅ ALL SERVICES RUNNING!                               ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${GREEN}🎯 LOCAL URLs:${NC}"
echo -e "  Backend API:  ${CYAN}http://localhost:8000/api${NC}"
echo -e "  Frontend:     ${CYAN}http://localhost:5173${NC}"
echo -e "  WebSocket:    ${CYAN}ws://localhost:8080${NC}"

echo -e "\n${GREEN}🌐 PUBLIC URLs (via Cloudflare):${NC}"
echo -e "  Check the output above!"
echo -e "  They auto-generate on tunnel startup"

echo -e "\n${YELLOW}📋 Service Details:${NC}"
echo -e "  Backend PID:   $BACKEND_PID"
echo -e "  Frontend PID:  $FRONTEND_PID"
echo -e "  Reverb PID:    $REVERB_PID"
echo -e "  Backend Tunnel PID:   $TUNNEL_BACKEND_PID"
echo -e "  Frontend Tunnel PID:  $TUNNEL_FRONTEND_PID"
echo -e "  Reverb Tunnel PID:    $TUNNEL_REVERB_PID"

echo -e "\n${YELLOW}📝 Log Files:${NC}"
echo -e "  Backend:  /tmp/cocar-logs/backend.log"
echo -e "  Frontend: /tmp/cocar-logs/frontend.log"
echo -e "  Reverb:   /tmp/cocar-logs/reverb.log"
echo -e "  Tunnels:  /tmp/cocar-logs/tunnel-*.log"

echo -e "\n${YELLOW}🛑 To stop everything, press Ctrl+C${NC}"
echo -e "${YELLOW}(or kill the PIDs listed above)${NC}\n"

# Cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Stopping all services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID $REVERB_PID $TUNNEL_BACKEND_PID $TUNNEL_FRONTEND_PID $TUNNEL_REVERB_PID 2>/dev/null
    echo -e "${GREEN}✅ All services stopped${NC}"
}

trap cleanup EXIT INT TERM

# Keep script running
wait
