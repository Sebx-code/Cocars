#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🌐 Cloudflare Tunnels - Starting                        ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"

# Default ports
BACKEND_PORT=${BACKEND_PORT:-8000}
FRONTEND_PORT=${FRONTEND_PORT:-5173}
REVERB_PORT=${REVERB_PORT:-8080}

echo -e "${YELLOW}📌 Using ports:${NC}"
echo -e "  Backend: ${GREEN}http://localhost:$BACKEND_PORT${NC}"
echo -e "  Frontend: ${GREEN}http://localhost:$FRONTEND_PORT${NC}"
echo -e "  Reverb: ${GREEN}http://localhost:$REVERB_PORT${NC}"

# Create tunnels
echo -e "\n${YELLOW}🔗 Creating Cloudflare Tunnels...${NC}"
echo -e "${YELLOW}  (Each tunnel will output a URL - save them!)${NC}\n"

# Tunnel 1: Backend
echo -e "${GREEN}[1/3]${NC} Starting Backend tunnel..."
cloudflared tunnel --url http://localhost:$BACKEND_PORT &
BACKEND_PID=$!
sleep 3

# Tunnel 2: Frontend
echo -e "\n${GREEN}[2/3]${NC} Starting Frontend tunnel..."
cloudflared tunnel --url http://localhost:$FRONTEND_PORT &
FRONTEND_PID=$!
sleep 3

# Tunnel 3: Reverb WebSocket
echo -e "\n${GREEN}[3/3]${NC} Starting Reverb WebSocket tunnel..."
cloudflared tunnel --url http://localhost:$REVERB_PORT &
REVERB_PID=$!
sleep 3

echo -e "\n${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   ✅ All tunnels are running!${NC}"
echo -e "${BLUE}║${NC}"
echo -e "${BLUE}║   Check the output above for your public URLs${NC}"
echo -e "${BLUE}║   They look like: https://xxx-xxx-xxx.trycloudflare.com${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${YELLOW}⏳ Tunnels will stay active. Press Ctrl+C to stop.${NC}\n"

# Wait for all processes
wait
