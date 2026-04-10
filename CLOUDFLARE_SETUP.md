# 🔧 Cloudflare Tunnel URL Configuration Guide

> Centralized configuration system for Cloudflare Tunnel URLs with automatic propagation across Laravel Backend, React Frontend (Vite), and WebSocket (Reverb)

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [File Structure](#file-structure)
- [Manual Configuration](#manual-configuration)
- [Automatic Configuration](#automatic-configuration)
- [Troubleshooting](#troubleshooting)
- [Environment Variables Reference](#environment-variables-reference)

---

## Overview

This solution implements a **single source of truth** for Cloudflare Tunnel URLs. Instead of managing URLs in multiple places (backend .env, frontend .env, vite.config.ts, Laravel config files), you:

1. ✅ Update URLs **once** in `cloudflare.env`
2. ✅ Automatically propagate to all configuration files
3. ✅ No hardcoded URLs anywhere
4. ✅ Easy switching between local dev and Cloudflare production

### Benefits

- 🎯 **Single Source of Truth**: One file, all URLs managed in one place
- ⚡ **Automatic Propagation**: Changes sync across all project files
- 🔄 **Easy Environment Switching**: Switch between local dev and Cloudflare URLs instantly
- 🛡️ **No Hardcoded URLs**: All URLs are environment-driven
- 📦 **Scalable**: Works for multiple environments (dev, staging, production)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   cloudflare.env                             │
│         (Central Source of Truth)                            │
│  • CLOUDFLARE_BACKEND=https://...                           │
│  • CLOUDFLARE_FRONTEND=https://...                          │
│  • CLOUDFLARE_REVERB=https://...                            │
└────────────┬────────────────────────────────────────────────┘
             │
             ├─────────────────────────────────────────┐
             │                                         │
             ▼                                         ▼
    ┌─────────────────────────┐           ┌──────────────────────┐
    │  Backend (Laravel)      │           │ Frontend (React/Vite)│
    ├─────────────────────────┤           ├──────────────────────┤
    │ .env                    │           │ .env                 │
    │ config/cors.php         │           │ vite.config.ts       │
    │ config/broadcasting.php │           │                      │
    │ config/reverb.php       │           │                      │
    └─────────────────────────┘           └──────────────────────┘
```

---

## Quick Start

### Option 1: Automatic Setup (Recommended)

#### Using Node.js (Works everywhere)

```bash
# Install dependencies (if not already installed)
cd cocar-frontend && npm install dotenv

# Run the setup script
node setup-cloudflare-urls.js \
  https://backend.trycloudflare.com \
  https://frontend.trycloudflare.com \
  https://reverb.trycloudflare.com
```

#### Using Bash (macOS/Linux only)

```bash
# Make the script executable
chmod +x setup-cloudflare-urls.sh

# Run the setup script
./setup-cloudflare-urls.sh \
  https://backend.trycloudflare.com \
  https://frontend.trycloudflare.com \
  https://reverb.trycloudflare.com
```

#### Expected Output

```
╔════════════════════════════════════════════════════════╗
║ Cloudflare Tunnel URL Configuration                    ║
╚════════════════════════════════════════════════════════╝

ℹ Validating URLs...
✓ Backend URL: https://backend.trycloudflare.com
✓ Frontend URL: https://frontend.trycloudflare.com
✓ Reverb URL: https://reverb.trycloudflare.com

🔧 Updating Configuration Files

ℹ Creating cloudflare.env...
✓ cloudflare.env created
ℹ Updating cocar-backend/.env...
✓ cocar-backend/.env updated
ℹ Updating cocar-frontend/.env...
✓ cocar-frontend/.env updated
...

✅ Configuration Complete!
✓ All files have been updated successfully!
```

### Option 2: Manual Setup

See [Manual Configuration](#manual-configuration) section below.

---

## File Structure

After setup, your project structure will look like:

```
Cocars-main/
├── cloudflare.env                    # 🆕 Central configuration
├── setup-cloudflare-urls.sh         # 🆕 Bash setup script
├── setup-cloudflare-urls.js         # 🆕 Node.js setup script
│
├── cocar-backend/
│   ├── .env                          # ✏️ Updated automatically
│   ├── config/
│   │   ├── cors.php                 # ✏️ Updated automatically
│   │   ├── cors.php.template        # 🆕 Template reference
│   │   ├── broadcasting.php         # ✏️ Updated automatically
│   │   └── reverb.php               # ✏️ Updated automatically
│   └── ...
│
├── cocar-frontend/
│   ├── .env                          # ✏️ Updated automatically
│   ├── vite.config.ts               # ✏️ Updated automatically
│   ├── package.json                 # Requires: dotenv
│   └── ...
│
└── docs/
    └── CLOUDFLARE_SETUP.md          # 📖 This file
```

---

## Manual Configuration

If you prefer to update files manually, follow these steps:

### Step 1: Create cloudflare.env

Create a new file `cloudflare.env` in your project root:

```env
# ============================================================================
# Cloudflare Tunnel URLs Configuration
# ============================================================================
# This is the single source of truth for Cloudflare Tunnel URLs

CLOUDFLARE_BACKEND=https://show-frequencies-nearest-wholesale.trycloudflare.com
CLOUDFLARE_FRONTEND=https://provides-appears-fonts-curves.trycloudflare.com
CLOUDFLARE_REVERB=https://phases-bridal-bon-bargain.trycloudflare.com

# Extracted domains
CLOUDFLARE_BACKEND_DOMAIN=show-frequencies-nearest-wholesale.trycloudflare.com
CLOUDFLARE_FRONTEND_DOMAIN=provides-appears-fonts-curves.trycloudflare.com
CLOUDFLARE_REVERB_DOMAIN=phases-bridal-bon-bargain.trycloudflare.com
```

### Step 2: Update Backend .env

Update `cocar-backend/.env`:

```env
# Use values from cloudflare.env
APP_URL=https://show-frequencies-nearest-wholesale.trycloudflare.com

# CORS origins
ALLOWED_ORIGINS=https://provides-appears-fonts-curves.trycloudflare.com,https://phases-bridal-bon-bargain.trycloudflare.com

# Reverb WebSocket
REVERB_HOST=phases-bridal-bon-bargain.trycloudflare.com
REVERB_SCHEME=https
```

### Step 3: Update Frontend .env

Update `cocar-frontend/.env`:

```env
# API endpoint
VITE_API_URL=https://show-frequencies-nearest-wholesale.trycloudflare.com/api

# WebSocket (Reverb)
VITE_REVERB_HOST=phases-bridal-bon-bargain.trycloudflare.com
VITE_REVERB_SCHEME=https

# Frontend URL
VITE_APP_URL=https://provides-appears-fonts-curves.trycloudflare.com
```

### Step 4: Update vite.config.ts

Update `cocar-frontend/vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables from cloudflare.env
const cloudflareConfig = dotenv.config({ 
  path: path.resolve(__dirname, '../cloudflare.env') 
})

const BACKEND_URL  = cloudflareConfig.parsed?.CLOUDFLARE_BACKEND || 'https://localhost:8000'
const REVERB_URL   = cloudflareConfig.parsed?.CLOUDFLARE_REVERB || 'https://localhost:9000'
const FRONTEND_DOMAIN = cloudflareConfig.parsed?.CLOUDFLARE_FRONTEND_DOMAIN || 'localhost'

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
      FRONTEND_DOMAIN,
      'localhost',
      '127.0.0.1',
    ],
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
        rewrite: (path) => path,
      },
      '/sanctum': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
      '/broadcasting': {
        target: REVERB_URL,
        changeOrigin: true,
        ws: true,           // Enable WebSocket proxy
        rewrite: (path) => path,
      },
    },
  },
})
```

### Step 5: Update Laravel CORS Config

Update `cocar-backend/config/cors.php`:

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'broadcasting/auth'],

    'allowed_methods' => ['*'],

    'allowed_origins' => explode(',', env('ALLOWED_ORIGINS', 'http://localhost:5173')),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
```

