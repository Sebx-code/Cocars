// src/services/paymentService.ts
import { httpService } from './httpService';
import { ENDPOINTS } from '../config/api';
import type { 
  Payment, 
  ProcessPaymentData, 
  PaymentMethod,
  ApiResponse 
} from '../types';

interface PaymentMethodInfo {
  id: PaymentMethod;
  name: string;
  icon: string;
  available: boolean;
  description?: string;
}

class PaymentService {
  /**
   * Traiter un paiement
   */
  async processPayment(data: ProcessPaymentData): Promise<ApiResponse<Payment>> {
    return httpService.post<ApiResponse<Payment>>(ENDPOINTS.PROCESS_PAYMENT, data);
  }
  
  /**
   * Obtenir les méthodes de paiement disponibles
   */
  async getPaymentMethods(): Promise<ApiResponse<PaymentMethodInfo[]>> {
    return httpService.get<ApiResponse<PaymentMethodInfo[]>>(ENDPOINTS.PAYMENT_METHODS);
  }
  
  /**
   * Obtenir l'historique des paiements
   */
  async getPaymentHistory(): Promise<ApiResponse<Payment[]>> {
    return httpService.get<ApiResponse<Payment[]>>(ENDPOINTS.PAYMENT_HISTORY);
  }
  
  /**
   * Obtenir les détails d'un paiement
   */
  async getPaymentById(id: number | string): Promise<ApiResponse<Payment>> {
    return httpService.get<ApiResponse<Payment>>(`${ENDPOINTS.PAYMENTS}/${id}`);
  }
  
  /**
   * Vérifier le statut d'un paiement
   */
  async checkPaymentStatus(transactionId: string): Promise<ApiResponse<Payment>> {
    return httpService.get<ApiResponse<Payment>>(
      ENDPOINTS.PAYMENT_STATUS(transactionId)
    );
  }
  
  /**
   * Confirmer un paiement en espèces (conducteur)
   */
  async confirmCashPayment(paymentId: number | string): Promise<ApiResponse<Payment>> {
    return httpService.post<ApiResponse<Payment>>(
      ENDPOINTS.CONFIRM_CASH_PAYMENT(paymentId)
    );
  }
}

export const paymentService = new PaymentService();
