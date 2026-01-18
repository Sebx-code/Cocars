// src/types/index.ts
// Types et interfaces pour l'application de covoiturage

// ============== UTILISATEUR ==============
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  avatar?: string;
  is_verified: boolean;
  bio?: string;
  rating?: number;
  total_rides?: number;
  total_trips_as_driver?: number;
  total_trips_as_passenger?: number;
  created_at?: string;
}

// ============== VÉHICULE ==============
export interface Vehicle {
  id: number;
  user_id: number;
  brand: string;
  model: string;
  color: string;
  plate_number: string;
  seats: number;
  year?: number;
  photo?: string;
  is_verified: boolean;
  created_at?: string;
}

// ============== TRAJET ==============
export type TripStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface Trip {
  id: number;
  driver_id: number;
  driver: User;
  vehicle?: Vehicle;
  departure_city: string;
  departure_address: string;
  departure_lat?: number;
  departure_lng?: number;
  arrival_city: string;
  arrival_address: string;
  arrival_lat?: number;
  arrival_lng?: number;
  departure_date: string;
  departure_time: string;
  estimated_arrival_time?: string;
  available_seats: number;
  total_seats: number;
  price_per_seat: number;
  description?: string;
  luggage_allowed: boolean;
  pets_allowed: boolean;
  smoking_allowed: boolean;
  music_allowed: boolean;
  air_conditioning: boolean;
  status: TripStatus;
  created_at: string;
  updated_at?: string;
}

export interface TripSearchParams {
  departure_city?: string;
  arrival_city?: string;
  date?: string;
  passengers?: number;
  min_price?: number;
  max_price?: number;
  sort_by?: 'price' | 'date' | 'rating';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface CreateTripData {
  departure_city: string;
  departure_address: string;
  departure_lat?: number;
  departure_lng?: number;
  arrival_city: string;
  arrival_address: string;
  arrival_lat?: number;
  arrival_lng?: number;
  departure_date: string;
  departure_time: string;
  estimated_arrival_time?: string;
  available_seats: number;
  price_per_seat: number;
  description?: string;
  vehicle_id?: number;
  vehicle_registration: string;
  vehicle_brand: string;
  vehicle_color: string;
  luggage_allowed?: boolean;
  pets_allowed?: boolean;
  smoking_allowed?: boolean;
  music_allowed?: boolean;
  air_conditioning?: boolean;
}

// ============== RÉSERVATION ==============
export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';

export interface Booking {
  id: number;
  trip_id: number;
  trip: Trip;
  passenger_id: number;
  passenger: User;
  seats_booked: number;
  total_price: number;
  status: BookingStatus;
  message?: string;
  driver_response?: string;
  pickup_point?: string;
  dropoff_point?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateBookingData {
  trip_id: number;
  seats_booked: number;
  message?: string;
  pickup_point?: string;
  dropoff_point?: string;
}

// ============== PAIEMENT ==============
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'cash' | 'mobile_money' | 'card' | 'orange_money' | 'mtn_money';

export interface Payment {
  id: number;
  booking_id: number;
  booking?: Booking;
  payer_id: number;
  payer?: User;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  transaction_id?: string;
  paid_at?: string;
  created_at: string;
}

export interface ProcessPaymentData {
  booking_id: number;
  payment_method: PaymentMethod;
  phone_number?: string;
}

// ============== NOTATION / ÉVALUATION ==============
export interface Rating {
  id: number;
  trip_id: number;
  trip?: Trip;
  rater_id: number;
  rater: User;
  rated_user_id: number;
  rated_user: User;
  rating: number; // 1-5
  comment?: string;
  rating_type: 'driver' | 'passenger';
  punctuality?: number;
  communication?: number;
  comfort?: number;
  created_at: string;
}

export interface CreateRatingData {
  trip_id: number;
  rated_user_id: number;
  rating: number;
  comment?: string;
  rating_type: 'driver' | 'passenger';
  punctuality?: number;
  communication?: number;
  comfort?: number;
}

// ============== NOTIFICATION ==============
export type NotificationType = 
  | 'booking_request' 
  | 'booking_confirmed' 
  | 'booking_rejected' 
  | 'booking_cancelled'
  | 'trip_reminder'
  | 'trip_cancelled'
  | 'payment_received'
  | 'new_rating'
  | 'message';

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, string | number | boolean | null>;
  read: boolean;
  read_at?: string;
  created_at: string;
}

// ============== RÉPONSES API ==============
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ============== STATISTIQUES DASHBOARD ==============
export interface UserStats {
  total_trips_as_driver: number;
  total_trips_as_passenger: number;
  total_earnings: number;
  total_spent: number;
  average_rating: number;
  total_ratings: number;
  upcoming_trips: number;
  completed_trips: number;
}

export interface AdminStats {
  total_users: number;
  total_drivers: number;
  total_trips: number;
  total_bookings: number;
  total_revenue: number;
  active_trips: number;
  pending_verifications: number;
}

// ============== ACTIVITÉS ==============
export type ActivityType = 
  | 'trip_created'
  | 'trip_completed'
  | 'booking_created'
  | 'booking_confirmed'
  | 'booking_rejected'
  | 'booking_cancelled'
  | 'rating_received'
  | 'payment_received';

export interface Activity {
  id: number;
  type: ActivityType;
  title: string;
  description: string;
  created_at: string;
  data?: {
    trip_id?: number;
    booking_id?: number;
    rating?: number;
    amount?: number;
  };
}

// ============== VÉHICULES UTILISATEUR ==============
export interface UserVehicle {
  id: number;
  user_id: number;
  registration_number: string;
  brand: string;
  model?: string;
  color: string;
  year?: number;
  seats: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserVehicleData {
  registration_number: string;
  brand: string;
  model?: string;
  color: string;
  year?: number;
  seats?: number;
  is_default?: boolean;
}

export interface UpdateUserVehicleData {
  registration_number?: string;
  brand?: string;
  model?: string;
  color?: string;
  year?: number;
  seats?: number;
  is_default?: boolean;
}
