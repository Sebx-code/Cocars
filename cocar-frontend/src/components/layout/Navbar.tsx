import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { Car, Menu, X, Sun, Moon, User, LogOut, LayoutDashboard, Search } from 'lucide-react'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-argon">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800 dark:text-white">CoCar</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/search" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors text-sm">
              <Search className="w-4 h-4" />
              Rechercher
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/create-trip" className="btn-primary">
                  Proposer un trajet
                </Link>
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold shadow-md">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:block font-medium text-gray-700 dark:text-gray-300 text-sm">
                      {user?.name}
                    </span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-argon-lg border border-gray-100 dark:border-slate-700 py-2 animate-fadeIn">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 text-sm"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-5 h-5" />
                        Mon profil
                      </Link>
                      <hr className="my-2 border-gray-200 dark:border-slate-700" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-sm"
                      >
                        <LogOut className="w-5 h-5" />
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 font-medium text-sm px-4 py-2">
                  Connexion
                </Link>
                <Link to="/register" className="btn-primary">
                  S'inscrire
                </Link>
              </div>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-500" />}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-700 animate-fadeIn shadow-argon">
          <div className="px-4 py-6 space-y-4">
            <Link to="/search" className="block py-2 font-medium text-gray-700 dark:text-gray-300 text-sm" onClick={() => setIsMenuOpen(false)}>
              Rechercher un trajet
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block py-2 font-medium text-gray-700 dark:text-gray-300 text-sm" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/create-trip" className="block py-2 font-medium text-emerald-600 text-sm" onClick={() => setIsMenuOpen(false)}>
                  Proposer un trajet
                </Link>
                <button onClick={handleLogout} className="block py-2 font-medium text-red-600 text-sm">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 font-medium text-gray-700 dark:text-gray-300 text-sm" onClick={() => setIsMenuOpen(false)}>
                  Connexion
                </Link>
                <Link to="/register" className="btn-primary w-full text-center" onClick={() => setIsMenuOpen(false)}>
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
