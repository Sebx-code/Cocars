# 🚀 CoCar Local Setup + Cloudflare Guide

## Quick Start (One Command)

```bash
cd /Users/seb/dev/Cocars-main
./ALL-IN-ONE.sh
```

This will:
- ✅ Validate your environment
- ✅ Setup backend and frontend
- ✅ Start Laravel server (port 8000)
- ✅ Start Vite dev server (port 5173)
- ✅ Start Reverb WebSocket (port 8080)
- ✅ Create Cloudflare tunnels with public URLs
- ✅ Display all URLs (local + public)

---

## Manual Setup (Step by Step)

### Prerequisites

Make sure you have installed:
- PHP 8.1+ (`php --version`)
- Node.js 16+ (`node --version`)
- npm 8+ (`npm --version`)
- Cloudflare CLI (`cloudflared --version`)

If missing any:

```bash
# Install cloudflared (if not present)
brew install cloudflare/cloudflare/cloudflared
```

### Step 1: Initialize Local Setup

```bash
./local-setup.sh
```

This creates:
- `.env` files with correct paths
- Database configuration
- Frontend environment variables

### Step 2: Start Backend Services (Terminal 1)

```bash
cd cocar-backend

# Run migrations
php artisan migrate

# Optionally seed test data
php artisan db:seed --class=VoiceSearchTestTripsSeeder

# Start Laravel development server
php artisan serve
```

Server runs on: `http://localhost:8000`

### Step 3: Start Frontend (Terminal 2)

```bash
cd cocar-frontend

# Install dependencies (if needed)
npm install

# Start Vite dev server
npm run dev
```

Server runs on: `http://localhost:5173`

### Step 4: Start WebSocket Server (Terminal 3)

```bash
cd cocar-backend

# Start Reverb WebSocket server
php artisan reverb:start --host=127.0.0.1 --port=8080
```

Server runs on: `ws://localhost:8080`

### Step 5: Create Cloudflare Tunnels (Terminal 4)

Once all services are running:

```bash
./cloudflare-tunnels.sh
```

Or manually create individual tunnels:

```bash
# Terminal 4A: Backend
cloudflared tunnel --url http://localhost:8000

# Terminal 4B: Frontend
cloudflared tunnel --url http://localhost:5173

# Terminal 4C: Reverb
cloudflared tunnel --url http://localhost:8080
```

Each tunnel will output a **unique public URL** like:
```
https://example-url-1234.trycloudflare.com
```

---

## 📊 Local URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Backend API** | `http://localhost:8000/api` | REST API endpoints |
| **Frontend** | `http://localhost:5173` | React dev server |
| **WebSocket** | `ws://localhost:8080` | Real-time updates |
| **Voice Search API** | `http://localhost:8000/api/voice-search` | Speech-to-text endpoint |

---

## 🌐 Public URLs (Cloudflare Tunnels)

Once you start the `cloudflare-tunnels.sh` script, you'll get:

```
✅ Backend API:    https://xxxx-xxxx-xxxx.trycloudflare.com/api
✅ Frontend:       https://yyyy-yyyy-yyyy.trycloudflare.com
✅ Reverb WS:      https://zzzz-zzzz-zzzz.trycloudflare.com
```

These URLs are **temporary** (valid for the session) and auto-generate each time.

---

## 🎙️ Testing Voice Search

### Test locally:

```bash
./TEST-VOICE-SEARCH.sh
```

This runs 8 test cases:
1. Complete query parsing
2. Minimal query
3. With budget keyword
4. City variants
5. Time format parsing
6. Error handling
7. Alternative routes
8. Different keywords

### Test with custom API URL:

```bash
./TEST-VOICE-SEARCH.sh https://your-cloudflare-url/api
```

### Manual test with curl:

```bash
curl -X POST http://localhost:8000/api/voice-search \
  -H "Content-Type: application/json" \
  -d '{"query": "Douala Yaoundé demain 16h 4000"}'
```