### Step 6: Update Broadcasting Config

Update `cocar-backend/config/broadcasting.php`:

```php
'reverb' => [
    'driver' => 'reverb',
    'key' => env('REVERB_APP_KEY'),
    'secret' => env('REVERB_APP_SECRET'),
    'app_id' => env('REVERB_APP_ID'),
    'options' => [
        'host' => env('REVERB_HOST'),
        'port' => env('REVERB_PORT', 443),
        'scheme' => env('REVERB_SCHEME', 'https'),
        'useTLS' => env('REVERB_SCHEME', 'https') === 'https',
    ],
    'client_options' => [],
],
```

### Step 7: Update Reverb Config

Update `cocar-backend/config/reverb.php`:

```php
'servers' => [
    'reverb' => [
        'host' => env('REVERB_SERVER_HOST', '0.0.0.0'),
        'port' => env('REVERB_SERVER_PORT', 9000),
        'path' => env('REVERB_SERVER_PATH', ''),
        'hostname' => env('REVERB_HOST'),
        // ... rest of config
    ],
],
```

---

## Automatic Configuration

### Running the Setup Scripts

Both scripts (Bash and Node.js) perform the same operations:

1. ✓ Validate input URLs
2. ✓ Create `cloudflare.env`
3. ✓ Update `cocar-backend/.env`
4. ✓ Update `cocar-frontend/.env`
5. ✓ Update `cocar-frontend/vite.config.ts`
6. ✓ Update `cocar-backend/config/cors.php`
7. ✓ Update `cocar-backend/config/broadcasting.php`
8. ✓ Update `cocar-backend/config/reverb.php`

