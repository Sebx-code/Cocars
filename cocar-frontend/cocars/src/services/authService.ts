// cocar-frontend/cocars/src/services/authService.ts
import { httpService } from './httpService';
import { ENDPOINTS } from '../config/api';
import { User } from '../types';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    token_type: string;
  };
}

class AuthService {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await httpService.post<AuthResponse>(
      ENDPOINTS.LOGIN,
      data,
      { skipAuth: true }
    );
    
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  }
  
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await httpService.post<AuthResponse>(
      ENDPOINTS.REGISTER,
      data,
      { skipAuth: true }
    );
    
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  }
  
  async logout(): Promise<void> {
    try {
      await httpService.post(ENDPOINTS.LOGOUT);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }
  
  async getCurrentUser(): Promise<User> {
    const response = await httpService.get<{ success: boolean; data: User }>(
      ENDPOINTS.ME
    );
    
    if (response.success) {
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    }
    
    throw new Error('Failed to fetch user');
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
  
  getUserRole(): 'user' | 'admin' | null {
    const user = this.getUser();
    return user?.role || null;
  }
}

export const authService = new AuthService();
