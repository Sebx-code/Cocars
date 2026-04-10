import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Get URLs from environment or use defaults
const BACKEND_URL = process.env.VITE_API_URL || 'http://localhost:8000/api'
const REVERB_URL = process.env.VITE_REVERB_HOST || 'localhost:9000'
const FRONTEND_DOMAIN = process.env.VITE_APP_URL?.replace(/https?:\/\//, '') || 'localhost'

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
      'localhost',
      '127.0.0.1',
      '.trycloudflare.com', // Allow all Cloudflare Tunnel URLs
      FRONTEND_DOMAIN !== 'localhost' ? FRONTEND_DOMAIN : null, // Include custom domain if set
    ].filter(Boolean),
    proxy: {
      '/api': {
        target: BACKEND_URL.replace('/api', '') || 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path,
      },
      '/sanctum': {
        target: BACKEND_URL.replace('/api', '') || 'http://localhost:8000',
        changeOrigin: true,
      },
      '/broadcasting': {
        target: `https://${REVERB_URL}` || 'http://localhost:9000',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path,
      },
    },
  },
})