### What Gets Updated

```
cocar-backend/.env
├── APP_URL
├── ALLOWED_ORIGINS
├── REVERB_HOST
└── REVERB_SCHEME

cocar-frontend/.env
├── VITE_API_URL
├── VITE_REVERB_HOST
├── VITE_REVERB_SCHEME
└── VITE_APP_URL

cocar-frontend/vite.config.ts
├── BACKEND_URL (from cloudflare.env)
├── REVERB_URL (from cloudflare.env)
├── FRONTEND_DOMAIN (from cloudflare.env)
└── proxy configuration

Laravel Config Files
├── config/cors.php (ALLOWED_ORIGINS)
├── config/broadcasting.php (REVERB_HOST)
└── config/reverb.php (hostname)
```

---

## Troubleshooting

### Issue: Script not found

**Solution:**

```bash
# Make sure you're in the project root
cd /path/to/Cocars-main

# For Node.js script
node setup-cloudflare-urls.js ...

# For Bash script (make it executable first)
chmod +x setup-cloudflare-urls.sh
./setup-cloudflare-urls.sh ...
```

### Issue: Invalid URL format

**Solution:** Make sure URLs include the protocol:

```bash
# ✗ Wrong
./setup-cloudflare-urls.sh \
  show-frequencies-nearest-wholesale.trycloudflare.com \
  ...

# ✓ Correct
./setup-cloudflare-urls.sh \
  https://show-frequencies-nearest-wholesale.trycloudflare.com \
  ...
```

### Issue: CORS errors in browser

**Solution:**

1. Check `cocar-backend/.env` has correct `ALLOWED_ORIGINS`
2. Verify frontend URL matches exactly (including protocol and domain)
3. Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
4. Restart Laravel backend: `php artisan serve`

### Issue: WebSocket connection fails

**Solution:**

1. Check `VITE_REVERB_HOST` in `cocar-frontend/.env`
2. Verify Reverb is running: `php artisan reverb:start`
3. Check `REVERB_HOST` in `cocar-backend/.env`
4. Test WebSocket connection in browser DevTools Console:
   ```javascript
   console.log('Connecting to:', window.location.hostname)
   ```

### Issue: Frontend can't reach backend API

**Solution:**

1. Verify `VITE_API_URL` in `cocar-frontend/.env`
2. Check vite.config.ts proxy configuration
3. Ensure backend is running on correct URL
4. Check browser Network tab for actual request URL
5. Verify CORS headers: `Access-Control-Allow-Origin`

### Issue: Changes not applied after running script

**Solution:**

