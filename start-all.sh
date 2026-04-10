#!/bin/bash

# Chemins vers tes projets
LARAVEL_PATH="/Users/steeve/laravel"
REACT_PATH="/Users/steeve/react"

# 🔹 Lancer Laravel
osascript -e "tell application \"Terminal\" to do script \"cd $LARAVEL_PATH && php artisan serve\""

# 🔹 Lancer React (Vite)
osascript -e "tell application \"Terminal\" to do script \"cd $REACT_PATH && npm run dev\""

# 🔹 Lancer Reverb
osascript -e "tell application \"Terminal\" to do script \"cd $LARAVEL_PATH && php artisan reverb:start\""

# 🔹 Lancer Cloudflare tunnels
osascript -e "tell application \"Terminal\" to do script \"cloudflared tunnel --url http://localhost:8000\""
osascript -e "tell application \"Terminal\" to do script \"cloudflared tunnel --url http://localhost:5173\""
osascript -e "tell application \"Terminal\" to do script \"cloudflared tunnel --url http://localhost:9000\""

echo "✅ Laravel, React et Reverb sont lancés avec leurs tunnels Cloudflare !"