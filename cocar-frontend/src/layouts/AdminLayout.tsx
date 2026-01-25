import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { 
  LayoutDashboard, Users, Route, CalendarCheck, 
  CreditCard, Settings, LogOut, Menu, X, Sun, Moon,
  Bell, Search, ChevronDown, Shield, BarChart3, Home
} from 'lucide-react'

const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Users, label: 'Utilisateurs', path: '/admin/users' },
  { icon: Route, label: 'Trajets', path: '/admin/trips' },
  { icon: CalendarCheck, label: 'Réservations', path: '/admin/bookings' },
  { icon: CreditCard, label: 'Paiements', path: '/admin/payments' },
  { icon: BarChart3, label: 'Rapports', path: '/admin/reports' },
  { icon: Settings, label: 'Paramètres', path: '/admin/settings' },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  // Get breadcrumb from path
  const getBreadcrumb = () => {
    const path = location.pathname.replace('/admin', '').replace('/', '').replace('-', ' ')
    return path.charAt(0).toUpperCase() + path.slice(1) || 'Dashboard'
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Admin - Dark theme */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 z-50
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-900" />
        
        {/* Content */}
        <div className="relative h-full flex flex-col text-white">
          {/* Header / Logo */}
          <div className="h-20 flex items-center justify-between px-6">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">CoCar</span>
                <span className="text-xs text-white/60">Administration</span>
              </div>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Divider */}
          <div className="mx-4 h-px bg-white/10" />

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {/* Menu Section */}
            <div className="mb-4">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider hover:text-white/60 transition-colors"
              >
                <span>Menu Admin</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {menuOpen && (
                <ul className="mt-2 space-y-1">
                  {adminMenuItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-lg font-medium
                          transition-all duration-200
                          ${isActive(item.path) 
                            ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg' 
                            : 'text-white/70 hover:bg-white/10 hover:text-white'}
                        `}
                      >
                        <div className={`
                          w-8 h-8 rounded-lg flex items-center justify-center
                          ${isActive(item.path) 
                            ? 'bg-white/20' 
                            : 'bg-white/5'}
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

            {/* Quick Links */}
            <div className="mb-4">
              <p className="px-4 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
                Liens rapides
              </p>
              <ul className="mt-2 space-y-1">
                <li>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <Home className="w-4 h-4" />
                    </div>
                    <span className="text-sm">Retour au site</span>
                  </Link>
                </li>
              </ul>
            </div>
          </nav>

          {/* User Card at Bottom */}
          <div className="p-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold shadow-md">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{user?.name}</p>
                  <p className="text-xs text-white/50 truncate">Administrateur</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/90 text-sm font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="bg-transparent px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Breadcrumb */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-white/50 dark:hover:bg-slate-700 rounded-xl"
              >
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Breadcrumb */}
              <div className="hidden sm:block">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <Shield className="w-4 h-4" />
                  <span>/</span>
                  <span>Admin</span>
                  <span>/</span>
                  <span className="text-gray-700 dark:text-gray-200">{getBreadcrumb()}</span>
                </div>
                <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {getBreadcrumb()}
                </h1>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 w-52 shadow-sm">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400 w-full text-sm"
                />
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-white/80 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {/* Notifications */}
              <button className="relative p-2 hover:bg-white/80 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                  3
                </span>
              </button>
            </div>
          </div>
        </header>
        
        <main className="px-4 lg:px-8 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
