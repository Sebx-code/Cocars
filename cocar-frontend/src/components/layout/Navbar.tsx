import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Menu, X, User, LogOut, LayoutDashboard, Search } from 'lucide-react'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border-b border-gray-200 dark:border-white/[0.07] transition-colors duration-300" role="navigation" aria-label="Navigation principale">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 no-underline" aria-label="Accueil CoCar">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="font-sora font-black text-neutral-950 text-base leading-none">C</span>
            </div>
            <span className="font-sora font-bold text-lg tracking-tight text-gray-900 dark:text-white">CoCar</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4" role="menubar" aria-label="Menu principal">
            <Link to="/feed" className="flex items-center gap-2 text-gray-500 dark:text-white/55 hover:text-gray-900 dark:hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors no-underline">
              Fil
            </Link>

            <Link to="/search" className="flex items-center gap-2 text-gray-500 dark:text-white/55 hover:text-gray-900 dark:hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors no-underline">
              <Search className="w-4 h-4" />
              Rechercher
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/create-trip" className="bg-white hover:bg-neutral-100 text-neutral-950 text-sm font-semibold px-5 py-2 rounded-full transition-colors no-underline shadow-sm">
                  Proposer un trajet
                </Link>
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    aria-label="Menu utilisateur"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="menu"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold shadow-md">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:block font-medium text-gray-900 dark:text-white text-sm">
                      {user?.name}
                    </span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-[0_32px_80px_rgba(0,0,0,.55)] py-2 animate-fadeIn">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 text-sm transition-colors no-underline"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 text-sm transition-colors no-underline"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-5 h-5" />
                        Mon profil
                      </Link>
                      <hr className="my-2 border-white/10" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full text-sm transition-colors"
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
                <Link to="/login" className="text-gray-500 dark:text-white/55 hover:text-gray-900 dark:hover:text-white font-medium text-sm px-4 py-2 no-underline transition-colors">
                  Connexion
                </Link>
                <Link to="/register" className="bg-white hover:bg-neutral-100 text-neutral-950 text-sm font-semibold px-5 py-2 rounded-full transition-colors no-underline shadow-sm">
                  S'inscrire
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X className="w-6 h-6 text-gray-900 dark:text-white" /> : <Menu className="w-6 h-6 text-gray-900 dark:text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div id="mobile-menu" className="md:hidden bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-white/[0.07] animate-fadeIn shadow-[0_32px_80px_rgba(0,0,0,.55)]" role="menu" aria-label="Menu mobile">
          <div className="px-4 py-6 space-y-4">
            <Link to="/feed" className="block py-2 font-medium text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white text-sm transition-colors no-underline" onClick={() => setIsMenuOpen(false)}>
              Fil d'actualité
            </Link>
            <Link to="/search" className="block py-2 font-medium text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white text-sm transition-colors no-underline" onClick={() => setIsMenuOpen(false)}>
              Rechercher un trajet
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block py-2 font-medium text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white text-sm transition-colors no-underline" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/create-trip" className="block py-2 font-medium text-emerald-400 hover:text-emerald-300 text-sm transition-colors no-underline" onClick={() => setIsMenuOpen(false)}>
                  Proposer un trajet
                </Link>
                <button onClick={handleLogout} className="block py-2 font-medium text-red-400 hover:text-red-300 text-sm transition-colors">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 font-medium text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white text-sm transition-colors no-underline" onClick={() => setIsMenuOpen(false)}>
                  Connexion
                </Link>
                <Link to="/register" className="bg-white hover:bg-neutral-100 text-neutral-950 text-sm font-semibold px-5 py-2.5 rounded-full transition-colors no-underline shadow-sm w-full text-center block" onClick={() => setIsMenuOpen(false)}>
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
