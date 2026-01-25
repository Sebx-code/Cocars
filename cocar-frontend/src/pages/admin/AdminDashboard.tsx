import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../services/api'
import StatCard from '../../components/ui/StatCard'
import { 
  Users, Route, CalendarCheck, DollarSign, TrendingUp, 
  UserCheck, Car, ArrowRight, Activity, Clock
} from 'lucide-react'

interface AdminStats {
  total_users: number
  total_trips: number
  total_bookings: number
  total_revenue: number
  active_users: number
  pending_verifications: number
  new_users_this_month: number
  new_trips_this_month: number
  new_bookings_this_month: number
  revenue_this_month: number
}

interface ActivityItem {
  type: string
  text: string
  time: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getRecentActivity(),
      ])
      const statsData = statsRes.data as { data: AdminStats }
      const activityData = activityRes.data as { data: ActivityItem[] }
      setStats(statsData.data)
      setActivities(activityData.data)
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="w-4 h-4" />
      case 'trip': return <Route className="w-4 h-4" />
      case 'booking': return <CalendarCheck className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user': return 'from-blue-400 to-cyan-500'
      case 'trip': return 'from-emerald-400 to-teal-500'
      case 'booking': return 'from-purple-400 to-pink-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl shadow-argon p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-4" />
              <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Utilisateurs"
          value={stats?.total_users || 0}
          change={`+${stats?.new_users_this_month || 0} ce mois`}
          changeType="positive"
          icon={Users}
          iconColor="blue"
        />
        <StatCard
          title="Total Trajets"
          value={stats?.total_trips || 0}
          change={`+${stats?.new_trips_this_month || 0} ce mois`}
          changeType="positive"
          icon={Route}
          iconColor="green"
        />
        <StatCard
          title="Réservations"
          value={stats?.total_bookings || 0}
          change={`+${stats?.new_bookings_this_month || 0} ce mois`}
          changeType="positive"
          icon={CalendarCheck}
          iconColor="orange"
        />
        <StatCard
          title="Revenus totaux"
          value={`${(stats?.total_revenue || 0).toLocaleString()} FCFA`}
          change={`+${(stats?.revenue_this_month || 0).toLocaleString()} FCFA`}
          changeType="positive"
          icon={DollarSign}
          iconColor="purple"
        />
      </div>

      {/* Second row stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-argon p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Utilisateurs actifs
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {stats?.active_users || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">Derniers 30 jours</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-argon p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Vérifications en attente
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {stats?.pending_verifications || 0}
              </p>
              <p className="text-sm text-orange-500 mt-1">À traiter</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-argon p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Revenus ce mois
              </p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {(stats?.revenue_this_month || 0).toLocaleString()} FCFA
              </p>
              <p className="text-sm text-emerald-500 mt-1">+15% vs mois dernier</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-argon p-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
            Actions rapides
          </h2>
          <div className="space-y-3">
            <Link
              to="/admin/users"
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-white text-sm">Gérer les utilisateurs</p>
                <p className="text-xs text-gray-500">{stats?.total_users} utilisateurs</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>

            <Link
              to="/admin/trips"
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <Route className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-white text-sm">Gérer les trajets</p>
                <p className="text-xs text-gray-500">{stats?.total_trips} trajets</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>

            <Link
              to="/admin/bookings"
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-white text-sm">Gérer les réservations</p>
                <p className="text-xs text-gray-500">{stats?.total_bookings} réservations</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>

            {stats?.pending_verifications && stats.pending_verifications > 0 && (
              <Link
                to="/admin/users?filter=pending"
                className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors border border-orange-200 dark:border-orange-800"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-orange-700 dark:text-orange-300 text-sm">Vérifications en attente</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">{stats.pending_verifications} à traiter</p>
                </div>
                <ArrowRight className="w-4 h-4 text-orange-500" />
              </Link>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-argon p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Activité récente
            </h2>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Temps réel</span>
            </div>
          </div>

          {activities.length > 0 ? (
            <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent pr-2 space-y-3">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getActivityColor(activity.type)} flex items-center justify-center`}>
                    {getActivityIcon(activity.type)}
                    <span className="text-white">{getActivityIcon(activity.type)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-white text-sm">
                      {activity.text}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Aucune activité récente</p>
            </div>
          )}
        </div>
      </div>

      {/* Platform Overview Card */}
      <div className="relative rounded-2xl overflow-hidden shadow-argon-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Plateforme CoCar</h3>
              <p className="text-white/70 max-w-lg">
                Gérez efficacement votre plateforme de covoiturage. Surveillez les utilisateurs, 
                les trajets et les transactions en temps réel.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center mb-2">
                  <Car className="w-8 h-8" />
                </div>
                <p className="text-2xl font-bold">{stats?.total_trips || 0}</p>
                <p className="text-xs text-white/60">Trajets</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center mb-2">
                  <Users className="w-8 h-8" />
                </div>
                <p className="text-2xl font-bold">{stats?.total_users || 0}</p>
                <p className="text-xs text-white/60">Utilisateurs</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center mb-2">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <p className="text-2xl font-bold">{stats?.active_users || 0}</p>
                <p className="text-xs text-white/60">Actifs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
