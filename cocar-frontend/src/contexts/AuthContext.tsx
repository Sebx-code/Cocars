import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react'
import { User, LoginCredentials, RegisterData, AuthResponse } from '../types'
import { authApi } from '../services/api'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const response = await authApi.getUser()
        // Le backend retourne { success, data: User }
        const userData = (response.data as { data: User }).data || response.data
        setUser(userData as User)
      } catch (error) {
        // Token invalide - on supprime uniquement le token, pas les données utilisateur
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
      }
    }
    setIsLoading(false)
  }

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials)
    // Le backend retourne { success, message, data: { user, access_token, ... } }
    const authData = (response.data as { data: AuthResponse }).data
    
    // SÉCURITÉ: On ne stocke que le token, pas l'objet user complet
    localStorage.setItem('token', authData.access_token)
    if (authData.refresh_token) {
      localStorage.setItem('refresh_token', authData.refresh_token)
    }
    
    setUser(authData.user)
    toast.success(`Bienvenue ${authData.user.name} !`)
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    const response = await authApi.register(data)
    // Le backend retourne { success, message, data: { user, access_token, ... } }
    const authData = (response.data as { data: AuthResponse }).data
    
    // SÉCURITÉ: On ne stocke que le token, pas l'objet user complet
    localStorage.setItem('token', authData.access_token)
    if (authData.refresh_token) {
      localStorage.setItem('refresh_token', authData.refresh_token)
    }
    
    setUser(authData.user)
    toast.success('Compte créé avec succès !')
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch (error) {
      // Ignore error
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      setUser(null)
      toast.success('Déconnexion réussie')
    }
  }, [])

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser)
  }, [])

  const contextValue = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  }), [user, isLoading, login, register, logout, updateUser])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
