// cocar-frontend/cocars/src/pages/admin/AdminDashboard.tsx
import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { adminService } from "../../services/adminService";
import {
  Home,
  Users,
  Car,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../contexts/themeContext";

const NAVIGATION = [
  { name: "Tableau de bord", href: "/admin", icon: Home },
  { name: "Utilisateurs", href: "/admin/users", icon: Users },
  { name: "Trajets", href: "/admin/trips", icon: Car },
  { name: "Réservations", href: "/admin/bookings", icon: Calendar },
  { name: "Paramètres", href: "/admin/settings", icon: Settings },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-theme-secondary">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-theme-primary border-r-2 border-theme z-50 transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b-2 border-theme">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-black dark:bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-yellow-400 dark:text-black font-bold">Rs</span>
              </div>
              <div>
                <span className="text-xl font-bold text-theme-primary">Rideshare</span>
                <p className="text-xs text-theme-tertiary">Administration</p>
              </div>
            </Link>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6 text-theme-secondary" />
            </button>
          </div>

          {/* User info */}
          <div className="p-5 border-b-2 border-theme">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="font-bold text-black text-lg">
                  {user?.name?.split(" ").map((n) => n[0]).join("") || "A"}
                </span>
              </div>
              <div>
                <p className="font-bold text-theme-primary">{user?.name || "Admin"}</p>
                <p className="text-sm text-theme-tertiary">Administrateur</p>
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
                      : "text-theme-secondary hover:bg-theme-tertiary"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                  {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="p-4 border-t-2 border-theme space-y-3">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 w-full bg-black dark:bg-yellow-400 text-white dark:text-black py-3.5 rounded-full font-bold hover:opacity-90 transition-all"
            >
              Retour au site
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-theme-primary border-b-2 border-theme">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              className="lg:hidden p-2 hover-theme rounded-xl"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-theme-secondary" />
            </button>

            <div className="flex-1 lg:flex-none">
              <h1 className="text-lg font-bold text-theme-primary lg:hidden">
                {NAVIGATION.find((n) => isActive(n.href))?.name || "Admin"}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 hover-theme rounded-xl transition-colors"
                title={isDark ? "Mode clair" : "Mode sombre"}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-theme-secondary" />
                )}
              </button>

              {/* Notifications */}
              <button className="relative p-2.5 hover-theme rounded-xl transition-colors">
                <Bell className="w-6 h-6 text-theme-secondary" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {location.pathname === "/admin" ? <AdminHome /> : <Outlet />}
        </main>
      </div>
    </div>
  );
}

// Composant Home du dashboard admin
function AdminHome() {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, activityRes] = await Promise.all([
        adminService.getStats(),
        adminService.getRecentActivity(),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (activityRes.success) setActivities(activityRes.data);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = stats ? [
    { label: "Utilisateurs", value: stats.total_users.toLocaleString(), change: `+${stats.new_users_this_month}`, color: "blue" },
    { label: "Trajets", value: stats.total_trips.toLocaleString(), change: `+${stats.new_trips_this_month}`, color: "green" },
    { label: "Réservations", value: stats.total_bookings.toLocaleString(), change: `+${stats.new_bookings_this_month}`, color: "yellow" },
    { label: "Revenus", value: `${(stats.total_revenue / 1000000).toFixed(1)}M FCFA`, change: `+${(stats.revenue_this_month / 1000).toFixed(0)}K`, color: "purple" },
  ] : [];

  const recentActivities = activities.length > 0 ? activities : [
    { type: "user" as const, text: "Chargement...", time: "" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-theme-tertiary">Chargement du tableau de bord...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-3xl p-8 text-black shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          Bienvenue sur l'Administration 👋
        </h1>
        <p className="text-black/80 text-lg">
          Gérez votre plateforme Rideshare depuis ce tableau de bord.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/admin/users"
          className="card-theme rounded-3xl border-2 p-6 hover:border-yellow-400 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-xl text-theme-primary">Gérer les utilisateurs</h3>
              <p className="text-theme-tertiary mt-1">Voir et gérer les comptes</p>
            </div>
            <ChevronRight className="w-6 h-6 text-theme-tertiary group-hover:text-yellow-500 transition-colors" />
          </div>
        </Link>

        <Link
          to="/admin/trips"
          className="card-theme rounded-3xl border-2 p-6 hover:border-yellow-400 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-4">
                <Car className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-bold text-xl text-theme-primary">Gérer les trajets</h3>
              <p className="text-theme-tertiary mt-1">Superviser les trajets</p>
            </div>
            <ChevronRight className="w-6 h-6 text-theme-tertiary group-hover:text-yellow-500 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Recent activity */}
      <div className="card-theme rounded-3xl border-2 p-6">
        <h2 className="font-bold text-xl text-theme-primary mb-6">Activité récente</h2>
        <div className="space-y-4">
          {recentActivities.map((activity, i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-b border-theme last:border-0">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                activity.type === "user" ? "bg-blue-100 dark:bg-blue-900/30" :
                activity.type === "trip" ? "bg-green-100 dark:bg-green-900/30" : 
                "bg-yellow-100 dark:bg-yellow-900/30"
              }`}>
                {activity.type === "user" && <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
                {activity.type === "trip" && <Car className="w-6 h-6 text-green-600 dark:text-green-400" />}
                {activity.type === "booking" && <Calendar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />}
              </div>
              <div className="flex-1">
                <p className="text-theme-primary font-medium">{activity.text}</p>
                <p className="text-sm text-theme-tertiary">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, change, color }: { label: string; value: string; change: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    yellow: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  };

  const IconComponent = {
    blue: Users,
    green: Car,
    yellow: Calendar,
    purple: null,
  }[color];

  return (
    <div className="card-theme rounded-3xl border-2 p-5">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colors[color]}`}>
        {IconComponent ? <IconComponent className="w-6 h-6" /> : <span className="text-xl">💰</span>}
      </div>
      <p className="text-2xl font-bold text-theme-primary">{value}</p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-sm text-theme-tertiary font-medium">{label}</p>
        <span className="text-sm font-semibold text-green-600 dark:text-green-400">{change}</span>
      </div>
    </div>
  );
}
