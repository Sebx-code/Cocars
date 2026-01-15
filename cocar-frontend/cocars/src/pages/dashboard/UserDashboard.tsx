// src/pages/dashboard/UserDashboard.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  Home,
  Car,
  Calendar,
  Star,
  User as UserIcon,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  MapPin,
  Wallet,
  Plus,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/userService";
import type { User, UserStats } from "../../types";

const NAVIGATION = [
  { name: "Tableau de bord", href: "/user", icon: Home },
  { name: "Mes trajets", href: "/user/my-trips", icon: Car },
  { name: "Mes réservations", href: "/user/bookings", icon: Calendar },
  { name: "Mes évaluations", href: "/user/ratings", icon: Star },
  { name: "Mon profil", href: "/user/profile", icon: UserIcon },
  { name: "Notifications", href: "/user/notifications", icon: Bell },
];

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    // Desktop breakpoint aligned with Tailwind `lg` (1024px)
    const mql = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mql.matches);
    update();

    // Support Safari/older browsers
    if (mql.addEventListener) mql.addEventListener("change", update);
    else mql.addListener(update);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", update);
      else mql.removeListener(update);
    };
  }, []);

  useEffect(() => {
    (async () => {
      setStatsLoading(true);
      try {
        const response = await userService.getUserStats();
        setStats(response.data);
      } catch {
        setStats(null);
      } finally {
        setStatsLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === "/user") return location.pathname === "/user";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        // Desktop: sidebar always visible. Mobile: animated.
        animate={{ x: isDesktop ? 0 : sidebarOpen ? 0 : -288 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="fixed top-0 left-0 h-full w-72 bg-white border-r-2 border-gray-100 z-50"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b-2 border-gray-100">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <span className="text-yellow-400 font-bold">Rs</span>
              </div>
              <span className="text-xl font-bold">Rideshare</span>
            </Link>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User info */}
          <div className="p-5 border-b-2 border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="font-bold text-black text-lg">
                  {user?.name?.split(" ").map((n) => n[0]).join("") || "U"}
                </span>
              </div>
              <div>
                <p className="font-bold text-gray-900">{user?.name || "Utilisateur"}</p>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{stats?.average_rating ?? "-"}</span>
                  <span className="text-gray-400">({stats?.total_ratings ?? 0} avis)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {NAVIGATION.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-medium ${
                    active
                      ? "bg-yellow-400 text-black shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="p-4 border-t-2 border-gray-100 space-y-3">
            <Link
              to="/trips/create"
              className="flex items-center justify-center gap-2 w-full bg-black text-white py-3.5 rounded-full font-bold hover:bg-gray-900 transition-all"
            >
              <Plus className="w-5 h-5" />
              Proposer un trajet
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-2xl transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="lg:ml-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b-2 border-gray-100">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:flex-none">
              <h1 className="text-lg font-bold text-gray-900 lg:hidden">
                {NAVIGATION.find((n) => isActive(n.href))?.name || "Dashboard"}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/trips"
                className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-black font-medium"
              >
                <MapPin className="w-5 h-5" />
                Rechercher
              </Link>
              <Link
                to="/user/notifications"
                className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {location.pathname === "/user" ? (
            <DashboardHome stats={stats} statsLoading={statsLoading} user={user} />
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}

function DashboardHome({
  stats,
  statsLoading,
  user,
}: {
  stats: UserStats | null;
  statsLoading: boolean;
  user: User | null;
}) { 
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-3xl p-8 text-black shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          Bonjour, {user?.name?.split(" ")[0] || "Utilisateur"} ! 👋
        </h1>
        <p className="text-black/80 text-lg">
          Vous avez {stats?.upcoming_trips ?? 0} trajet{(stats?.upcoming_trips ?? 0) > 1 ? "s" : ""} à venir.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Car} label="Trajets conducteur" value={stats?.total_trips_as_driver ?? 0} color="blue" loading={statsLoading} />
        <StatCard icon={MapPin} label="Trajets passager" value={stats?.total_trips_as_passenger ?? 0} color="green" loading={statsLoading} />
        <StatCard icon={TrendingUp} label="Gains totaux" value={`${(stats?.total_earnings ?? 0).toLocaleString()} F`} color="yellow" loading={statsLoading} />
        <StatCard icon={Wallet} label="Dépenses" value={`${(stats?.total_spent ?? 0).toLocaleString()} F`} color="purple" loading={statsLoading} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/trips/create"
          className="bg-white rounded-3xl border-2 border-gray-100 p-6 hover:border-black hover:shadow-xl transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mb-4">
                <Car className="w-7 h-7 text-yellow-600" />
              </div>
              <h3 className="font-bold text-xl text-gray-900">Proposer un trajet</h3>
              <p className="text-gray-500 mt-1">Publiez votre prochain trajet</p>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-black transition-colors" />
          </div>
        </Link>

        <Link
          to="/trips"
          className="bg-white rounded-3xl border-2 border-gray-100 p-6 hover:border-black hover:shadow-xl transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                <MapPin className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-bold text-xl text-gray-900">Rechercher un trajet</h3>
              <p className="text-gray-500 mt-1">Trouvez un covoiturage</p>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-black transition-colors" />
          </div>
        </Link>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-3xl border-2 border-gray-100 p-6">
        <h2 className="font-bold text-xl text-gray-900 mb-6">Activité récente</h2>
        <div className="space-y-4">
          {[
            { type: "booking", text: "Réservation confirmée pour Yaoundé → Douala", time: "Il y a 2h" },
            { type: "rating", text: "Nouvelle évaluation reçue (5 étoiles)", time: "Hier" },
            { type: "trip", text: "Trajet Douala → Bafoussam terminé", time: "Il y a 3 jours" },
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                activity.type === "booking" ? "bg-blue-100" :
                activity.type === "rating" ? "bg-yellow-100" : "bg-green-100"
              }`}>
                {activity.type === "booking" && <Calendar className="w-6 h-6 text-blue-600" />}
                {activity.type === "rating" && <Star className="w-6 h-6 text-yellow-600" />}
                {activity.type === "trip" && <Car className="w-6 h-6 text-green-600" />}
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-medium">{activity.text}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  loading,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: "blue" | "green" | "yellow" | "purple";
  loading: boolean;
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-gray-100 p-5">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{loading ? "…" : value}</p>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    </div>
  );
}
