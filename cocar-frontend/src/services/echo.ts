import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

// Make Pusher available globally for Echo
declare global {
  interface Window {
    Pusher: typeof Pusher
    Echo: Echo
  }
}

window.Pusher = Pusher

let echoInstance: Echo | null = null

export const initEcho = (token: string): Echo => {
  if (echoInstance) {
    return echoInstance
  }

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'cocar-app-key',
    wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${import.meta.env.VITE_API_URL?.replace('/api', '')}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  })

  window.Echo = echoInstance
  
  return echoInstance
}

export const getEcho = (): Echo | null => {
  return echoInstance
}

export const disconnectEcho = (): void => {
  if (echoInstance) {
    echoInstance.disconnect()
    echoInstance = null
  }
}

export default {
  initEcho,
  getEcho,
  disconnectEcho,
}
