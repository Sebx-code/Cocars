import axios from 'axios'
import { ApiResponse, LoginCredentials, RegisterData, Trip, Booking, Vehicle, User, UserStats, Notification, Conversation, Message, Payment, Wallet, WalletTransaction, PaymentMethodInfo, EscrowInfo } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor - Add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ============= AUTH API =============
export const authApi = {
  login: (credentials: LoginCredentials) => 
    api.post<ApiResponse<unknown>>('/auth/login', credentials),
  
  register: (data: RegisterData) => 
    api.post<ApiResponse<unknown>>('/auth/register', data),
  
  logout: () => 
    api.post('/auth/logout'),
  
  getUser: () => 
    api.get<ApiResponse<User>>('/auth/user'),
  
  updateProfile: (data: Partial<User>) => 
    api.put<ApiResponse<User>>('/auth/profile', data),
  
  changePassword: (data: { current_password: string; new_password: string; new_password_confirmation: string }) => 
    api.put('/auth/profile/password', data),
}

// ============= TRIPS API =============
export const tripsApi = {
  getAll: (params?: Record<string, unknown>) => 
    api.get<ApiResponse<Trip[]>>('/trips', { params }),
  
  search: (params: Record<string, unknown>) => 
    api.get<ApiResponse<Trip[]>>('/trips/search', { params }),
  
  getById: (id: number) => 
    api.get<ApiResponse<Trip>>(`/trips/${id}`),
  
  create: (data: Partial<Trip>) => 
    api.post<ApiResponse<Trip>>('/trips', data),
  
  update: (id: number, data: Partial<Trip>) => 
    api.put<ApiResponse<Trip>>(`/trips/${id}`, data),
  
  delete: (id: number) => 
    api.delete(`/trips/${id}`),
  
  getMyTrips: () => 
    api.get<ApiResponse<Trip[]>>('/my-trips'),
}

// ============= BOOKINGS API =============
export const bookingsApi = {
  getAll: () => 
    api.get<ApiResponse<Booking[]>>('/bookings'),
  
  getMyBookings: (params?: { status?: string }) => 
    api.get<ApiResponse<Booking[]>>('/my-bookings', { params }),
  
  getById: (id: number) => 
    api.get<ApiResponse<Booking>>(`/bookings/${id}`),
  
  create: (data: { trip_id: number; seats_booked: number; message?: string; pickup_point?: string; dropoff_point?: string }) => 
    api.post<ApiResponse<Booking>>('/bookings', data),
  
  confirm: (id: number, driver_response?: string) => 
    api.post<ApiResponse<Booking>>(`/bookings/${id}/confirm`, { driver_response }),
  
  reject: (id: number, driver_response?: string) => 
    api.post<ApiResponse<Booking>>(`/bookings/${id}/reject`, { driver_response }),
  
  cancel: (id: number, cancellation_reason?: string) => 
    api.post<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { cancellation_reason }),

  // Confirmation de départ (système escrow)
  confirmDepartureByDriver: (id: number) => 
    api.post<ApiResponse<Booking>>(`/bookings/${id}/confirm-departure/driver`),
  
  confirmDepartureByPassenger: (id: number) => 
    api.post<ApiResponse<Booking>>(`/bookings/${id}/confirm-departure/passenger`),
  
  markNoShow: (id: number) => 
    api.post<ApiResponse<Booking>>(`/bookings/${id}/no-show`),
  
  getDepartureStatus: (id: number) => 
    api.get<ApiResponse<{
      booking_id: number
      status: string
      driver_confirmed: boolean
      driver_confirmed_at?: string
      passenger_confirmed: boolean
      passenger_confirmed_at?: string
      trip_started: boolean
      trip_started_at?: string
      payment_status?: string
      escrow_status?: string
    }>>(`/bookings/${id}/departure-status`),
}

// ============= VEHICLES API =============
export const vehiclesApi = {
  getAll: () => 
    api.get<ApiResponse<Vehicle[]>>('/user/vehicles'),
  
  getById: (id: number) => 
    api.get<ApiResponse<Vehicle>>(`/user/vehicles/${id}`),
  
  create: (data: Partial<Vehicle>) => 
    api.post<ApiResponse<Vehicle>>('/user/vehicles', data),
  
  update: (id: number, data: Partial<Vehicle>) => 
    api.put<ApiResponse<Vehicle>>(`/user/vehicles/${id}`, data),
  
  delete: (id: number) => 
    api.delete(`/user/vehicles/${id}`),
  
  setDefault: (id: number) => 
    api.post(`/user/vehicles/${id}/set-default`),
}

// ============= PAYMENTS API =============
export const paymentsApi = {
  getMethods: () => 
    api.get<ApiResponse<{ methods: PaymentMethodInfo[]; escrow_info: EscrowInfo }>>('/payments/methods'),
  
  process: (data: { booking_id: number; payment_method: string; phone_number?: string }) => 
    api.post<ApiResponse<Payment>>('/payments/process', data),
  
  getHistory: () => 
    api.get<ApiResponse<Payment[]>>('/payments/history'),
  
  getStatus: (transactionId: string) => 
    api.get<ApiResponse<Payment>>(`/payments/status/${transactionId}`),
  
  confirmCash: (paymentId: number) => 
    api.post<ApiResponse<Payment>>(`/payments/${paymentId}/confirm-cash`),

  requestRefund: (paymentId: number) => 
    api.post<ApiResponse<Payment>>(`/payments/${paymentId}/refund`),
}

