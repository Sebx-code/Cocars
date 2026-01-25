import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { Menu, Search, Sun, Moon, Settings, Home } from 'lucide-react'
import NotificationDropdown from '../notifications/NotificationDropdown'

interface DashboardHeaderProps {
  onMenuClick: () => void
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { isDark, toggleTheme } = useTheme()
  const { user } = useAuth()
  const location = useLocation()

  // Get breadcrumb from path
  const getBreadcrumb = () => {
    const path = location.pathname.replace('/', '').replace('-', ' ')
    return path.charAt(0).toUpperCase() + path.slice(1) || 'Dashboard'
  }

  return (
    <header className="bg-transparent px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Breadcrumb */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-white/50 dark:hover:bg-slate-700 rounded-xl"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:block">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
              <Home className="w-4 h-4" />
              <span>/</span>
              <span>Dashboards</span>
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

          {/* User Avatar */}
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-200">
              {user?.name?.split(' ')[0]}
            </span>
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

          {/* Settings */}
          <Link
            to="/settings"
            className="p-2 hover:bg-white/80 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </Link>

          {/* Notifications - Real-time dropdown */}
          <NotificationDropdown />
        </div>
      </div>
    </header>
  )
}
