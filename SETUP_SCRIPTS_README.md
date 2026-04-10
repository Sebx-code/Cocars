# 🚀 Cloudflare Tunnel URL Configuration Scripts

> Automated setup for Cloudflare Tunnel URLs across Laravel Backend, React Frontend, and Reverb WebSocket

## 📦 What's Included

- ✅ `setup-cloudflare-urls.sh` - Bash script for macOS/Linux
- ✅ `setup-cloudflare-urls.js` - Node.js script (cross-platform)
- ✅ `cloudflare.env.example` - Template for central configuration
- ✅ Comprehensive documentation in `CLOUDFLARE_SETUP.md`

## ⚡ Quick Start (30 seconds)

### Using Node.js (Recommended - Works Everywhere)

```bash
node setup-cloudflare-urls.js \
  https://backend.trycloudflare.com \
  https://frontend.trycloudflare.com \
  https://reverb.trycloudflare.com
```

### Using Bash (macOS/Linux)

```bash
chmod +x setup-cloudflare-urls.sh

./setup-cloudflare-urls.sh \
  https://backend.trycloudflare.com \
  https://frontend.trycloudflare.com \
  https://reverb.trycloudflare.com
```

## 📋 What Gets Updated

Automatically updates all configuration files:

```
✓ cloudflare.env                          (Central config)
✓ cocar-backend/.env                      (App URL, CORS, Reverb)
✓ cocar-frontend/.env                     (API URL, WebSocket)
✓ cocar-frontend/vite.config.ts          (Proxies)
✓ cocar-backend/config/cors.php          (Allowed origins)
✓ cocar-backend/config/broadcasting.php  (Reverb config)
✓ cocar-backend/config/reverb.php        (WebSocket config)
```

## 🎯 Key Features

### Single Source of Truth
- All URLs managed in one file: `cloudflare.env`
- Update once, sync everywhere

### Automatic Propagation
- Changes automatically propagate to all configuration files
- No manual file editing needed

### Zero Hardcoded URLs
- All URLs are environment-driven
- Easy environment switching (dev → staging → production)

### Smart URL Parsing
- Automatically extracts domains from full URLs
- Validates URL format before updating

### Cross-Platform Support
- Bash script for macOS/Linux
- Node.js script works everywhere (even Windows with WSL)

## 📚 Full Documentation

See `CLOUDFLARE_SETUP.md` for comprehensive guide including:

- Architecture overview
- Manual configuration steps
- Troubleshooting guide
- Environment variables reference
- CI/CD integration
- Best practices

## 🔧 Usage Examples

### Example 1: Initial Setup

```bash
# After starting Cloudflare Tunnel, you get these URLs:
# - Backend:  https://show-frequencies-nearest-wholesale.trycloudflare.com
# - Frontend: https://provides-appears-fonts-curves.trycloudflare.com
# - Reverb:   https://phases-bridal-bon-bargain.trycloudflare.com

node setup-cloudflare-urls.js \
  https://show-frequencies-nearest-wholesale.trycloudflare.com \
  https://provides-appears-fonts-curves.trycloudflare.com \
  https://phases-bridal-bon-bargain.trycloudflare.com
```

### Example 2: URL Changed (Tunnel Restart)

```bash
# Cloudflare Tunnel URLs change on restart
# Just run the script again with new URLs

node setup-cloudflare-urls.js \
  https://new-backend-url.trycloudflare.com \
  https://new-frontend-url.trycloudflare.com \
  https://new-reverb-url.trycloudflare.com
```

### Example 3: Local Development

```bash
# Switch to local development URLs

node setup-cloudflare-urls.js \
  http://localhost:8000 \
  http://localhost:5173 \
  http://localhost:9000
```

### Example 4: Multiple Environments

```bash
# Production
node setup-cloudflare-urls.js \
  https://api.myapp.com \
  https://app.myapp.com \
  https://ws.myapp.com

# Staging
node setup-cloudflare-urls.js \
  https://api-staging.myapp.com \
  https://staging.myapp.com \
  https://ws-staging.myapp.com
```

## 🔍 What Each Script Does

Both scripts perform identical operations:

1. ✓ Validate input URLs
2. ✓ Create/update `cloudflare.env`
3. ✓ Update backend `.env` file
4. ✓ Update frontend `.env` file
5. ✓ Update `vite.config.ts` with dynamic imports
6. ✓ Update Laravel config files (CORS, Broadcasting, Reverb)
7. ✓ Display summary of changes