// ============= WALLET API =============
export const walletApi = {
  get: () => 
    api.get<ApiResponse<{ wallet: Wallet; transactions: WalletTransaction[]; stats: { earned: number; spent: number; refunded: number; pending: number } }>>('/wallet'),
  
  getTransactions: (params?: { page?: number }) => 
    api.get<ApiResponse<WalletTransaction[]>>('/wallet/transactions', { params }),
  
  withdraw: (data: { amount: number; provider: string; phone_number: string }) => 
    api.post<ApiResponse<{ success: boolean; transaction: WalletTransaction; message: string }>>('/wallet/withdraw', data),
}

// ============= RATINGS API =============
export const ratingsApi = {
  create: (data: { trip_id: number; rated_id: number; rating: number; comment?: string }) => 
    api.post<ApiResponse<unknown>>('/ratings', data),
  
  getUserRatings: (userId: number) => 
    api.get<ApiResponse<unknown[]>>(`/ratings/user/${userId}`),
  
  getUserAverage: (userId: number) => 
    api.get<ApiResponse<{ average: number; count: number }>>(`/ratings/user/${userId}/average`),
  
  canRate: (tripId: number) => 
    api.get<ApiResponse<boolean>>(`/ratings/can-rate/${tripId}`),
}

// ============= NOTIFICATIONS API =============
export const notificationsApi = {
  getAll: () => 
    api.get<ApiResponse<Notification[]>>('/notifications'),
  
  getUnreadCount: () => 
    api.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),
  
  markAsRead: (id: number) => 
    api.post(`/notifications/${id}/read`),
  
  markAllAsRead: () => 
    api.post('/notifications/read-all'),
  
  delete: (id: number) => 
    api.delete(`/notifications/${id}`),
}

// ============= MESSAGES API =============
export const messagesApi = {
  getConversations: () => 
    api.get<ApiResponse<Conversation[]>>('/conversations'),
  
  getMessages: (conversationId: number) => 
    api.get<ApiResponse<Message[]>>(`/conversations/${conversationId}/messages`),
  
  sendMessage: (conversationId: number, content: string) => 
    api.post<ApiResponse<Message>>(`/conversations/${conversationId}/messages`, { content, type: 'text' }),
  
  markAsRead: (conversationId: number) => 
    api.post(`/conversations/${conversationId}/mark-read`),
  
  getOrCreateTripConversation: (tripId: number) => 
    api.post<ApiResponse<Conversation>>(`/conversations/trip/${tripId}`),
  
  getUnreadCount: () => 
    api.get<ApiResponse<{ count: number }>>('/messages/unread-count'),
}

// ============= USER API =============
export const userApi = {
  getStats: () => 
    api.get<ApiResponse<UserStats>>('/user/stats'),
  
  updateProfile: (data: Partial<User>) => 
    api.put<ApiResponse<User>>('/user/profile', data),
  
  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.post<ApiResponse<{ avatar_url: string }>>('/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  
  getProfile: (userId: number) => 
    api.get<ApiResponse<User>>(`/users/${userId}/profile`),
}

// ============= ADMIN API =============
export const adminApi = {
  // Dashboard
  getStats: () => 
    api.get<ApiResponse<unknown>>('/admin/stats'),
  
  getRecentActivity: () => 
    api.get<ApiResponse<unknown>>('/admin/activity'),
  
  // Users management
  getUsers: (params?: Record<string, string | number>) => 
    api.get<ApiResponse<unknown>>('/admin/users', { params }),
  
  verifyUser: (userId: number) => 
    api.post<ApiResponse<unknown>>(`/admin/users/${userId}/verify`),
  
  deleteUser: (userId: number) => 
    api.delete(`/admin/users/${userId}`),
  
  // Trips management
  getTrips: (params?: Record<string, string | number>) => 
    api.get<ApiResponse<unknown>>('/admin/trips', { params }),
  
  deleteTrip: (tripId: number) => 
    api.delete(`/admin/trips/${tripId}`),
  
  // Bookings management
  getBookings: (params?: Record<string, string | number>) => 
    api.get<ApiResponse<unknown>>('/admin/bookings', { params }),
  
  confirmBooking: (bookingId: number) => 
    api.post<ApiResponse<unknown>>(`/admin/bookings/${bookingId}/confirm`),
  
  cancelBooking: (bookingId: number) => 
    api.post<ApiResponse<unknown>>(`/admin/bookings/${bookingId}/cancel`),
  
  // Verification management
  approveVerification: (userId: number, notes?: string) => 
    api.post<ApiResponse<unknown>>(`/admin/verification/${userId}/approve`, { notes }),
  
  rejectVerification: (userId: number, reason: string) => 
    api.post<ApiResponse<unknown>>(`/admin/verification/${userId}/reject`, { reason }),
}

export default api
