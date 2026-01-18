// src/pages/admin/AdminDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, Calendar, Car, Home, LogOut, Settings, Users } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import ThemeToggle from "../../components/ThemeToggle";
import { adminService } from "../../services/adminService";
import type { AdminStats, Activity } from "../../services/adminService";
import { DashboardShell, PageHeader, Card, StatCard, type DashboardNavItem } from "../../components/dashboard";
import ActionButton from "../../components/dashboard/ActionButton";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [s, a] = await Promise.all([adminService.getStats(), adminService.getRecentActivity()]);
        if (s.success) setStats(s.data);
        if (a.success) setActivity(a.data);
      } catch {
        setStats(null);
        setActivity([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const nav: DashboardNavItem[] = useMemo(
    () => [
      { label: "Dashboard", to: "/admin", icon: Home },
      { label: "Utilisateurs", to: "/admin/users", icon: Users },
      { label: "Trajets", to: "/admin/trips", icon: Car },
      { label: "Réservations", to: "/admin/bookings", icon: Calendar },
      { label: "Paramètres", to: "/admin/settings", icon: Settings },
    ],
    []
  );

  const topRight = (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <button className="relative p-2.5 rounded-xl hover:bg-theme-secondary border border-theme" aria-label="Notifications">
        <Bell className="w-5 h-5 text-theme-secondary" />
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
      </button>
      <button
        onClick={async () => {
          await logout();
          navigate("/");
        }}
        className="p-2.5 rounded-xl hover:bg-theme-secondary border border-theme"
        aria-label="Déconnexion"
      >
        <LogOut className="w-5 h-5 text-red-600" />
      </button>
    </div>
  );

  const sidebarFooter = (
    <>
      <ActionButton href="/" variant="secondary" className="w-full">
        Retour au site
      </ActionButton>
    </>
  );

  const isHome = location.pathname === "/admin";

  return (
    <DashboardShell
      brandLabel="Rideshare Admin"
      brandHref="/"
      nav={nav}
      topRight={topRight}
      sidebarFooter={sidebarFooter}
    >
      {isHome ? (
        <AdminHome stats={stats} activity={activity} loading={loading} />
      ) : (
        <Outlet />
      )}
    </DashboardShell>
  );
}

function AdminHome({ stats, activity, loading }: { stats: AdminStats | null; activity: Activity[]; loading: boolean }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration"
        subtitle="Pilotez la plateforme: utilisateurs, trajets, réservations, paramètres."
        right={
          <>
            <ActionButton href="/admin/users">Gérer les utilisateurs</ActionButton>
            <ActionButton href="/admin/trips" variant="secondary">
              Gérer les trajets
            </ActionButton>
          </>
        }
      />

      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Vue d'ensemble</p>
            <h2 className="text-xl font-extrabold text-theme-primary mt-1">KPI & Santé de la plateforme</h2>
            <p className="text-theme-tertiary mt-1">Surveillez les tendances et identifiez rapidement les anomalies.</p>
          </div>
          <div className="h-24 w-full lg:w-80 rounded-2xl bg-linear-to-r from-emerald-500 to-emerald-600 shadow-theme-md" />
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Utilisateurs" value={stats?.total_users ?? 0} tone="blue" loading={loading} />
        <StatCard icon={Car} label="Trajets" value={stats?.total_trips ?? 0} tone="slate" loading={loading} />
        <StatCard icon={Calendar} label="Réservations" value={stats?.total_bookings ?? 0} tone="emerald" loading={loading} />
        <StatCard icon={Users} label="Nouveaux ce mois" value={stats?.new_users_this_month ?? 0} tone="purple" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-extrabold text-theme-primary">Raccourcis</h3>
          <p className="text-theme-tertiary text-sm mt-1">Accédez vite aux sections principales.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            <Shortcut to="/admin/users" title="Utilisateurs" description="Voir, filtrer, modérer" icon={<Users className="w-5 h-5" />} />
            <Shortcut to="/admin/trips" title="Trajets" description="Superviser les trajets" icon={<Car className="w-5 h-5" />} />
            <Shortcut to="/admin/bookings" title="Réservations" description="Suivre les demandes" icon={<Calendar className="w-5 h-5" />} />
            <Shortcut to="/admin/settings" title="Paramètres" description="Configurer la plateforme" icon={<Settings className="w-5 h-5" />} />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-extrabold text-theme-primary">Activité récente</h3>
          <p className="text-theme-tertiary text-sm mt-1">Événements système.</p>

          <div className="mt-5 max-h-60 overflow-y-auto space-y-3">
            {(activity.length ? activity : [{ type: "system", text: "Aucune activité", time: "" }]).map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-theme hover:bg-theme-secondary">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-theme-primary font-semibold truncate">{a.text}</p>
                  <p className="text-theme-tertiary text-sm">{a.time || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Shortcut({ to, title, description, icon }: { to: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <Link to={to} className="p-4 rounded-2xl border border-theme hover:border-emerald-400 hover:bg-theme-secondary transition-all hover-lift">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
          {icon}
        </div>
        <div>
          <p className="font-extrabold text-theme-primary">{title}</p>
          <p className="text-sm text-theme-tertiary mt-1">{description}</p>
        </div>
      </div>
    </Link>
  );
}
