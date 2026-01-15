// src/services/ratingService.ts
import { httpService } from './httpService';
import { ENDPOINTS } from '../config/api';
import type { 
  Rating, 
  CreateRatingData, 
  ApiResponse,
  PaginatedResponse 
} from '../types';

class RatingService {
  /**
   * Créer une évaluation
   */
  async createRating(data: CreateRatingData): Promise<ApiResponse<Rating>> {
    return httpService.post<ApiResponse<Rating>>(ENDPOINTS.RATINGS, data);
  }
  
  /**
   * Obtenir les évaluations d'un utilisateur
   */
  async getUserRatings(
    userId: number | string, 
    type?: 'driver' | 'passenger'
  ): Promise<PaginatedResponse<Rating>> {
    const url = type 
      ? `${ENDPOINTS.USER_RATINGS(userId)}?type=${type}` 
      : ENDPOINTS.USER_RATINGS(userId);
    return httpService.get<PaginatedResponse<Rating>>(url, { skipAuth: true });
  }
  
  /**
   * Obtenir les évaluations d'un trajet
   */
  async getTripRatings(tripId: number | string): Promise<ApiResponse<Rating[]>> {
    return httpService.get<ApiResponse<Rating[]>>(ENDPOINTS.TRIP_RATINGS(tripId), { skipAuth: true });
  }
  
  /**
   * Vérifier si l'utilisateur peut évaluer un trajet
   */
  async canRateTrip(tripId: number | string): Promise<ApiResponse<{ can_rate: boolean; reason?: string }>> {
    return httpService.get<ApiResponse<{ can_rate: boolean; reason?: string }>>(
      `${ENDPOINTS.RATINGS}/can-rate/${tripId}`
    );
  }
  
  /**
   * Obtenir la moyenne des notes d'un utilisateur
   */
  async getUserAverageRating(userId: number | string): Promise<ApiResponse<{
    average: number;
    total: number;
    as_driver: number;
    as_passenger: number;
  }>> {
    return httpService.get<ApiResponse<{
      average: number;
      total: number;
      as_driver: number;
      as_passenger: number;
    }>>(`/ratings/user/${userId}/average`, { skipAuth: true });
  }
}

export const ratingService = new RatingService();
