// src/services/userVehicleService.ts
import { httpService } from './httpService';
import type { 
  UserVehicle, 
  CreateUserVehicleData, 
  UpdateUserVehicleData,
  ApiResponse 
} from '../types';

class UserVehicleService {
  private readonly BASE_URL = '/user/vehicles';

  /**
   * Obtenir tous les véhicules de l'utilisateur
   */
  async getVehicles(): Promise<ApiResponse<UserVehicle[]>> {
    return httpService.get<ApiResponse<UserVehicle[]>>(this.BASE_URL);
  }

  /**
   * Obtenir un véhicule spécifique
   */
  async getVehicle(id: number): Promise<ApiResponse<UserVehicle>> {
    return httpService.get<ApiResponse<UserVehicle>>(`${this.BASE_URL}/${id}`);
  }

  /**
   * Créer un nouveau véhicule
   */
  async createVehicle(data: CreateUserVehicleData): Promise<ApiResponse<UserVehicle>> {
    return httpService.post<ApiResponse<UserVehicle>>(this.BASE_URL, data);
  }

  /**
   * Mettre à jour un véhicule
   */
  async updateVehicle(id: number, data: UpdateUserVehicleData): Promise<ApiResponse<UserVehicle>> {
    return httpService.put<ApiResponse<UserVehicle>>(`${this.BASE_URL}/${id}`, data);
  }

  /**
   * Supprimer un véhicule
   */
  async deleteVehicle(id: number): Promise<ApiResponse<null>> {
    return httpService.delete<ApiResponse<null>>(`${this.BASE_URL}/${id}`);
  }

  /**
   * Définir un véhicule comme par défaut
   */
  async setDefaultVehicle(id: number): Promise<ApiResponse<UserVehicle>> {
    return httpService.post<ApiResponse<UserVehicle>>(`${this.BASE_URL}/${id}/set-default`);
  }
}

export const userVehicleService = new UserVehicleService();
