#!/usr/bin/env node

/**
 * ============================================================================
 * Cloudflare Tunnel URL Auto-Configuration Script (Node.js)
 * ============================================================================
 * 
 * Automatically detects and configures Cloudflare Tunnel URLs across the
 * entire project (Backend, Frontend, Reverb WebSocket)
 * 
 * Usage:
 *   node setup-cloudflare-urls.js <backend_url> <frontend_url> <reverb_url>
 *   node setup-cloudflare-urls.js https://backend.trycloudflare.com https://frontend.trycloudflare.com https://reverb.trycloudflare.com
 * 
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const PROJECT_ROOT = __dirname;
const FILES_TO_UPDATE = {
  cloudflareEnv: path.join(PROJECT_ROOT, 'cloudflare.env'),
  backendEnv: path.join(PROJECT_ROOT, 'cocar-backend', '.env'),
  frontendEnv: path.join(PROJECT_ROOT, 'cocar-frontend', '.env'),
  viteConfig: path.join(PROJECT_ROOT, 'cocar-frontend', 'vite.config.ts'),
  corsConfig: path.join(PROJECT_ROOT, 'cocar-backend', 'config', 'cors.php'),
  broadcastingConfig: path.join(PROJECT_ROOT, 'cocar-backend', 'config', 'broadcasting.php'),
  reverbConfig: path.join(PROJECT_ROOT, 'cocar-backend', 'config', 'reverb.php'),
};

// ============================================================================
// Color Output
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  header: (msg) => console.log(`${colors.blue}╔════════════════════════════════════════════════════════╗${colors.reset}\n${colors.blue}║ ${msg}${colors.reset}\n${colors.blue}╚════════════════════════════════════════════════════════╝${colors.reset}\n`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.error(`${colors.red}✗ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.blue}─────────────────────────────────────────────────────────${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.blue}─────────────────────────────────────────────────────────${colors.reset}\n`),
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Validate URL format
 */
function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return url;
  }
}

/**
 * Read file safely
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    return '';
  }
}

/**
 * Write file safely
 */
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (e) {
    log.error(`Failed to write file ${filePath}: ${e.message}`);
    return false;
  }
}

/**
 * Update or create env variable in .env file
 */
function updateEnvVar(content, key, value) {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  
  if (regex.test(content)) {
    return content.replace(regex, `${key}=${value}`);
  } else {
    return content.trimRight() + '\n' + `${key}=${value}` + '\n';
  }
}

/**
 * Update PHP array value in config file
 */
function updatePhpArrayValue(content, key, value, withQuotes = true) {
  const escapedValue = withQuotes ? `'${value.replace(/'/g, "\\'")}'` : value;
  const regex = new RegExp(`(['"]${key}['"]\\s*=>\\s*)([^,]+)`, 'g');
  return content.replace(regex, `$1 ${escapedValue}`);
}

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Create central cloudflare.env file
 */
function createCloudflareEnv(backendUrl, frontendUrl, reverbUrl) {
  log.info('Creating cloudflare.env...');
  
  const content = `# ============================================================================
# Cloudflare Tunnel URLs Configuration
# ============================================================================
# This is the single source of truth for Cloudflare Tunnel URLs
# All other .env files and configurations derive from this
#
# Generated: ${new Date().toISOString()}
# ============================================================================

# Backend API URL
CLOUDFLARE_BACKEND=${backendUrl}

# Frontend URL (for CORS)
CLOUDFLARE_FRONTEND=${frontendUrl}

# WebSocket (Reverb) URL
CLOUDFLARE_REVERB=${reverbUrl}

# Extracted domains for convenience
CLOUDFLARE_BACKEND_DOMAIN=${extractDomain(backendUrl)}
CLOUDFLARE_FRONTEND_DOMAIN=${extractDomain(frontendUrl)}
CLOUDFLARE_REVERB_DOMAIN=${extractDomain(reverbUrl)}
`;

  if (writeFile(FILES_TO_UPDATE.cloudflareEnv, content)) {
    log.success('cloudflare.env created');
    return true;
  }
  return false;
}

/**
 * Update Backend .env
 */
function updateBackendEnv(backendUrl, frontendUrl, reverbUrl) {
  log.info('Updating cocar-backend/.env...');
  
  let content = readFile(FILES_TO_UPDATE.backendEnv);
  
  // Update APP_URL
  content = updateEnvVar(content, 'APP_URL', backendUrl);
  
  // Update ALLOWED_ORIGINS
  content = updateEnvVar(content, 'ALLOWED_ORIGINS', `${frontendUrl},${reverbUrl}`);
  
  // Update Reverb configuration
  content = updateEnvVar(content, 'REVERB_HOST', extractDomain(reverbUrl));
  content = updateEnvVar(content, 'REVERB_SCHEME', 'https');
  
  if (writeFile(FILES_TO_UPDATE.backendEnv, content)) {
    log.success('cocar-backend/.env updated');
    return true;
  }
  return false;
}

