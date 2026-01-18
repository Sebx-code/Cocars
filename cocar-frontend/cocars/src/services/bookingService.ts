// src/services/bookingService.ts
import { httpService } from './httpService';
import { ENDPOINTS } from '../config/api';
import type { 
  Booking, 
  CreateBookingData, 
  ApiResponse
} from '../types';

class BookingService {
  /**
   * Créer une nouvelle réservation
   */
  async createBooking(data: CreateBookingData): Promise<ApiResponse<Booking>> {
    return httpService.post<ApiResponse<Booking>>(ENDPOINTS.BOOKINGS, data);
  }
  
  /**
   * Obtenir mes réservations (en tant que passager)
   */
  async getMyBookings(status?: string): Promise<ApiResponse<Booking[]>> {
    const url = status 
      ? `${ENDPOINTS.MY_BOOKINGS}?status=${status}` 
      : ENDPOINTS.MY_BOOKINGS;
    return httpService.get<ApiResponse<Booking[]>>(url);
  }
  
  /**
   * Obtenir les réservations pour mes trajets (en tant que conducteur)
   */
  async getBookingsForMyTrips(tripId?: number | string): Promise<ApiResponse<Booking[]>> {
    const url = tripId 
      ? `${ENDPOINTS.BOOKINGS}?trip_id=${tripId}` 
      : ENDPOINTS.BOOKINGS;
    return httpService.get<ApiResponse<Booking[]>>(url);
  }
  
  /**
   * Obtenir les détails d'une réservation
   */
  async getBookingById(id: number | string): Promise<ApiResponse<Booking>> {
    return httpService.get<ApiResponse<Booking>>(ENDPOINTS.BOOKING_DETAIL(id));
  }
  
  /**
   * Confirmer une réservation (conducteur)
   */
  async confirmBooking(id: number | string, response?: string): Promise<ApiResponse<Booking>> {
    return httpService.post<ApiResponse<Booking>>(ENDPOINTS.BOOKING_CONFIRM(id), {
      driver_response: response
    });
  }
  
  /**
   * Rejeter une réservation (conducteur)
   */
  async rejectBooking(id: number | string, reason?: string): Promise<ApiResponse<Booking>> {
    return httpService.post<ApiResponse<Booking>>(ENDPOINTS.BOOKING_REJECT(id), {
      driver_response: reason
    });
  }
  
  /**
   * Annuler une réservation (passager)
   */
  async cancelBooking(id: number | string, reason?: string): Promise<ApiResponse<Booking>> {
    return httpService.post<ApiResponse<Booking>>(ENDPOINTS.BOOKING_CANCEL(id), {
      cancellation_reason: reason
    });
  }

  /**
   * Obtenir les réservations pour un trajet spécifique
   */
  async getBookingsForTrip(tripId: number): Promise<ApiResponse<Booking[]>> {
    return httpService.get<ApiResponse<Booking[]>>(`${ENDPOINTS.BOOKINGS}?trip_id=${tripId}`);
  }
  
}

export const bookingService = new BookingService();
