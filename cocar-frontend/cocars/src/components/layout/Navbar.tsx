// src/components/layout/Navbar.tsx
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Bell,
  User,
  LogOut,
  Car,
  Calendar,
  Star,
  Sun,
  Moon,
  Shield,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../contexts/themeContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const { user, isAuthenticated, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Close on outside click / route change
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;

      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }

      if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [userMenuOpen, mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="border-b border-theme sticky top-0 z-50 bg-theme-primary/90 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left */}
          <div className="flex items-center gap-8">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-emerald-600 dark:bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white dark:text-slate-950 font-bold text-lg">Rs</span>
                </div>
                <span className="text-xl font-bold text-theme-primary">Rideshare</span>
              </Link>
            </motion.div>

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

          {/* Right */}
          <div className="hidden md:flex items-center gap-3">
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover-theme rounded-full"
              title={isDark ? "Mode clair" : "Mode sombre"}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-emerald-400" />
              ) : (
                <Moon className="w-5 h-5 text-theme-secondary" />
              )}
            </motion.button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {user?.role === "admin" && (
                  <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}>
                    <Link
                      to="/admin"
                      className="p-2 hover-theme rounded-full"
                      title="Administration"
                    >
                      <Shield className="w-5 h-5 text-theme-secondary" />
                    </Link>
                  </motion.div>
                )}

                <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    to="/user/notifications"
                    className="relative p-2 hover-theme rounded-full"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5 text-theme-secondary" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  </Link>
                </motion.div>

                <div className="relative" ref={userMenuRef}>
                  <motion.button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 p-1 pr-3 hover-theme rounded-full"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <span className="font-bold text-white text-sm">
                        {user?.name?.split(" ").map((n) => n[0]).join("") || "U"}
                      </span>
                    </div>
                    <span className="font-medium text-theme-primary max-w-[100px] truncate">
                      {user?.name?.split(" ")[0] || "Utilisateur"}
                    </span>
                  </motion.button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute right-0 mt-2 w-64 card-theme rounded-2xl shadow-professional-lg border border-theme overflow-hidden"
                        role="menu"
                      >
                        <div className="px-4 py-3 border-b border-theme">
                          <p className="font-semibold text-theme-primary">{user?.name}</p>
                          <p className="text-sm text-theme-tertiary truncate">{user?.email}</p>
                        </div>

                        <div className="py-2">
                          <Link
                            to="/user"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-theme-secondary hover-theme"
                            role="menuitem"
                          >
                            <User className="w-5 h-5" />
                            Mon tableau de bord
                          </Link>
                          <Link
                            to="/user/my-trips"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-theme-secondary hover-theme"
                            role="menuitem"
                          >
                            <Car className="w-5 h-5" />
                            Mes trajets
                          </Link>
                          <Link
                            to="/user/bookings"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-theme-secondary hover-theme"
                            role="menuitem"
                          >
                            <Calendar className="w-5 h-5" />
                            Mes réservations
                          </Link>
                          <Link
                            to="/user/ratings"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-theme-secondary hover-theme"
                            role="menuitem"
                          >
                            <Star className="w-5 h-5" />
                            Mes évaluations
                          </Link>
                          {user?.role === "admin" && (
                            <Link
                              to="/admin"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-theme-secondary hover-theme"
                              role="menuitem"
                            >
                              <Shield className="w-5 h-5" />
                              Administration
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-theme p-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl w-full"
                            role="menuitem"
                          >
                            <LogOut className="w-5 h-5" />
                            Déconnexion
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-theme-secondary hover:text-theme-primary font-medium px-4 py-2 rounded-lg"
                >
                  Connexion
                </Link>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/signup"
                    className="btn-primary"
                  >
                    Inscription
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover-theme rounded-full"
              aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-emerald-400" />
              ) : (
                <Moon className="w-5 h-5 text-theme-secondary" />
              )}
            </motion.button>

            <motion.button
              onClick={() => setMobileMenuOpen((v) => !v)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full hover-theme"
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-theme-secondary" />
              ) : (
                <Menu className="w-6 h-6 text-theme-secondary" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden border-t border-theme bg-theme-primary"
          >
            <div className="py-4 px-4 space-y-3">
              <Link
                to="/trips"
                className="block w-full text-left text-theme-secondary hover:text-theme-primary font-medium py-2"
              >
                Rechercher
              </Link>
              <Link
                to="/trips/create"
                className="block w-full text-left text-theme-secondary hover:text-theme-primary font-medium py-2"
              >
                Proposer un trajet
              </Link>

              {isAuthenticated ? (
                <>
                  <div className="border-t border-theme pt-3 mt-3">
                    <Link
                      to="/user"
                      className="block w-full text-left text-theme-secondary hover:text-theme-primary font-medium py-2"
                    >
                      Mon tableau de bord
                    </Link>
                    <Link
                      to="/user/my-trips"
                      className="block w-full text-left text-theme-secondary hover:text-theme-primary font-medium py-2"
                    >
                      Mes trajets
                    </Link>
                    <Link
                      to="/user/bookings"
                      className="block w-full text-left text-theme-secondary hover:text-theme-primary font-medium py-2"
                    >
                      Mes réservations
                    </Link>
                    {user?.role === "admin" && (
                      <Link
                        to="/admin"
                        className="block w-full text-left text-theme-secondary hover:text-theme-primary font-medium py-2"
                      >
                        Administration
                      </Link>
                    )}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-red-600 font-medium py-2"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block w-full text-left text-theme-secondary hover:text-theme-primary font-medium py-2"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/signup"
                    className="block w-full btn-primary text-center"
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
