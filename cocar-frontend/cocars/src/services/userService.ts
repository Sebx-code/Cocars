// src/services/userService.ts
import { httpService } from './httpService';
import { ENDPOINTS } from '../config/api';
import type { 
  User, 
  UserStats,
  Activity,
  ApiResponse 
} from '../types';

interface UpdateProfileData {
  name?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}

class UserService {
  /**
   * Obtenir le profil d'un utilisateur
   */
  async getUserProfile(userId: number | string): Promise<ApiResponse<User>> {
    return httpService.get<ApiResponse<User>>(ENDPOINTS.USER_PROFILE(userId), { skipAuth: true });
  }
  
  /**
   * Mettre à jour le profil
   */
  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<User>> {
    return httpService.put<ApiResponse<User>>(ENDPOINTS.UPDATE_PROFILE, data);
  }
  
  /**
   * Obtenir les statistiques de l'utilisateur
   */
  async getUserStats(): Promise<ApiResponse<UserStats>> {
    return httpService.get<ApiResponse<UserStats>>(ENDPOINTS.USER_STATS);
  }
  
  /**
   * Changer le mot de passe
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    return httpService.put<ApiResponse<null>>(`${ENDPOINTS.UPDATE_PROFILE}/password`, {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmed: newPassword
    });
  }

  /**
   * Obtenir les activités récentes de l'utilisateur
   */
  async getRecentActivities(limit: number = 10): Promise<ApiResponse<Activity[]>> {
    return httpService.get<ApiResponse<Activity[]>>(`${ENDPOINTS.USER_STATS}/activities?limit=${limit}`);
  }

  /**
   * Upload photo de profil
   */
  async uploadAvatar(file: File): Promise<ApiResponse<{ avatar: string; avatar_url: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);

    return httpService.post<ApiResponse<{ avatar: string; avatar_url: string }>>(
      '/user/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  }

  /**
   * Supprimer la photo de profil
   */
  async deleteAvatar(): Promise<ApiResponse<null>> {
    return httpService.delete<ApiResponse<null>>('/user/avatar');
  }

  /**
   * Mettre à jour le profil
   */
  async updateProfile(data: { name?: string; phone?: string; bio?: string }): Promise<ApiResponse<User>> {
    return httpService.put<ApiResponse<User>>('/user/profile', data);
  }
}

export const userService = new UserService();