```bash
# Clear Node cache
npm cache clean --force

# Rebuild frontend
cd cocar-frontend
npm run build

# Restart development servers
# Backend
php artisan serve

# Frontend
npm run dev

# Reverb
php artisan reverb:start
```

---

## Environment Variables Reference

### cloudflare.env

| Variable | Description | Example |
|----------|-------------|---------|
| `CLOUDFLARE_BACKEND` | Backend API URL | `https://backend.trycloudflare.com` |
| `CLOUDFLARE_FRONTEND` | Frontend URL for CORS | `https://frontend.trycloudflare.com` |
| `CLOUDFLARE_REVERB` | WebSocket (Reverb) URL | `https://reverb.trycloudflare.com` |
| `CLOUDFLARE_BACKEND_DOMAIN` | Extracted backend domain | `backend.trycloudflare.com` |
| `CLOUDFLARE_FRONTEND_DOMAIN` | Extracted frontend domain | `frontend.trycloudflare.com` |
| `CLOUDFLARE_REVERB_DOMAIN` | Extracted Reverb domain | `reverb.trycloudflare.com` |

### Backend .env

| Variable | Source | Used For |
|----------|--------|----------|
| `APP_URL` | `CLOUDFLARE_BACKEND` | Application base URL |
| `ALLOWED_ORIGINS` | `CLOUDFLARE_FRONTEND`, `CLOUDFLARE_REVERB` | CORS whitelist |
| `REVERB_HOST` | `CLOUDFLARE_REVERB_DOMAIN` | WebSocket hostname |
| `REVERB_SCHEME` | Fixed | WebSocket scheme (`https`) |

### Frontend .env

| Variable | Source | Used For |
|----------|--------|----------|
| `VITE_API_URL` | `CLOUDFLARE_BACKEND` | API requests |
| `VITE_REVERB_HOST` | `CLOUDFLARE_REVERB_DOMAIN` | WebSocket connection |
| `VITE_REVERB_SCHEME` | Fixed | WebSocket scheme (`https`) |
| `VITE_APP_URL` | `CLOUDFLARE_FRONTEND` | Frontend base URL |

---

## Best Practices

### ✅ Do's

- ✓ Update `cloudflare.env` once for all configurations
- ✓ Run the setup script after getting new Cloudflare URLs
- ✓ Commit `cloudflare.env.example` (without actual URLs) to version control
- ✓ Keep sensitive URLs in `.gitignore`
- ✓ Use environment variables everywhere possible

### ❌ Don'ts

- ✗ Don't hardcode URLs in code
- ✗ Don't manually edit multiple .env files
- ✗ Don't forget to run setup script after Cloudflare tunnel restarts
- ✗ Don't commit actual `cloudflare.env` to version control
- ✗ Don't use different URLs in different files

---

## Integration with CI/CD

For automated deployments, add this to your CI/CD pipeline:

```yaml
# Example: GitHub Actions
- name: Configure Cloudflare URLs
  run: |
    node setup-cloudflare-urls.js \
      ${{ secrets.CLOUDFLARE_BACKEND }} \
      ${{ secrets.CLOUDFLARE_FRONTEND }} \
      ${{ secrets.CLOUDFLARE_REVERB }}
```

---

## Switching Between Environments

### Local Development

```bash
# Use local URLs
./setup-cloudflare-urls.sh \
  http://localhost:8000 \
  http://localhost:5173 \
  http://localhost:9000
```

### Cloudflare Production

```bash
# Use Cloudflare URLs
./setup-cloudflare-urls.sh \
  https://api.myapp.com \
  https://app.myapp.com \
  https://ws.myapp.com
```

### Staging

```bash
# Use staging URLs
./setup-cloudflare-urls.sh \
  https://api-staging.myapp.com \
  https://staging.myapp.com \
  https://ws-staging.myapp.com
```

---

## Support & Issues

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [Environment Variables Reference](#environment-variables-reference)
3. Verify all URLs are in correct format
4. Check that all services are running

---

## License

This configuration system is part of the Cocars project.

---

**Last Updated:** April 2026  
**Version:** 1.0.0
