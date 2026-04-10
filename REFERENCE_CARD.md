# 🔗 Cloudflare Tunnel Configuration - Reference Card

**Quick Reference for Developers**

---

## ⚡ One-Liner Setup

```bash
node setup-cloudflare-urls.js https://backend.cf.com https://frontend.cf.com https://reverb.cf.com
```

---

## 📍 Where to Start

| Scenario | Document | Time |
|----------|----------|------|
| I just want to set it up | [QUICK_START.md](./QUICK_START.md) | 2 min |
| I want to understand it | [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | 5 min |
| I need troubleshooting | [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md) | 5 min |
| I need everything | [INDEX.md](./INDEX.md) | 30 min |

---

## 🔄 URLs Changed? (Tunnel Restarted)

```bash
node setup-cloudflare-urls.js <new_backend> <new_frontend> <new_reverb>
```

Done! Everything updates automatically.

---

## 🌍 Switch Environments

```bash
# Local Development
node setup-cloudflare-urls.js http://localhost:8000 http://localhost:5173 http://localhost:9000

# Cloudflare Production
node setup-cloudflare-urls.js https://api.example.com https://app.example.com https://ws.example.com
```

---

## 📋 Files Updated

| File | What Changes |
|------|--------------|
| `cloudflare.env` | Central configuration (auto-created) |
| `cocar-backend/.env` | APP_URL, ALLOWED_ORIGINS, REVERB_HOST |
| `cocar-frontend/.env` | VITE_API_URL, VITE_REVERB_HOST |
| `cocar-frontend/vite.config.ts` | Loads cloudflare.env, configures proxies |
| `config/cors.php` | CORS whitelist |
| `config/broadcasting.php` | Reverb config |
| `config/reverb.php` | WebSocket server config |

---

## ✅ Verification Checklist

```bash
# 1. Check cloudflare.env
test -f cloudflare.env && echo "✓ cloudflare.env exists"

# 2. Check backend updated
grep ALLOWED_ORIGINS cocar-backend/.env && echo "✓ Backend OK"

# 3. Check frontend updated
grep VITE_API_URL cocar-frontend/.env && echo "✓ Frontend OK"

# 4. Check vite config
grep dotenv.config cocar-frontend/vite.config.ts && echo "✓ Vite OK"

# 5. View configured URLs
grep CLOUDFLARE cloudflare.env
```

---

## 🐛 Quick Fixes

| Problem | Fix |
|---------|-----|
| CORS errors | `cd cocar-backend && php artisan serve` |
| WebSocket fails | `cd cocar-backend && php artisan reverb:start` |
| API calls fail | Check `VITE_API_URL` in `.env` |
| Script not found | Make sure you're in project root |

---

## 📂 File Structure

```
Cocars-main/
├── setup-cloudflare-urls.js          ← Main script
├── setup-cloudflare-urls.sh          ← Alternative script
├── cloudflare.env                    ← Auto-generated (don't commit)
├── cloudflare.env.example            ← Template (commit this)
├── QUICK_START.md                    ← Start here
├── INDEX.md
├── SETUP_SCRIPTS_README.md
├── CLOUDFLARE_SETUP.md
├── IMPLEMENTATION_SUMMARY.md
├── cocar-backend/
│   ├── .env                          ← Updated by script
│   └── config/
│       ├── cors.php                  ← Updated by script
│       ├── cors.php.template         ← Reference
│       ├── broadcasting.php          ← Updated by script
│       └── reverb.php                ← Updated by script
└── cocar-frontend/
    ├── .env                          ← Updated by script
    └── vite.config.ts               ← Updated by script
```

---

## 🎯 Scripts Available

### Node.js (Recommended)
```bash
node setup-cloudflare-urls.js <backend_url> <frontend_url> <reverb_url>
```

### Bash (macOS/Linux)
```bash
chmod +x setup-cloudflare-urls.sh
./setup-cloudflare-urls.sh <backend_url> <frontend_url> <reverb_url>
```

---

## 🌐 URL Format

Always include protocol:

```bash
# ✓ Correct
https://backend.trycloudflare.com
https://frontend.trycloudflare.com
https://reverb.trycloudflare.com

# ✗ Wrong
backend.trycloudflare.com
https://backend.trycloudflare.com/
backend.cf.com (incomplete)
```

---

## 🚀 Typical Workflow

### First Time
1. Get 3 Cloudflare URLs
2. Run `node setup-cloudflare-urls.js <urls>`
3. `npm install`
4. Start services
5. Done!

### After Tunnel Restart
1. Get new Cloudflare URLs
2. Run `node setup-cloudflare-urls.js <new_urls>`
3. Done! Everything updated

---

## 💾 Git Best Practices

```bash
# DO commit these
git add setup-cloudflare-urls.js
git add setup-cloudflare-urls.sh
git add cloudflare.env.example
git add cocar-backend/config/cors.php.template
git add *.md

# DON'T commit these
echo "cloudflare.env" >> .gitignore
# cocar-backend/.env is already ignored
# cocar-frontend/.env is already ignored
```

---

## 📊 Architecture

```
User Runs Script
        ↓
  Validates URLs
        ↓
  Creates cloudflare.env
        ↓
  Updates ALL files:
  ├─ cocar-backend/.env
  ├─ cocar-frontend/.env
  ├─ cocar-frontend/vite.config.ts
  ├─ config/cors.php
  ├─ config/broadcasting.php
  └─ config/reverb.php
        ↓
  Displays Summary
```

---

## ❓ Common Questions

**Q: Do I need to run the script every time?**
A: Only when URLs change (Cloudflare restart) or you switch environments.

**Q: Can I manually edit files?**
A: You can, but it's better to use the script for consistency.

**Q: What if I make a mistake?**
A: Just run the script again with correct URLs.

**Q: Do I commit cloudflare.env?**
A: No, commit `cloudflare.env.example` instead. Add `cloudflare.env` to `.gitignore`.

**Q: How do I switch to production?**
A: `node setup-cloudflare-urls.js <prod_urls>`

---

## 🔗 Quick Links

- **Setup Guide:** [QUICK_START.md](./QUICK_START.md)
- **Full Manual:** [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md)
- **Navigation:** [INDEX.md](./INDEX.md)
- **Architecture:** [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

## 📞 Getting Help

1. Check this card first
2. Read [QUICK_START.md](./QUICK_START.md)
3. See [INDEX.md](./INDEX.md) for full guide
4. Consult [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md) troubleshooting

---

**Last Updated:** April 9, 2026 | **Version:** 1.0.0 | **Status:** ✅ Production Ready
