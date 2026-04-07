import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Menu, Search, Settings, Home } from 'lucide-react'
import NotificationDropdown from '../notifications/NotificationDropdown'
import ThemeSelector from '../ui/ThemeSelector'

interface DashboardHeaderProps {
  onMenuClick: () => void
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { user } = useAuth()
  // const { isDark, toggleTheme } = useTheme()
  const location = useLocation()

  // Get breadcrumb from path
  const getBreadcrumb = () => {
    const path = location.pathname.replace('/', '').replace('-', ' ')
    return path.charAt(0).toUpperCase() + path.slice(1) || 'Dashboard'
  }

  return (
    <header className="bg-white/80 dark:bg-neutral-950/50 backdrop-blur-sm px-4 lg:px-8 py-4 border-b border-gray-200 dark:border-white/[0.07] transition-colors duration-300" role="banner">
      <div className="flex items-center justify-between">
        {/* Left side - Breadcrumb */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Ouvrir le menu de navigation"
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-white" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:block">
            <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-white/40 mb-1">
              <Home className="w-4 h-4" />
              <span>/</span>
              <span>Dashboards</span>
              <span>/</span>
              <span className="text-gray-700 dark:text-white/70">{getBreadcrumb()}</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getBreadcrumb()}
            </h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 w-52">
            <Search className="w-4 h-4 text-gray-400 dark:text-white/40" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="bg-transparent border-none outline-none text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 w-full text-sm"
            />
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="hidden lg:block text-sm font-medium text-gray-800 dark:text-white">
              {user?.name?.split(' ')[0]}
            </span>
          </div>

          {/* Theme Toggle */}
          <ThemeSelector variant="compact" />

          {/* Settings */}
          <Link
            to="/settings"
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Paramètres"
          >
            <Settings className="w-5 h-5 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white" />
          </Link>

          {/* Notifications - Real-time dropdown */}
          <NotificationDropdown />
        </div>
      </div>
    </header>
  )
}
