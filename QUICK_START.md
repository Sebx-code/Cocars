# ⚡ Quick Start - CoCar Local Development

## 30 Seconds Setup

### Option 1: All-in-One (RECOMMENDED)

```bash
cd /Users/seb/dev/Cocars-main
./ALL-IN-ONE.sh
```

**That's it!** Everything starts automatically.

---

### Option 2: Step-by-Step (5 minutes)

Open **Terminal 1**:
```bash
cd /Users/seb/dev/Cocars-main/cocar-backend
php artisan migrate
php artisan serve
```

Open **Terminal 2**:
```bash
cd /Users/seb/dev/Cocars-main/cocar-frontend
npm run dev
```

Open **Terminal 3**:
```bash
cd /Users/seb/dev/Cocars-main/cocar-backend
php artisan reverb:start --host=127.0.0.1 --port=8080
```

Open **Terminal 4**:
```bash
cd /Users/seb/dev/Cocars-main
./cloudflare-tunnels.sh
```

---

## 🔗 Access Your App

### Local (Development)
- **Frontend**: http://localhost:5173
- **API**: http://localhost:8000/api
- **Voice Search**: http://localhost:8000/api/voice-search

### Public (via Cloudflare)
After starting tunnels, you'll see:
```
https://random-words-here.trycloudflare.com
```

**Copy these URLs and share with anyone!** 🚀

---

## 🎙️ Test Voice Search Immediately

```bash
# Test locally
./TEST-VOICE-SEARCH.sh

# Or test specific API endpoint
curl -X POST http://localhost:8000/api/voice-search \
  -H "Content-Type: application/json" \
  -d '{"query": "Douala Yaoundé demain 16h 4000"}'
```

Expected response:
```json
{
  "success": true,
  "trips_count": 2,
  "parsed_query": {
    "departure": "Douala",
    "destination": "Yaoundé",
    "date": "2026-04-11",
    "time": "16:00",
    "budget": 4000
  }
}
```

---

## 📊 What Each Terminal Does

| Terminal | Command | Runs On | Purpose |
|----------|---------|---------|---------|
| 1 | `php artisan serve` | `localhost:8000` | REST API |
| 2 | `npm run dev` | `localhost:5173` | React Frontend |
| 3 | `php artisan reverb:start` | `localhost:8080` | WebSocket |
| 4 | `./cloudflare-tunnels.sh` | `*.trycloudflare.com` | Public URLs |

---

## ✅ Verify Everything Works

```bash
# Check backend
curl http://localhost:8000/api/voice-search -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "Douala à Yaoundé"}'

# Check frontend
curl http://localhost:5173

# Check WebSocket
curl http://localhost:8080
```

All should return 200 or 404 (not connection refused) ✅

---

## 🛑 Stop Everything

```bash
# In the ALL-IN-ONE.sh terminal
Press Ctrl+C

# Or manually
killall php
killall node
killall cloudflared
```

---

## 🎯 First Test

1. Go to http://localhost:5173
2. Find where to input voice search
3. Try: "Douala Yaoundé demain"
4. See results!

---

## 📚 Full Documentation

- **Setup Guide**: `LOCAL_SETUP_GUIDE.md`
- **Voice Search Docs**: `VOICE_SEARCH_DOCUMENTATION.md`
- **API Examples**: `VOICE_SEARCH_EXAMPLES.md`
- **Implementation Details**: `IMPLEMENTATION_COMPLETE.md`

---

**Status**: ✅ Production Ready
**Last Updated**: 2026-04-10
**Created by**: Claude Opus 4.6
