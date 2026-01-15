// src/services/vehicleService.ts
import { httpService } from './httpService';
import { ENDPOINTS } from '../config/api';
import type { 
  Vehicle, 
  ApiResponse 
} from '../types';

interface CreateVehicleData {
  brand: string;
  model: string;
  color: string;
  plate_number: string;
  seats: number;
  year?: number;
  photo?: string;
}

class VehicleService {
  /**
   * Obtenir mes véhicules
   */
  async getMyVehicles(): Promise<ApiResponse<Vehicle[]>> {
    return httpService.get<ApiResponse<Vehicle[]>>(ENDPOINTS.MY_VEHICLES);
  }
  
  /**
   * Obtenir les détails d'un véhicule
   */
  async getVehicleById(id: number | string): Promise<ApiResponse<Vehicle>> {
    return httpService.get<ApiResponse<Vehicle>>(ENDPOINTS.VEHICLE_DETAIL(id));
  }
  
  /**
   * Ajouter un véhicule
   */
  async createVehicle(data: CreateVehicleData): Promise<ApiResponse<Vehicle>> {
    return httpService.post<ApiResponse<Vehicle>>(ENDPOINTS.VEHICLES, data);
  }
  
  /**
   * Mettre à jour un véhicule
   */
  async updateVehicle(id: number | string, data: Partial<CreateVehicleData>): Promise<ApiResponse<Vehicle>> {
    return httpService.put<ApiResponse<Vehicle>>(ENDPOINTS.VEHICLE_DETAIL(id), data);
  }
  
  /**
   * Supprimer un véhicule
   */
  async deleteVehicle(id: number | string): Promise<ApiResponse<null>> {
    return httpService.delete<ApiResponse<null>>(ENDPOINTS.VEHICLE_DETAIL(id));
  }
}

export const vehicleService = new VehicleService();