## 🐛 Troubleshooting

### URLs not updating?

```bash
# Make sure you're in the project root
cd /path/to/Cocars-main

# Check cloudflare.env was created
cat cloudflare.env

# Rebuild frontend and restart servers
cd cocar-frontend && npm run build
npm run dev
```

### CORS errors?

```bash
# Verify ALLOWED_ORIGINS in backend
grep ALLOWED_ORIGINS cocar-backend/.env

# Should match frontend URL exactly
# including protocol and domain
```

### WebSocket not connecting?

```bash
# Check Reverb is running
php artisan reverb:start

# Verify REVERB_HOST in both:
grep REVERB_HOST cocar-backend/.env
grep VITE_REVERB_HOST cocar-frontend/.env
```

## 🔗 Integration Examples

### GitHub Actions

```yaml
- name: Configure Cloudflare URLs
  run: |
    node setup-cloudflare-urls.js \
      ${{ secrets.CLOUDFLARE_BACKEND }} \
      ${{ secrets.CLOUDFLARE_FRONTEND }} \
      ${{ secrets.CLOUDFLARE_REVERB }}
```

### Docker Compose

```yaml
services:
  setup:
    image: node:18
    working_dir: /app
    volumes:
      - ./:/app
    command: |
      sh -c "
        node setup-cloudflare-urls.js \
          ${CLOUDFLARE_BACKEND} \
          ${CLOUDFLARE_FRONTEND} \
          ${CLOUDFLARE_REVERB}
      "
```

## 📦 File Locations

| File | Purpose |
|------|---------|
| `setup-cloudflare-urls.sh` | Bash setup script |
| `setup-cloudflare-urls.js` | Node.js setup script |
| `cloudflare.env` | Central configuration (auto-generated) |
| `cloudflare.env.example` | Template file (commit to git) |
| `CLOUDFLARE_SETUP.md` | Full documentation |

## ✅ Pre-requisites

### For Node.js Script
- Node.js 14+ (already installed if you have npm)
- No additional dependencies (uses built-in Node modules)

### For Bash Script
- macOS or Linux
- Bash shell (usually pre-installed)

## 📄 What to Commit to Git

```bash
# Add to your .gitignore
echo "cloudflare.env" >> .gitignore
echo "cocar-backend/.env" >> .gitignore
echo "cocar-frontend/.env" >> .gitignore

# Commit these files instead
git add cloudflare.env.example
git add CLOUDFLARE_SETUP.md
git add setup-cloudflare-urls.sh
git add setup-cloudflare-urls.js
git add cocar-backend/config/cors.php.template
git commit -m "Add Cloudflare URL configuration system"
```

## 🚀 Next Steps

1. **Setup URLs:**
   ```bash
   node setup-cloudflare-urls.js <backend_url> <frontend_url> <reverb_url>
   ```

2. **Install dependencies:**
   ```bash
   cd cocar-frontend && npm install
   ```

3. **Start services:**
   ```bash
   # Terminal 1: Backend
   cd cocar-backend && php artisan serve

   # Terminal 2: Frontend
   cd cocar-frontend && npm run dev

   # Terminal 3: Reverb
   cd cocar-backend && php artisan reverb:start
   ```

4. **Verify setup:**
   - Backend: http://localhost:8000
   - Frontend: http://localhost:5173
   - Reverb: ws://localhost:9000 (or wss:// for Cloudflare)

## 📖 Documentation

See `CLOUDFLARE_SETUP.md` for:
- Complete architecture overview
- Manual configuration guide
- Troubleshooting section
- Environment variables reference
- Best practices
- CI/CD integration examples

## 🎯 Key Concepts

### Single Source of Truth
All URLs come from `cloudflare.env`. Other files reference it.

### No Hardcoding
No URL is hardcoded anywhere in the project.

### Environment Flexibility
Easily switch between local dev, staging, and production.

### Automatic Sync
Run the script once, everything updates automatically.

## 💡 Tips

- **Keep URLs consistent**: Use the script every time URLs change
- **Test after update**: Verify all services work after running script
- **Document changes**: Commit when scripts are updated
- **Use with CI/CD**: Automate URL configuration in pipelines

## 🤝 Support

For issues or questions:

1. Check `CLOUDFLARE_SETUP.md` Troubleshooting section
2. Verify URLs are in correct format (with https://)
3. Ensure all services are running
4. Check logs for specific error messages

---

**Version:** 1.0.0  
**Last Updated:** April 2026  
**Status:** Production Ready ✅
