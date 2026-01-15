// src/config/api.ts - Configuration API Rideshare
const RESOLVED_BASE_URL =
  (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== '')
    ? import.meta.env.VITE_API_URL.trim()
    : 'http://localhost:8000';

export const API_CONFIG = {
  BASE_URL: RESOLVED_BASE_URL,
  API_PREFIX: '/api',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Mode développement - utilise les données mockées si le backend n'est pas disponible
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

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
  UPDATE_PROFILE: '/auth/profile',
  
  // Trips (Trajets)
  TRIPS: '/trips',
  TRIP_DETAIL: (id: number | string) => `/trips/${id}`,
  MY_TRIPS: '/my-trips',
  SEARCH_TRIPS: '/trips/search',
  
  // Bookings (Réservations)
  BOOKINGS: '/bookings',
  BOOKING_DETAIL: (id: number | string) => `/bookings/${id}`,
  MY_BOOKINGS: '/my-bookings',
  BOOKING_CONFIRM: (id: number | string) => `/bookings/${id}/confirm`,
  BOOKING_REJECT: (id: number | string) => `/bookings/${id}/reject`,
  BOOKING_CANCEL: (id: number | string) => `/bookings/${id}/cancel`,
  
  // Payments (Paiements)
  PAYMENTS: '/payments',
  PROCESS_PAYMENT: '/payments/process',
  PAYMENT_METHODS: '/payments/methods',
  PAYMENT_HISTORY: '/payments/history',
  PAYMENT_STATUS: (transactionId: string) => `/payments/status/${transactionId}`,
  CONFIRM_CASH_PAYMENT: (paymentId: number | string) => `/payments/${paymentId}/confirm-cash`,
  
  // Ratings (Notations)
  RATINGS: '/ratings',
  USER_RATINGS: (userId: number | string) => `/ratings/user/${userId}`,
  TRIP_RATINGS: (tripId: number | string) => `/ratings/trip/${tripId}`,
  
  // Vehicles (Véhicules)
  VEHICLES: '/vehicles',
  VEHICLE_DETAIL: (id: number | string) => `/vehicles/${id}`,
  MY_VEHICLES: '/my-vehicles',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_UNREAD_COUNT: '/notifications/unread-count',
  MARK_NOTIFICATION_READ: (id: number | string) => `/notifications/${id}/read`,
  MARK_ALL_NOTIFICATIONS_READ: '/notifications/read-all',
  
  // User Stats
  USER_STATS: '/user/stats',
  USER_PROFILE: (id: number | string) => `/users/${id}/profile`,
  
  // Admin
  ADMIN_STATS: '/admin/stats',
  ADMIN_ACTIVITY: '/admin/activity',
  ADMIN_USERS: '/admin/users',
  ADMIN_TRIPS: '/admin/trips',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_VERIFY_USER: (id: number | string) => `/admin/users/${id}/verify`,
  ADMIN_DELETE_USER: (id: number | string) => `/admin/users/${id}`,
  ADMIN_DELETE_TRIP: (id: number | string) => `/admin/trips/${id}`,
  ADMIN_CONFIRM_BOOKING: (id: number | string) => `/admin/bookings/${id}/confirm`,
  ADMIN_CANCEL_BOOKING: (id: number | string) => `/admin/bookings/${id}/cancel`,
};