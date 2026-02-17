// ============= USER TYPES =============
export interface User {
  id: number
  name: string
  email: string
  phone?: string
  avatar?: string
  role: 'user' | 'admin'
  is_verified: boolean
  rating?: number
  credibility_points?: number
  credibility_stars?: number
  total_positive_points?: number
  total_negative_points?: number
  total_trips_as_driver?: number
  created_at: string
  updated_at: string
}

// ============= TRIP TYPES =============
export interface Trip {
  id: number
  driver_id: number
  driver: User
  vehicle_id?: number
  vehicle?: Vehicle
  departure_city: string
  departure_address?: string
  arrival_city: string
  arrival_address?: string
  departure_date: string
  departure_time: string
  arrival_time?: string
  available_seats: number
  price_per_seat: number
  description?: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  preferences: TripPreferences
  created_at: string
  updated_at: string
}

export interface TripPreferences {
  smoking: boolean
  music: boolean
  pets: boolean
  luggage: 'small' | 'medium' | 'large'
}

// ============= BOOKING TYPES =============
export interface Booking {
  id: number
  trip_id: number
  trip: Trip
  passenger_id: number
  passenger: User
  seats: number
  total_price: number
  status: BookingStatus
  passenger_code?: number // Code passager par trajet (1, 2, 3...)
  driver_response?: string
  pickup_point?: string
  dropoff_point?: string
  cancellation_reason?: string
  // Confirmation de départ (système escrow)
  driver_confirmed_departure: boolean
  passenger_confirmed_departure: boolean
  driver_departure_confirmed_at?: string
  passenger_departure_confirmed_at?: string
  trip_started: boolean
  trip_started_at?: string
  passenger_no_show: boolean
  marked_no_show_at?: string
  driver_no_show?: boolean
  marked_driver_no_show_at?: string
  payment?: Payment
  created_at: string
  updated_at: string
}

export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed' | 'in_progress'

// ============= VEHICLE TYPES =============
export interface UserVehiclePhoto {
  id: number
  vehicle_id: number
  path: string
  url: string
  is_primary: boolean
  sort_order: number
  created_at: string
}

export interface Vehicle {
  id: number
  user_id: number
  brand: string
  model: string
  color: string
  registration_number: string
  seats: number
  year?: number
  is_default: boolean
  photos?: UserVehiclePhoto[]
  created_at: string
  updated_at: string
}

// ============= PAYMENT TYPES =============
export interface Payment {
  id: number
  booking_id: number
  payer_id: number
  amount: number
  currency: string
  payment_method: PaymentMethod
  status: PaymentStatus
  escrow_status: EscrowStatus
  escrow_amount: number
  penalty_amount: number
  refund_amount: number
  driver_amount: number
  commission_amount: number
  transaction_id: string
  external_reference?: string
  phone_number?: string
  payment_response?: Record<string, unknown>
  paid_at?: string
  escrow_held_at?: string
  escrow_released_at?: string
  refunded_at?: string
  created_at: string
  updated_at: string
  booking?: Booking
}

export type PaymentMethod = 'cash' | 'mobile_money' | 'orange_money' | 'mtn_money'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
export type EscrowStatus = 'none' | 'held' | 'released' | 'refunded' | 'partial_refund'

// ============= WALLET TYPES =============
export interface Wallet {
  id: number
  user_id: number
  balance: number
  pending_balance: number
  currency: string
  created_at: string
  updated_at: string
}

export interface WalletTransaction {
  id: number
  wallet_id: number
  payment_id?: number
  booking_id?: number
  type: WalletTransactionType
  amount: number
  balance_after: number
  description?: string
  metadata?: Record<string, unknown>
  reference: string
  created_at: string
  booking?: Booking
  payment?: Payment
}

export type WalletTransactionType = 
  | 'deposit'
  | 'withdrawal'
  | 'escrow_in'
  | 'escrow_release'
  | 'escrow_refund'
  | 'penalty'
  | 'commission'
  | 'bonus'

export interface PaymentMethodInfo {
  id: PaymentMethod
  name: string
  icon: string
  available: boolean
  description: string
  escrow: boolean
}

export interface EscrowInfo {
  enabled: boolean
  description: string
  penalty_amount: number
  penalty_description: string
  commission_percent: number
}

