import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Car, X, LayoutDashboard, Route, PlusCircle, CalendarCheck, 
  MessageSquare, Bell, User, CarFront, Settings, LogOut,
  ChevronDown, Shield, Wallet, Users
} from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Route, label: 'Mes trajets', path: '/my-trips' },
  { icon: PlusCircle, label: 'Créer un trajet', path: '/create-trip' },
  { icon: CalendarCheck, label: 'Mes réservations', path: '/my-bookings' },
  { icon: Users, label: 'Réservations reçues', path: '/driver-bookings' },
  { icon: MessageSquare, label: 'Messages', path: '/messages' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
]

const settingsItems = [
  { icon: User, label: 'Mon profil', path: '/profile' },
  { icon: CarFront, label: 'Mes véhicules', path: '/vehicles' },
  { icon: Wallet, label: 'Portefeuille', path: '/wallet' },
  { icon: Settings, label: 'Paramètres', path: '/settings' },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Argon Style with Green Gradient */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 z-50
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 overflow-hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Green gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500 via-emerald-600 to-teal-700" />
        
        {/* Content */}
        <div className="relative h-full flex flex-col text-white">
          {/* Header / Logo */}
          <div className="h-20 flex items-center justify-between px-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">CoCar</span>
                <span className="text-xs text-white/70">Dashboard</span>
              </div>
            </Link>
            <button onClick={onClose} className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Divider */}
          <div className="mx-4 h-px bg-white/20" />

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {/* Pages Section */}
            <div className="mb-4">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-white/60 uppercase tracking-wider hover:text-white/80 transition-colors"
              >
                <span>Pages</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {menuOpen && (
                <ul className="mt-2 space-y-1">
                  {menuItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={onClose}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-lg font-medium
                          transition-all duration-200
                          ${isActive(item.path) 
                            ? 'bg-white text-emerald-600 shadow-lg' 
                            : 'text-white/80 hover:bg-white/10 hover:text-white'}
                        `}
                      >
                        <div className={`
                          w-8 h-8 rounded-lg flex items-center justify-center
                          ${isActive(item.path) 
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md' 
                            : 'bg-white/10'}
                        `}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Settings Section */}
            <div className="mb-4">
              <button 
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-white/60 uppercase tracking-wider hover:text-white/80 transition-colors"
              >
                <span>Compte</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {settingsOpen && (
                <ul className="mt-2 space-y-1">
                  {settingsItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={onClose}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-lg font-medium
                          transition-all duration-200
                          ${isActive(item.path) 
                            ? 'bg-white text-emerald-600 shadow-lg' 
                            : 'text-white/80 hover:bg-white/10 hover:text-white'}
                        `}
                      >
                        <div className={`
                          w-8 h-8 rounded-lg flex items-center justify-center
                          ${isActive(item.path) 
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md' 
                            : 'bg-white/10'}
                        `}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Admin Link - Only for admins */}
            {user?.role === 'admin' && (
              <div className="mb-4">
                <p className="px-4 py-2 text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Administration
                </p>
                <ul className="mt-2 space-y-1">
                  <li>
                    <Link
                      to="/admin"
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-md">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm">Panel Admin</span>
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </nav>

          {/* User Card at Bottom */}
          <div className="p-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{user?.name}</p>
                  <p className="text-xs text-white/60 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/90 text-sm font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
