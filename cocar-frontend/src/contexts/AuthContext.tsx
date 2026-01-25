import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
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
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
      }
    }
    setIsLoading(false)
  }

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials)
    // Le backend retourne { success, message, data: { user, access_token, ... } }
    const authData = (response.data as { data: AuthResponse }).data
    
    localStorage.setItem('token', authData.access_token)
    if (authData.refresh_token) {
      localStorage.setItem('refresh_token', authData.refresh_token)
    }
    
    setUser(authData.user)
    toast.success(`Bienvenue ${authData.user.name} !`)
  }

  const register = async (data: RegisterData) => {
    const response = await authApi.register(data)
    // Le backend retourne { success, message, data: { user, access_token, ... } }
    const authData = (response.data as { data: AuthResponse }).data
    
    localStorage.setItem('token', authData.access_token)
    if (authData.refresh_token) {
      localStorage.setItem('refresh_token', authData.refresh_token)
    }
    
    setUser(authData.user)
    toast.success('Compte créé avec succès !')
  }

  const logout = async () => {
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
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateUser,
    }}>
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