// ============= ANALYTICS TYPES =============
export type AnalyticsGroup = 'day' | 'week' | 'month'

export interface DriverFinancialSeriesPoint {
  date: string
  earned: number
  pending: number
}

export interface DriverFinancialStats {
  from: string
  to: string
  group: AnalyticsGroup
  totals: { earned: number; pending: number }
  series: DriverFinancialSeriesPoint[]
}

export interface CompanyFinancialSeriesPoint {
  date: string
  gross_revenue: number
  commission_revenue: number
  driver_payouts: number
  refunds: number
}

export interface CompanyFinancialStats {
  from: string
  to: string
  group: AnalyticsGroup
  filters?: {
    payment_method?: string | null
    status?: string | null
    escrow_status?: string | null
  }
  totals: {
    gross_revenue: number
    commission_revenue: number
    driver_payouts: number
    refunds: number
    penalties?: number
    bookings: number
    payments: number
  }
  series: CompanyFinancialSeriesPoint[]
  breakdowns?: {
    escrow?: Record<string, { count: number; amount: number }>
    payment_status?: Record<string, number>
  }
  top?: {
    drivers?: Array<{ driver_id: number; driver_name: string; driver_payouts: number; commission: number; trips_count: number }>
    departure_cities?: Array<{ city: string; bookings: number }>
    arrival_cities?: Array<{ city: string; bookings: number }>
    routes?: Array<{ departure_city: string; arrival_city: string; bookings: number }>
  }
}

// ============= RATING TYPES =============
export interface Rating {
  id: number
  trip_id: number
  trip: Trip
  rater_id: number
  rater: User
  rated_id: number
  rated: User
  rating: number
  comment?: string
  created_at: string
  updated_at: string
}

// ============= NOTIFICATION TYPES =============
export interface Notification {
  id: number
  user_id: number
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  is_read: boolean
  read?: boolean // Support pour le format backend
  read_at?: string
  created_at: string
  updated_at: string
}

export type NotificationType = 
  | 'booking_new'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_completed'
  | 'booking_no_show'
  | 'departure_confirmed'
  | 'trip_started'
  | 'trip_reminder'
  | 'trip_cancelled'
  | 'trip_updated'
  | 'message_new'
  | 'rating_received'
  | 'payment_received'
  | 'payment_refund'
  | 'payment_secured'
  | 'payment_pending'
  | 'driver_no_show'
  | 'credibility_increased'
  | 'credibility_decreased'
  | 'star_lost'
  | 'verification_approved'
  | 'verification_rejected'
  | 'system'

// ============= MESSAGE TYPES =============
export interface Message {
  id: number
  conversation_id: number
  sender_id: number
  sender: User
  content: string
  type: 'text' | 'image' | 'file'
  is_read: boolean
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: number
  type: 'trip' | 'support'
  trip_id?: number
  trip?: Trip
  participants: User[]
  last_message?: Message
  unread_count: number
  created_at: string
  updated_at: string
}

// ============= API RESPONSE TYPES =============
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

// ============= AUTH TYPES =============
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  phone?: string
  password: string
  password_confirmation: string
}

export interface AuthResponse {
  user: User
  access_token: string
  refresh_token?: string
  token_type: string
  expires_in?: number
}

// ============= STATS TYPES =============
export interface UserStats {
  total_trips_as_driver: number
  total_trips_as_passenger: number
  total_bookings: number
  total_earnings: number
  average_rating: number
  co2_saved: number
  // Crédibilité
  credibility_points?: number
  credibility_stars?: number
  credibility_progress?: CredibilityProgress
  total_positive_points?: number
  total_negative_points?: number
}

// ============= CREDIBILITY TYPES =============
export interface CredibilityProgress {
  current_stars: number
  next_stars: number
  current_points: number
  points_needed: number
  progress_percent: number
  max_level: boolean
}

export interface CredibilityStats {
  total_users: number
  average_points: number
  distribution: {
    stars_1: number
    stars_2: number
    stars_3: number
    stars_4: number
    stars_5: number
  }
  top_users: Array<{
    id: number
    name: string
    avatar?: string
    credibility_points: number
    credibility_stars: number
    total_trips_as_driver: number
  }>
}
