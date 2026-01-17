// src/pages/dashboard/UserDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, Calendar, Car, Home, LogOut, MapPin, Plus, Star, TrendingUp, User as UserIcon, Wallet } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/userService";
import type { UserStats } from "../../types";
import { DashboardShell, PageHeader, Card, StatCard, type DashboardNavItem } from "../../components/dashboard";
import ActionButton from "../../components/dashboard/ActionButton";

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await userService.getUserStats();
        setStats(res.data);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const nav: DashboardNavItem[] = useMemo(
    () => [
      { label: "Tableau de bord", to: "/user", icon: Home },
      { label: "Mes trajets", to: "/user/my-trips", icon: Car },
      { label: "Réservations", to: "/user/bookings", icon: Calendar },
      { label: "Évaluations", to: "/user/ratings", icon: Star },
      { label: "Profil", to: "/user/profile", icon: UserIcon },
      { label: "Notifications", to: "/user/notifications", icon: Bell },
    ],
    []
  );

  const topRight = (
    <div className="flex items-center gap-2">
      <Link
        to="/user/notifications"
        className="relative p-2.5 rounded-xl hover:bg-theme-secondary border border-theme"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-theme-secondary" />
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
      </Link>
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
      <ActionButton href="/trips/create" className="w-full">
        <Plus className="w-5 h-5" /> Proposer un trajet
      </ActionButton>
      <ActionButton href="/trips" variant="secondary" className="w-full">
        <MapPin className="w-5 h-5" /> Rechercher
      </ActionButton>
    </>
  );

  const isHome = location.pathname === "/user";

  return (
    <DashboardShell
      brandLabel="Rideshare"
      brandHref="/"
      nav={nav}
      topRight={topRight}
      sidebarFooter={sidebarFooter}
    >
      {isHome ? (
        <UserHome stats={stats} loading={loading} firstName={user?.name?.split(" ")[0] ?? "Utilisateur"} />
      ) : (
        <Outlet />
      )}
    </DashboardShell>
  );
}

function UserHome({
  stats,
  loading,
  firstName,
}: {
  stats: UserStats | null;
  loading: boolean;
  firstName: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bonjour, ${firstName}`}
        subtitle={
          stats
            ? `${stats.upcoming_trips ?? 0} trajet(s) à venir • ${stats.total_trips_as_driver ?? 0} en tant que conducteur`
            : "Suivez vos trajets, réservations et évaluations au même endroit."
        }
        right={
          <>
            <ActionButton href="/trips/create">
              <Plus className="w-5 h-5" /> Nouveau trajet
            </ActionButton>
            <ActionButton href="/trips" variant="secondary">
              <MapPin className="w-5 h-5" /> Rechercher
            </ActionButton>
          </>
        }
      />

      <Card className="p-6 overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Résumé</p>
            <h2 className="text-xl font-extrabold text-theme-primary mt-1">Votre activité cette semaine</h2>
            <p className="text-theme-tertiary mt-1">
              Des KPIs clairs, des actions rapides, et une vue sur vos dernières activités.
            </p>
          </div>
          <div className="h-24 w-full lg:w-80 rounded-2xl bg-linear-to-r from-emerald-500 to-emerald-600 shadow-theme-md" />
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Car}
          label="Trajets conducteur"
          value={stats?.total_trips_as_driver ?? 0}
          tone="blue"
          loading={loading}
        />
        <StatCard
          icon={MapPin}
          label="Trajets passager"
          value={stats?.total_trips_as_passenger ?? 0}
          tone="slate"
          loading={loading}
        />
        <StatCard
          icon={TrendingUp}
          label="Gains"
          value={`${(stats?.total_earnings ?? 0).toLocaleString()} F`}
          tone="emerald"
          loading={loading}
        />
        <StatCard
          icon={Wallet}
          label="Dépenses"
          value={`${(stats?.total_spent ?? 0).toLocaleString()} F`}
          tone="purple"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-extrabold text-theme-primary">Actions rapides</h3>
          <p className="text-theme-tertiary text-sm mt-1">Gagnez du temps avec les actions les plus utilisées.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            <QuickAction
              to="/trips/create"
              title="Proposer un trajet"
              description="Publiez un trajet en moins de 2 minutes."
              icon={<Car className="w-5 h-5" />}
            />
            <QuickAction
              to="/user/profile"
              title="Compléter le profil"
              description="Un profil complet inspire confiance."
              icon={<UserIcon className="w-5 h-5" />}
            />
            <QuickAction
              to="/user/bookings"
              title="Suivre mes réservations"
              description="Consultez vos demandes et statuts."
              icon={<Calendar className="w-5 h-5" />}
            />
            <QuickAction
              to="/user/ratings"
              title="Voir mes évaluations"
              description="Suivez votre note et vos avis."
              icon={<Star className="w-5 h-5" />}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-extrabold text-theme-primary">Activité récente</h3>
          <p className="text-theme-tertiary text-sm mt-1">Derniers événements sur votre compte.</p>

          <div className="mt-5 space-y-3">
            {["Réservation confirmée", "Nouvel avis reçu", "Trajet terminé"].map((t, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-theme hover:bg-theme-secondary">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Star className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-theme-primary font-semibold truncate">{t}</p>
                  <p className="text-theme-tertiary text-sm">Il y a {i + 1} jour(s)</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function QuickAction({
  to,
  title,
  description,
  icon,
}: {
  to: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="p-4 rounded-2xl border border-theme hover:border-emerald-400 hover:bg-theme-secondary transition-all hover-lift"
    >
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
