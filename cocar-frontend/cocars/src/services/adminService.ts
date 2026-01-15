// cocar-frontend/cocars/src/services/adminService.ts
import { httpService } from './httpService';
import { ENDPOINTS } from '../config/api';
import { User, Trip, Booking } from '../types';

export interface AdminStats {
  total_users: number;
  total_trips: number;
  total_bookings: number;
  total_revenue: number;
  active_users: number;
  pending_verifications: number;
  new_users_this_month: number;
  new_trips_this_month: number;
  new_bookings_this_month: number;
  revenue_this_month: number;
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

export interface Activity {
  type: 'user' | 'trip' | 'booking';
  text: string;
  time: string;
  created_at: string;
}

class AdminService {
  // Statistiques du dashboard
  async getStats(): Promise<{ success: boolean; data: AdminStats }> {
    return httpService.get(ENDPOINTS.ADMIN_STATS);
  }

  // Activité récente
  async getRecentActivity(): Promise<{ success: boolean; data: Activity[] }> {
    return httpService.get(ENDPOINTS.ADMIN_ACTIVITY);
  }

  // ========== UTILISATEURS ==========
  
  async getUsers(page: number = 1, search?: string, filters?: { role?: string; is_verified?: string }): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams({ page: String(page), per_page: '15' });
    if (search) params.append('search', search);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.is_verified) params.append('is_verified', filters.is_verified);
    
    return httpService.get(`${ENDPOINTS.ADMIN_USERS}?${params}`);
  }

  async verifyUser(userId: number): Promise<{ success: boolean; message: string; data: User }> {
    return httpService.post(ENDPOINTS.ADMIN_VERIFY_USER(userId));
  }

  async deleteUser(userId: number): Promise<{ success: boolean; message: string }> {
    return httpService.delete(ENDPOINTS.ADMIN_DELETE_USER(userId));
  }

  // ========== TRAJETS ==========

  async getTrips(page: number = 1, filters?: { status?: string; search?: string; date_from?: string; date_to?: string }): Promise<PaginatedResponse<Trip>> {
    const params = new URLSearchParams({ page: String(page), per_page: '15' });
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    
    return httpService.get(`${ENDPOINTS.ADMIN_TRIPS}?${params}`);
  }

  async deleteTrip(tripId: number): Promise<{ success: boolean; message: string }> {
    return httpService.delete(ENDPOINTS.ADMIN_DELETE_TRIP(tripId));
  }

  // ========== RESERVATIONS ==========

  async getBookings(page: number = 1, filters?: { status?: string; search?: string }): Promise<PaginatedResponse<Booking>> {
    const params = new URLSearchParams({ page: String(page), per_page: '15' });
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    
    return httpService.get(`${ENDPOINTS.ADMIN_BOOKINGS}?${params}`);
  }

  async confirmBooking(bookingId: number): Promise<{ success: boolean; message: string; data: Booking }> {
    return httpService.post(ENDPOINTS.ADMIN_CONFIRM_BOOKING(bookingId));
  }

  async cancelBooking(bookingId: number): Promise<{ success: boolean; message: string; data: Booking }> {
    return httpService.post(ENDPOINTS.ADMIN_CANCEL_BOOKING(bookingId));
  }
}

export const adminService = new AdminService();
