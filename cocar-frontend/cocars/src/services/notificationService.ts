// src/services/notificationService.ts
import { httpService } from './httpService';
import { ENDPOINTS } from '../config/api';
import type { 
  Notification, 
  ApiResponse,
  PaginatedResponse 
} from '../types';

class NotificationService {
  /**
   * Obtenir les notifications de l'utilisateur
   */
  async getNotifications(unreadOnly: boolean = false): Promise<PaginatedResponse<Notification>> {
    const url = unreadOnly 
      ? `${ENDPOINTS.NOTIFICATIONS}?unread=true` 
      : ENDPOINTS.NOTIFICATIONS;
    return httpService.get<PaginatedResponse<Notification>>(url);
  }
  
  /**
   * Marquer une notification comme lue
   */
  async markAsRead(id: number | string): Promise<ApiResponse<Notification>> {
    return httpService.post<ApiResponse<Notification>>(ENDPOINTS.MARK_NOTIFICATION_READ(id));
  }
  
  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(): Promise<ApiResponse<{ count: number }>> {
    return httpService.post<ApiResponse<{ count: number }>>(ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ);
  }
  
  /**
   * Supprimer une notification
   */
  async deleteNotification(id: number | string): Promise<ApiResponse<null>> {
    return httpService.delete<ApiResponse<null>>(`${ENDPOINTS.NOTIFICATIONS}/${id}`);
  }
  
  /**
   * Obtenir le nombre de notifications non lues
   */
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return httpService.get<ApiResponse<{ count: number }>>(ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT);
  }
}

export const notificationService = new NotificationService();
