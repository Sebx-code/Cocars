// cocar-frontend/cocars/src/services/messageService.ts
import { httpService } from './httpService';
import type { 
  ApiResponse, 
  Conversation, 
  Message, 
  CreateSupportConversationData, 
  SendMessageData 
} from '../types';

class MessageService {
  /**
   * Récupérer toutes les conversations de l'utilisateur
   */
  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    return httpService.get<ApiResponse<Conversation[]>>('/conversations');
  }

  /**
   * Récupérer les messages d'une conversation
   */
  async getMessages(conversationId: number): Promise<ApiResponse<Message[]>> {
    return httpService.get<ApiResponse<Message[]>>(`/conversations/${conversationId}/messages`);
  }

  /**
   * Envoyer un message dans une conversation
   */
  async sendMessage(conversationId: number, data: SendMessageData): Promise<ApiResponse<Message>> {
    return httpService.post<ApiResponse<Message>, SendMessageData>(
      `/conversations/${conversationId}/messages`,
      data
    );
  }

  /**
   * Créer ou récupérer une conversation pour un trajet
   */
  async getOrCreateTripConversation(tripId: number): Promise<ApiResponse<{ conversation_id: number }>> {
    return httpService.post<ApiResponse<{ conversation_id: number }>>(
      `/conversations/trip/${tripId}`
    );
  }

  /**
   * Créer une conversation de support avec admin
   */
  async createSupportConversation(data: CreateSupportConversationData): Promise<ApiResponse<{
    conversation: Conversation;
    message: Message;
  }>> {
    return httpService.post<ApiResponse<{
      conversation: Conversation;
      message: Message;
    }>, CreateSupportConversationData>('/conversations/support', data);
  }

  /**
   * Récupérer le nombre de messages non lus
   */
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return httpService.get<ApiResponse<{ count: number }>>('/messages/unread-count');
  }
}

export default new MessageService();
