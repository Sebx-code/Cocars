declare module 'laravel-echo' {
  export interface EchoOptions {
    broadcaster: string
    key: string
    wsHost?: string
    wsPort?: number
    wssPort?: number
    forceTLS?: boolean
    enabledTransports?: string[]
    authEndpoint?: string
    auth?: {
      headers?: Record<string, string>
    }
  }

  export interface Channel {
    listen(event: string, callback: (data: unknown) => void): Channel
    stopListening(event: string): Channel
    subscribed(callback: () => void): Channel
    error(callback: (error: unknown) => void): Channel
  }

  export interface PrivateChannel extends Channel {
    whisper(event: string, data: unknown): PrivateChannel
  }

  export interface PresenceChannel extends PrivateChannel {
    here(callback: (users: unknown[]) => void): PresenceChannel
    joining(callback: (user: unknown) => void): PresenceChannel
    leaving(callback: (user: unknown) => void): PresenceChannel
  }

  export default class Echo {
    constructor(options: EchoOptions)
    channel(name: string): Channel
    private(name: string): PrivateChannel
    join(name: string): PresenceChannel
    leave(name: string): void
    leaveChannel(name: string): void
    disconnect(): void
  }
}

declare module 'pusher-js' {
  const Pusher: unknown
  export default Pusher
}
