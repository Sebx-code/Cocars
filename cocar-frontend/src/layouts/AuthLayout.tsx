import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleLeftImageError = (e: any) => {
    e.currentTarget.src = '/rideshare1.png'
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-neutral-950">
      {/* Left side - Branding with image */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-0 relative overflow-hidden">
        <img
          src="/login-left.jpg"
          alt="CoCar passagers"
          onError={handleLeftImageError}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />

        <div className="max-w-md text-white text-center relative z-10 p-12">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <span className="font-sora font-black text-neutral-950 text-2xl leading-none">C</span>
            </div>
            <span className="font-sora font-bold text-4xl tracking-tight">CoCar</span>
          </div>

          <p className="text-xl text-white/90 mb-12 font-medium">
            Partagez vos trajets, économisez ensemble
          </p>

          <div className="grid grid-cols-2 gap-8 mt-12">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-white/70 text-sm">Utilisateurs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">100K+</div>
              <div className="text-white/70 text-sm">Trajets</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-neutral-900">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
