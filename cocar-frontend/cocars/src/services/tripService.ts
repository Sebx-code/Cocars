// src/services/tripService.ts
import { httpService } from './httpService';
import { ENDPOINTS } from '../config/api';
import type { 
  Trip, 
  CreateTripData, 
  TripSearchParams, 
  ApiResponse, 
  PaginatedResponse 
} from '../types';

class TripService {
  /**
   * Rechercher des trajets
   */
  async searchTrips(params: TripSearchParams): Promise<PaginatedResponse<Trip>> {
    const queryParams = new URLSearchParams();
    
    if (params.departure_city) queryParams.append('departure_city', params.departure_city);
    if (params.arrival_city) queryParams.append('arrival_city', params.arrival_city);
    if (params.date) queryParams.append('date', params.date);
    if (params.passengers) queryParams.append('passengers', params.passengers.toString());
    if (params.min_price) queryParams.append('min_price', params.min_price.toString());
    if (params.max_price) queryParams.append('max_price', params.max_price.toString());
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    
    const queryString = queryParams.toString();
    const url = `${ENDPOINTS.SEARCH_TRIPS}${queryString ? `?${queryString}` : ''}`;
    
    return httpService.get<PaginatedResponse<Trip>>(url, { skipAuth: true });
  }
  
  /**
   * Obtenir tous les trajets (avec pagination)
   */
  async getAllTrips(page: number = 1, perPage: number = 10): Promise<PaginatedResponse<Trip>> {
    return httpService.get<PaginatedResponse<Trip>>(
      `${ENDPOINTS.TRIPS}?page=${page}&per_page=${perPage}`,
      { skipAuth: true }
    );
  }
  
  /**
   * Obtenir les détails d'un trajet
   */
  async getTripById(id: number | string): Promise<ApiResponse<Trip>> {
    return httpService.get<ApiResponse<Trip>>(ENDPOINTS.TRIP_DETAIL(id), { skipAuth: true });
  }
  
  /**
   * Obtenir mes trajets (en tant que conducteur)
   */
  async getMyTrips(page: number = 1, perPage: number = 10): Promise<PaginatedResponse<Trip>> {
    return httpService.get<PaginatedResponse<Trip>>(
      `${ENDPOINTS.MY_TRIPS}?page=${page}&per_page=${perPage}`
    );
  }
  
  /**
   * Créer un nouveau trajet
   */
  async createTrip(data: CreateTripData): Promise<ApiResponse<Trip>> {
    return httpService.post<ApiResponse<Trip>>(ENDPOINTS.TRIPS, data);
  }
  
  /**
   * Mettre à jour un trajet
   */
  async updateTrip(id: number | string, data: Partial<CreateTripData>): Promise<ApiResponse<Trip>> {
    return httpService.put<ApiResponse<Trip>>(ENDPOINTS.TRIP_DETAIL(id), data);
  }
  
  /**
   * Annuler un trajet
   */
  async cancelTrip(id: number | string, reason?: string): Promise<ApiResponse<Trip>> {
    return httpService.put<ApiResponse<Trip>>(ENDPOINTS.TRIP_DETAIL(id), {
      status: 'cancelled',
      cancellation_reason: reason
    });
  }
  
  /**
   * Supprimer un trajet
   */
  async deleteTrip(id: number | string): Promise<ApiResponse<null>> {
    return httpService.delete<ApiResponse<null>>(ENDPOINTS.TRIP_DETAIL(id));
  }
}

export const tripService = new TripService();
