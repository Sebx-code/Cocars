import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const BACKEND_URL  = 'https://show-frequencies-nearest-wholesale.trycloudflare.com'
const REVERB_URL   = 'https://phases-bridal-bon-bargain.trycloudflare.com'

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
      'provides-appears-fonts-curves.trycloudflare.com',
    ],
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
      '/sanctum': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
      '/broadcasting': {
        target: REVERB_URL,
        changeOrigin: true,
        ws: true,           // active le proxy WebSocket
      },
    },
  },
})