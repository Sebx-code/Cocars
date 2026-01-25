import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Car } from 'lucide-react'

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-header items-center justify-center p-12">
        <div className="max-w-md text-white text-center">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <Car className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold mb-4">CoCar</h1>
          <p className="text-xl text-white/80 mb-8">
            Partagez vos trajets, économisez ensemble
          </p>
          <div className="grid grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-white/70 text-sm">Utilisateurs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">100K+</div>
              <div className="text-white/70 text-sm">Trajets</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">200T</div>
              <div className="text-white/70 text-sm">CO₂ économisé</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-slate-900">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
