import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  X, LayoutDashboard, Route, PlusCircle, CalendarCheck, 
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
  { icon: Route, label: 'Fil des trajets', path: '/trip-feed' },
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

      {/* Sidebar - Dark Modern Theme */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 z-50
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-white/[0.07]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Content */}
        <div className="h-full flex flex-col">
          {/* Header / Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-white/[0.07]">
            <Link to="/" className="flex items-center gap-3 no-underline">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="font-sora font-black text-neutral-950 text-base leading-none">C</span>
              </div>
              <span className="font-sora font-bold text-lg tracking-tight text-gray-900 dark:text-white">CoCar</span>
            </Link>
            <button onClick={onClose} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-700 dark:text-white" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {/* Pages Section */}
            <div className="mb-4">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-400 dark:text-white/40 uppercase tracking-wider hover:text-gray-600 dark:hover:text-white/60 transition-colors"
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
                          flex items-center gap-3 px-4 py-3 rounded-xl font-medium
                          transition-all duration-200 no-underline
                          ${isActive(item.path) 
                            ? 'bg-gray-100 dark:bg-white/[0.08] text-gray-900 dark:text-white border border-gray-200 dark:border-white/[0.12]' 
                            : 'text-gray-600 dark:text-white/55 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-gray-200 dark:hover:border-white/[0.07]'}
                        `}
                      >
                        <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-white/40'}`} />
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
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-400 dark:text-white/40 uppercase tracking-wider hover:text-gray-600 dark:hover:text-white/60 transition-colors"
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
                          flex items-center gap-3 px-4 py-3 rounded-xl font-medium
                          transition-all duration-200 no-underline
                          ${isActive(item.path) 
                            ? 'bg-gray-100 dark:bg-white/[0.08] text-gray-900 dark:text-white border border-gray-200 dark:border-white/[0.12]' 
                            : 'text-gray-600 dark:text-white/55 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-gray-200 dark:hover:border-white/[0.07]'}
                        `}
                      >
                        <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-white/40'}`} />
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
                <p className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-white/40 uppercase tracking-wider">
                  Administration
                </p>
                <ul className="mt-2 space-y-1">
                  <li>
                    <Link
                      to="/admin"
                      onClick={onClose}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl font-medium
                        transition-all duration-200 no-underline
                        ${isActive('/admin') 
                          ? 'bg-gray-100 dark:bg-white/[0.08] text-gray-900 dark:text-white border border-gray-200 dark:border-white/[0.12]' 
                          : 'text-gray-600 dark:text-white/55 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-gray-200 dark:hover:border-white/[0.07]'}
                      `}
                    >
                      <Shield className={`w-5 h-5 ${isActive('/admin') ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-white/40'}`} />
                      <span className="text-sm">Panel Admin</span>
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </nav>

          {/* User Card at Bottom */}
          <div className="p-4 border-t border-gray-200 dark:border-white/[0.07]">
            <div className="mb-3">
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.07]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-white/40 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/[0.05] hover:bg-gray-200 dark:hover:bg-white/[0.08] border border-gray-200 dark:border-white/[0.07] rounded-xl text-gray-700 dark:text-white/90 text-sm font-medium transition-all"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
