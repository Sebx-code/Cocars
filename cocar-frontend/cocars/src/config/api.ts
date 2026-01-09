// taxiYa-main/src/config/api.ts
// Pour éviter tout appel vers un domaine externe en dev, on force l'URL locale
// sauf si une VITE_API_URL explicitement fournie est différente.
const RESOLVED_BASE_URL =
  (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== '')
    ? import.meta.env.VITE_API_URL.trim()
    : 'http://localhost:8000';

export const API_CONFIG = {
  BASE_URL: RESOLVED_BASE_URL,
  API_PREFIX: '/api/v1',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${endpoint}`;
};

// Configuration des endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  ME: '/auth/user',
  
  // Rides
  CALCULATE_FARE: '/rides/calculate-fare',
  REQUEST_RIDE: '/rides/request',
  GET_ACTIVE_RIDE: '/rides/active',
  TRACK_RIDE: (id: string) => `/rides/${id}/track`,
  CANCEL_RIDE: (id: string) => `/rides/${id}/cancel`,
  RATE_RIDE: (id: string) => `/rides/${id}/rate`,
  
  // Driver
  DRIVER_DASHBOARD: '/driver/dashboard',
  DRIVER_LOCATION: '/driver/location',
  DRIVER_STATUS: '/driver/status',
  ACCEPT_RIDE: (id: string) => `/driver/ride/${id}/accept`,
  
  // Admin
  ADMIN_STATS: '/admin/stats',
  ADMIN_DRIVERS: '/admin/drivers',
  ADMIN_MAP_DATA: '/admin/map-data',
  
  // Payment
  PROCESS_PAYMENT: '/payments/process',
  PAYMENT_METHODS: '/payments/methods',
};