---

## 🧪 Running Tests

### Unit Tests

```bash
cd cocar-backend
php artisan test tests/Unit/VoiceSearchServiceTest.php
```

### API Tests

```bash
php artisan test tests/Feature/VoiceSearchApiTest.php
```

### All Tests

```bash
php artisan test
```

---

## 🐛 Troubleshooting

### Port Already in Use

If `8000`, `5173`, or `8080` are in use:

```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Kill process on port 8080
lsof -ti:8080 | xargs kill -9
```

### Cloudflared Not Creating Tunnels

Make sure:
1. All three services are running
2. They're accessible on `localhost:XXXX`
3. Your internet connection is stable

Test connectivity:

```bash
curl http://localhost:8000
curl http://localhost:5173
curl http://localhost:8080
```

### Database Issues

Reset database:

```bash
cd cocar-backend
php artisan migrate:fresh
php artisan db:seed --class=VoiceSearchTestTripsSeeder
```

### Frontend API Connection Issues

Update `cocar-frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

Then restart Vite: Press `r` in the terminal.

---

## 📝 Configuration Files

### Backend (.env)

Location: `cocar-backend/.env`

Key variables:
```
APP_URL=http://localhost:8000
DB_HOST=127.0.0.1
DATABASE=rideshare
```

### Frontend (.env)

Location: `cocar-frontend/.env`

Key variables:
```
VITE_API_URL=http://localhost:8000/api
VITE_APP_URL=http://localhost:5173
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
```

---

## 🎯 Example Workflow

1. **Open 4 terminals**

   ```bash
   Terminal 1: cd cocar-backend && php artisan serve
   Terminal 2: cd cocar-frontend && npm run dev
   Terminal 3: cd cocar-backend && php artisan reverb:start
   Terminal 4: ./cloudflare-tunnels.sh
   ```

2. **Access locally**

   - Frontend: http://localhost:5173
   - API: http://localhost:8000/api

3. **Get public URLs**

   - Check Terminal 4 output
   - Save the `https://` URLs

4. **Test voice search**

   ```bash
   ./TEST-VOICE-SEARCH.sh
   ```

5. **Share URL with others**

   - Send them the Cloudflare URL
   - They can access without VPN!

---

## 📡 Sharing Your App

Once Cloudflare tunnels are running, share the public URL:

**Cloudflare URLs look like:**
```
https://brave-dragon-plays-singing.trycloudflare.com
```

**Anyone can access it** (no VPN needed) for the duration of the tunnel!

---

## 🛑 Stopping All Services

Press `Ctrl+C` in the terminal where ALL-IN-ONE.sh is running, or:

```bash
# Kill all processes
killall php
killall node
killall cloudflared
```

---

## 📊 Log Files

All services log to `/tmp/cocar-logs/`:

```bash
# View backend logs
tail -f /tmp/cocar-logs/backend.log

# View frontend logs
tail -f /tmp/cocar-logs/frontend.log

# View reverb logs
tail -f /tmp/cocar-logs/reverb.log

# View tunnel logs
tail -f /tmp/cocar-logs/tunnel-backend.log
```

---

## 🎓 Learning Resources

- **Voice Search Implementation**: See `VOICE_SEARCH_DOCUMENTATION.md`
- **API Examples**: See `VOICE_SEARCH_EXAMPLES.md`
- **Architecture**: See `IMPLEMENTATION_COMPLETE.md`

---

## 🚀 Production Deployment

When ready for production:

1. Stop Cloudflare tunnels (they're temporary)
2. Deploy to your server
3. Use permanent domain names
4. Configure CORS properly
5. Enable HTTPS certificates

For now, the Cloudflare URLs are perfect for **testing and development**!

---

**Created**: 2026-04-10  
**Project**: CoCar (Rideshare)  
**Backend**: Laravel/PHP  
**Frontend**: React/Vite  
**Setup**: Local + Cloudflare Tunnels
