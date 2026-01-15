// cocar-frontend/cocars/src/hooks/useAuth.tsx
import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';

interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(authService.getUser());
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Vérifier l'authentification au chargement
    const checkAuth = async () => {
      const storedToken = authService.getToken();
      
      if (storedToken) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          setToken(storedToken);
        } catch (error) {
          // Token invalide, nettoyer
          authService.logout();
          setUser(null);
          setToken(null);
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({
        email,
        password,
      });
      
      setUser(response.data.user);
      setToken(response.data.token);
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      setUser(response.data.user);
      setToken(response.data.token);
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };
  
  const refreshUser = async () => {
    if (token) {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}