/**
 * Update Frontend .env
 */
function updateFrontendEnv(backendUrl, reverbUrl, frontendUrl) {
  log.info('Updating cocar-frontend/.env...');
  
  let content = readFile(FILES_TO_UPDATE.frontendEnv);
  
  // Update VITE_API_URL
  content = updateEnvVar(content, 'VITE_API_URL', `${backendUrl}/api`);
  
  // Update VITE_REVERB_HOST
  content = updateEnvVar(content, 'VITE_REVERB_HOST', extractDomain(reverbUrl));
  
  // Update VITE_REVERB_SCHEME
  content = updateEnvVar(content, 'VITE_REVERB_SCHEME', 'https');
  
  // Update VITE_APP_URL
  content = updateEnvVar(content, 'VITE_APP_URL', frontendUrl);
  
  if (writeFile(FILES_TO_UPDATE.frontendEnv, content)) {
    log.success('cocar-frontend/.env updated');
    return true;
  }
  return false;
}

/**
 * Update vite.config.ts
 */
function updateViteConfig(backendUrl, reverbUrl, frontendUrl) {
  log.info('Updating cocar-frontend/vite.config.ts...');
  
  const frontendDomain = extractDomain(frontendUrl);
  
  const content = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables from cloudflare.env
const cloudflareConfig = dotenv.config({ path: path.resolve(__dirname, '../cloudflare.env') })
const BACKEND_URL  = cloudflareConfig.parsed?.CLOUDFLARE_BACKEND || '${backendUrl}'
const REVERB_URL   = cloudflareConfig.parsed?.CLOUDFLARE_REVERB || '${reverbUrl}'
const FRONTEND_DOMAIN = '${frontendDomain}'

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
`;

  if (writeFile(FILES_TO_UPDATE.viteConfig, content)) {
    log.success('cocar-frontend/vite.config.ts updated');
    return true;
  }
  return false;
}

/**
 * Update Laravel CORS config
 */
function updateCorsConfig(frontendUrl, reverbUrl) {
  log.info('Updating cocar-backend/config/cors.php...');
  
  let content = readFile(FILES_TO_UPDATE.corsConfig);
  
  // Update allowed_origins array
  const frontendDomain = extractDomain(frontendUrl);
  const reverbDomain = extractDomain(reverbUrl);
  
  // Find and replace the allowed_origins line
  const corsPattern = /['"]allowed_origins['"][^=]*=>\s*explode\([^)]+\)/;
  if (corsPattern.test(content)) {
    const newAllowedOrigins = `'allowed_origins' => explode(',', env('ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:3000,${frontendUrl},${reverbUrl}'))`;
    content = content.replace(corsPattern, newAllowedOrigins);
  }
  
  if (writeFile(FILES_TO_UPDATE.corsConfig, content)) {
    log.success('cocar-backend/config/cors.php updated');
    return true;
  }
  return false;
}

/**
 * Update Broadcasting config
 */
function updateBroadcastingConfig(reverbUrl) {
  log.info('Updating cocar-backend/config/broadcasting.php...');
  
  let content = readFile(FILES_TO_UPDATE.broadcastingConfig);
  const reverbDomain = extractDomain(reverbUrl);
  
  // Update reverb host configuration
  const hostPattern = /'host'\s*=>\s*env\('REVERB_HOST'[^)]*\)/;
  if (hostPattern.test(content)) {
    content = content.replace(hostPattern, `'host' => env('REVERB_HOST', '${reverbDomain}')`);
  }
  
  if (writeFile(FILES_TO_UPDATE.broadcastingConfig, content)) {
    log.success('cocar-backend/config/broadcasting.php updated');
    return true;
  }
  return false;
}

/**
 * Update Reverb config
 */
function updateReverbConfig(reverbUrl) {
  log.info('Updating cocar-backend/config/reverb.php...');
  
  let content = readFile(FILES_TO_UPDATE.reverbConfig);
  const reverbDomain = extractDomain(reverbUrl);
  
  // Update hostname in servers config
  const hostnamePattern = /'hostname'\s*=>\s*env\('REVERB_HOST'[^)]*\)/;
  if (hostnamePattern.test(content)) {
    content = content.replace(hostnamePattern, `'hostname' => env('REVERB_HOST', '${reverbDomain}')`);
  }
  
  if (writeFile(FILES_TO_UPDATE.reverbConfig, content)) {
    log.success('cocar-backend/config/reverb.php updated');
    return true;
  }
  return false;
}

/**
 * Display summary
 */
function displaySummary(backendUrl, frontendUrl, reverbUrl) {
  log.section('📋 Configuration Summary');
  
  console.log(`${colors.cyan}Central Configuration:${colors.reset}`);
  console.log(`  📄 cloudflare.env\n`);
  
  console.log(`${colors.cyan}Backend Configuration:${colors.reset}`);
  console.log(`  📝 cocar-backend/.env`);
  console.log(`     • APP_URL: ${backendUrl}`);
  console.log(`     • ALLOWED_ORIGINS: ${frontendUrl}, ${reverbUrl}`);
  console.log(`     • REVERB_HOST: ${extractDomain(reverbUrl)}\n`);
  
  console.log(`${colors.cyan}Frontend Configuration:${colors.reset}`);
  console.log(`  📝 cocar-frontend/.env`);
  console.log(`     • VITE_API_URL: ${backendUrl}/api`);
  console.log(`     • VITE_REVERB_HOST: ${extractDomain(reverbUrl)}`);
  console.log(`     • VITE_APP_URL: ${frontendUrl}\n`);
  
  console.log(`${colors.cyan}Vite Configuration:${colors.reset}`);
  console.log(`  ⚙️  cocar-frontend/vite.config.ts`);
  console.log(`     • Backend proxy: ${backendUrl}`);
  console.log(`     • WebSocket proxy: ${reverbUrl}\n`);
  
  console.log(`${colors.cyan}Laravel Configs:${colors.reset}`);
  console.log(`  ⚙️  cocar-backend/config/cors.php`);
  console.log(`  ⚙️  cocar-backend/config/broadcasting.php`);
  console.log(`  ⚙️  cocar-backend/config/reverb.php\n`);
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  log.header('Cloudflare Tunnel URL Configuration');
  
  // Get arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    log.error('Missing arguments!');
    console.log(`\nUsage: node ${path.basename(__filename)} <backend_url> <frontend_url> <reverb_url>\n`);
    console.log('Example:');
    console.log('  node setup-cloudflare-urls.js \\');
    console.log('    https://backend.trycloudflare.com \\');
    console.log('    https://frontend.trycloudflare.com \\');
    console.log('    https://reverb.trycloudflare.com\n');
    process.exit(1);
  }
  
  const [backendUrl, frontendUrl, reverbUrl] = args;
  
  // Validate URLs
  log.info('Validating URLs...');
  
  if (!validateUrl(backendUrl)) {
    log.error(`Invalid backend URL: ${backendUrl}`);
    process.exit(1);
  }
  log.success(`Backend URL: ${backendUrl}`);
  
  if (!validateUrl(frontendUrl)) {
    log.error(`Invalid frontend URL: ${frontendUrl}`);
    process.exit(1);
  }
  log.success(`Frontend URL: ${frontendUrl}`);
  
  if (!validateUrl(reverbUrl)) {
    log.error(`Invalid Reverb URL: ${reverbUrl}`);
    process.exit(1);
  }
  log.success(`Reverb URL: ${reverbUrl}`);
  
  log.section('🔧 Updating Configuration Files');
  
  try {
    // Create/Update files
    createCloudflareEnv(backendUrl, frontendUrl, reverbUrl);
    updateBackendEnv(backendUrl, frontendUrl, reverbUrl);
    updateFrontendEnv(backendUrl, reverbUrl, frontendUrl);
    updateViteConfig(backendUrl, reverbUrl, frontendUrl);
    updateCorsConfig(frontendUrl, reverbUrl);
    updateBroadcastingConfig(reverbUrl);
    updateReverbConfig(reverbUrl);
    
    // Display summary
    displaySummary(backendUrl, frontendUrl, reverbUrl);
    
    log.header('✅ Configuration Complete!');
    log.success('All files have been updated successfully!');
    log.warning('Make sure to rebuild your frontend and restart your backend services');
    
    console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
    console.log('  1. Backend:  cd cocar-backend && php artisan serve');
    console.log('  2. Frontend: cd cocar-frontend && npm run dev');
    console.log('  3. Reverb:   cd cocar-backend && php artisan reverb:start\n');
    
  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

main().catch(err => {
  log.error(err.message);
  process.exit(1);
});
