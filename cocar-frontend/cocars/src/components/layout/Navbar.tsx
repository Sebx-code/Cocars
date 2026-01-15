// src/components/layout/Navbar.tsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Bell, User, LogOut, Car, Calendar, Star, Sun, Moon, Shield } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../contexts/themeContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-theme sticky top-0 bg-theme-primary z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-black dark:bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-yellow-400 dark:text-black font-bold text-lg">Rs</span>
              </div>
              <span className="text-xl font-bold text-theme-primary">Rideshare</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/trips"
                className={`font-medium transition-colors ${
                  isActive("/trips")
                    ? "text-theme-primary"
                    : "text-theme-secondary hover:text-theme-primary"
                }`}
              >
                Rechercher
              </Link>
              <Link
                to="/trips/create"
                className={`font-medium transition-colors ${
                  isActive("/trips/create")
                    ? "text-theme-primary"
                    : "text-theme-secondary hover:text-theme-primary"
                }`}
              >
                Proposer un trajet
              </Link>
            </div>
          </div>

          {/* Desktop Auth / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover-theme rounded-full transition-colors"
              title={isDark ? "Mode clair" : "Mode sombre"}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-theme-secondary" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Admin Link */}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="p-2 hover-theme rounded-full transition-colors"
                    title="Administration"
                  >
                    <Shield className="w-5 h-5 text-theme-secondary" />
                  </Link>
                )}

                {/* Notifications */}
                <Link
                  to="/user/notifications"
                  className="relative p-2 hover-theme rounded-full transition-colors"
                >
                  <Bell className="w-5 h-5 text-theme-secondary" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 pr-3 hover-theme rounded-full transition-colors"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                      <span className="font-bold text-black text-sm">
                        {user?.name?.split(" ").map((n) => n[0]).join("") || "U"}
                      </span>
                    </div>
                    <span className="font-medium text-theme-primary max-w-[100px] truncate">
                      {user?.name?.split(" ")[0]}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 card-theme rounded-2xl shadow-xl border-2 py-2 z-50">
                      <div className="px-4 py-3 border-b border-theme">
                        <p className="font-semibold text-theme-primary">{user?.name}</p>
                        <p className="text-sm text-theme-tertiary truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/user"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-theme-secondary hover-theme transition-colors"
                      >
                        <User className="w-5 h-5" />
                        Mon tableau de bord
                      </Link>
                      <Link
                        to="/user/my-trips"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-theme-secondary hover-theme transition-colors"
                      >
                        <Car className="w-5 h-5" />
                        Mes trajets
                      </Link>
                      <Link
                        to="/user/bookings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-theme-secondary hover-theme transition-colors"
                      >
                        <Calendar className="w-5 h-5" />
                        Mes réservations
                      </Link>
                      <Link
                        to="/user/ratings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-theme-secondary hover-theme transition-colors"
                      >
                        <Star className="w-5 h-5" />
                        Mes évaluations
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-theme-secondary hover-theme transition-colors"
                        >
                          <Shield className="w-5 h-5" />
                          Administration
                        </Link>
                      )}
                      <div className="border-t border-theme mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
                        >
                          <LogOut className="w-5 h-5" />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-theme-secondary hover:text-theme-primary font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/signup"
                  className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2.5 rounded-full font-semibold transition-all hover:scale-105"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Theme Toggle Mobile */}
            <button
              onClick={toggleTheme}
              className="p-2 hover-theme rounded-full transition-colors"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-theme-secondary" />
              )}
            </button>
            <button
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-theme-secondary" />
              ) : (
                <Menu className="w-6 h-6 text-theme-secondary" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-theme py-4 px-4 space-y-3 bg-theme-primary">
          <Link
            to="/trips"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-left text-theme-secondary hover:text-theme-primary font-medium py-2"
          >
            Rechercher
          </Link>
          <Link
            to="/trips/create"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-left text-theme-secondary hover:text-theme-primary font-medium py-2"
          >
            Proposer un trajet
          </Link>

          {isAuthenticated ? (
            <>
              <div className="border-t border-theme pt-3 mt-3">
                <Link
                  to="/user"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left text-theme-secondary hover:text-theme-primary font-medium py-2"
                >
                  Mon tableau de bord
                </Link>
                <Link
                  to="/user/my-trips"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left text-theme-secondary hover:text-theme-primary font-medium py-2"
                >
                  Mes trajets
                </Link>
                <Link
                  to="/user/bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left text-theme-secondary hover:text-theme-primary font-medium py-2"
                >
                  Mes réservations
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left text-theme-secondary hover:text-theme-primary font-medium py-2"
                  >
                    Administration
                  </Link>
                )}
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left text-red-600 font-medium py-2"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-left text-theme-secondary hover:text-theme-primary font-medium py-2"
              >
                Connexion
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full bg-yellow-400 hover:bg-yellow-500 text-black text-center px-6 py-2.5 rounded-full font-semibold"
              >
                Inscription
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
