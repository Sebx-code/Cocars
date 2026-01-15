// cocar-frontend/cocars/src/services/httpService.ts
import { API_CONFIG } from '../config/api';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

class HttpService {
  private baseURL: string;
  
  constructor() {
    this.baseURL = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`;
  }
  
  private getHeaders(skipAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = { ...API_CONFIG.HEADERS };
    
    if (!skipAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }
  
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        // Token expiré, rediriger vers login
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Session expirée');
      }

      // Essayer d'extraire les messages de validation/erreur du backend
      let errorBody: Record<string, unknown> | null = null;
      try {
        errorBody = await response.clone().json();
      } catch (e) {
        // If JSON parsing fails, try to get text
        try {
          const text = await response.text();
          console.error(`API Error [${response.status}] - Raw Text:`, text);
        } catch (e2) {
          console.error(`API Error [${response.status}] - Could not parse response`);
        }
      }
      
      // Log error details for debugging
      console.error(`API Error [${response.status}] at ${response.url}:`, {
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        errorBody,
      });

      let validationMessage = `Erreur ${response.status}: ${response.statusText}`;
      
      if (errorBody) {
        if (typeof errorBody.message === 'string') {
          validationMessage = errorBody.message;
        } else if (errorBody.errors && typeof errorBody.errors === 'object') {
          const firstError = Object.values(errorBody.errors)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            validationMessage = String(firstError[0]);
          }
        } else if (typeof errorBody.error === 'string') {
          validationMessage = errorBody.error;
        }
      }

      throw new Error(validationMessage);
    }
    
    return response.json();
  }
  
  async get<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'GET',
      headers: this.getHeaders(options.skipAuth),
      ...options,
    });
    
    return this.handleResponse<T>(response);
  }
  
  async post<T, D = unknown>(url: string, data?: D, options: RequestOptions = {}): Promise<T> {
    const requestUrl = `${this.baseURL}${url}`;
    console.log(`[httpService] POST ${requestUrl}`, { data, options });
    
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: this.getHeaders(options.skipAuth),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    
    return this.handleResponse<T>(response);
  }
  
  async put<T, D = unknown>(url: string, data?: D, options: RequestOptions = {}): Promise<T> {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'PUT',
      headers: this.getHeaders(options.skipAuth),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    
    return this.handleResponse<T>(response);
  }
  
  async delete<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'DELETE',
      headers: this.getHeaders(options.skipAuth),
      ...options,
    });
    
    return this.handleResponse<T>(response);
  }
}

export const httpService = new HttpService();