import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminApi, analyticsApi } from '../../services/api'
import { CompanyFinancialStats, AnalyticsGroup } from '../../types'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
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
  const [financial, setFinancial] = useState<CompanyFinancialStats | null>(null)
  const [group, setGroup] = useState<AnalyticsGroup>('day')
  const [filters, setFilters] = useState<{ payment_method?: string; status?: string; escrow_status?: string }>({})
  const [period, setPeriod] = useState<{ from: string; to: string }>(() => {
    const to = new Date()
    const from = new Date()
    from.setDate(to.getDate() - 30)
    const fmt = (d: Date) => d.toISOString().slice(0, 10)
    return { from: fmt(from), to: fmt(to) }
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadFinancial()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group, period.from, period.to])

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

  const loadFinancial = async () => {
    try {
      const res = await analyticsApi.companyFinancial({
        from: period.from,
        to: period.to,
        group,
        payment_method: filters.payment_method,
        status: filters.status,
        escrow_status: filters.escrow_status,
      })
      setFinancial(res.data.data)
    } catch {
      setFinancial(null)
    }
  }

  const downloadReport = async () => {
    try {
      const res = await analyticsApi.companyFinancialReport({
        from: period.from,
        to: period.to,
        group,
        payment_method: filters.payment_method,
        status: filters.status,
        escrow_status: filters.escrow_status,
      })
      const blob = new Blob([res.data], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport-financier-${period.from}-${period.to}.html`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      console.error('Erreur téléchargement rapport')
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
            <div key={i} className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-white/[0.07] rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-gray-100 dark:bg-gray-100 dark:bg-white/[0.05] rounded w-1/2 mb-4" />
              <div className="h-8 bg-gray-100 dark:bg-gray-100 dark:bg-white/[0.05] rounded w-1/3" />
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
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-400 dark:text-white/40 uppercase tracking-wider mb-1">
                Utilisateurs actifs
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.active_users || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 dark:text-white/55 mt-1">Derniers 30 jours</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-400 dark:text-white/40 uppercase tracking-wider mb-1">
                Vérifications en attente
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.pending_verifications || 0}
              </p>
              <p className="text-sm text-orange-500 mt-1">À traiter</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
              <UserCheck className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-400 dark:text-white/40 uppercase tracking-wider mb-1">
                Revenus ce mois
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(stats?.revenue_this_month || 0).toLocaleString()} FCFA
              </p>
              <p className="text-sm text-emerald-500 mt-1">+15% vs mois dernier</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
              <DollarSign className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Finances entreprise */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-white/[0.07] rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Finances (entreprise)</h2>
            <p className="text-sm text-gray-500 dark:text-gray-500 dark:text-white/55">CA brut, commission, payouts, remboursements</p>
          </div>

          <div className="flex flex-wrap gap-2 items-end">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-500 dark:text-white/55 mb-1">Du</label>
              <input type="date" className="input h-10" value={period.from} onChange={(e) => setPeriod((p) => ({ ...p, from: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-500 dark:text-white/55 mb-1">Au</label>
              <input type="date" className="input h-10" value={period.to} onChange={(e) => setPeriod((p) => ({ ...p, to: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-500 dark:text-white/55 mb-1">Grouper</label>
              <select className="input h-10" value={group} onChange={(e) => setGroup(e.target.value as AnalyticsGroup)}>
                <option value="day">Jour</option>
                <option value="week">Semaine</option>
                <option value="month">Mois</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-500 dark:text-white/55 mb-1">Méthode</label>
              <select className="input h-10" value={filters.payment_method ?? ''} onChange={(e) => setFilters((f) => ({ ...f, payment_method: e.target.value || undefined }))}>
                <option value="">Toutes</option>
                <option value="cash">Cash</option>
                <option value="mobile_money">Mobile money</option>
                <option value="orange_money">Orange money</option>
                <option value="mtn_money">MTN money</option>
                <option value="card">Carte</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-500 dark:text-white/55 mb-1">Statut paiement</label>
              <select className="input h-10" value={filters.status ?? ''} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined }))}>
                <option value="">Tous</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-500 dark:text-white/55 mb-1">Statut escrow</label>
              <select className="input h-10" value={filters.escrow_status ?? ''} onChange={(e) => setFilters((f) => ({ ...f, escrow_status: e.target.value || undefined }))}>
                <option value="">Tous</option>
                <option value="none">None</option>
                <option value="held">Held</option>
                <option value="released">Released</option>
                <option value="refunded">Refunded</option>
                <option value="partial_refund">Partial refund</option>
              </select>
            </div>
            <button className="btn-outline h-10" onClick={downloadReport}>
              Télécharger rapport
            </button>
          </div>
        </div>

        {financial ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-xl p-3 bg-white dark:bg-white/[0.03]">
                <p className="text-xs text-gray-500 dark:text-gray-500 dark:text-white/55">CA brut</p>
                <p className="font-bold text-gray-900 dark:text-white">{financial.totals.gross_revenue.toLocaleString()} FCFA</p>
              </div>
              <div className="rounded-xl p-3 bg-emerald-500/10">
                <p className="text-xs text-emerald-400">Commission</p>
                <p className="font-bold text-emerald-300">{financial.totals.commission_revenue.toLocaleString()} FCFA</p>
              </div>
              <div className="rounded-xl p-3 bg-blue-500/10">
                <p className="text-xs text-blue-400">Payout chauffeurs</p>
                <p className="font-bold text-blue-300">{financial.totals.driver_payouts.toLocaleString()} FCFA</p>
              </div>
              <div className="rounded-xl p-3 bg-red-500/10">
                <p className="text-xs text-red-400">Remboursements</p>
                <p className="font-bold text-red-300">{financial.totals.refunds.toLocaleString()} FCFA</p>
              </div>
              <div className="rounded-xl p-3 bg-amber-500/10">
                <p className="text-xs text-amber-400">Pénalités</p>
                <p className="font-bold text-amber-300">{(financial.totals.penalties ?? 0).toLocaleString()} FCFA</p>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financial.series} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gross" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="commission" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => `${v.toLocaleString('fr-FR')} FCFA`} />
                  <Area type="monotone" dataKey="gross_revenue" stroke="#6366f1" fillOpacity={1} fill="url(#gross)" name="CA brut" />
                  <Area type="monotone" dataKey="commission_revenue" stroke="#10b981" fillOpacity={1} fill="url(#commission)" name="Commission" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* TOP TABLES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-gray-200 dark:border-gray-200 dark:border-white/[0.07] p-4">
                <h3 className="font-semibold text-white mb-3">Top chauffeurs</h3>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 dark:text-gray-500 dark:text-white/55">
                        <th className="py-2">Nom</th>
                        <th className="py-2 text-right">Payout</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(financial.top?.drivers ?? []).map((d) => (
                        <tr key={d.driver_id} className="border-t border-gray-200 dark:border-gray-200 dark:border-white/[0.07]">
                          <td className="py-2">{d.driver_name}</td>
                          <td className="py-2 text-right">{d.driver_payouts.toLocaleString()} FCFA</td>
                        </tr>
                      ))}
                      {(financial.top?.drivers?.length ?? 0) === 0 && (
                        <tr>
                          <td className="py-2 text-gray-500 dark:text-gray-500 dark:text-white/55" colSpan={2}>
                            Aucune donnée
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 dark:border-gray-200 dark:border-white/[0.07] p-4">
                <h3 className="font-semibold text-white mb-3">Top trajets</h3>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 dark:text-gray-500 dark:text-white/55">
                        <th className="py-2">Départ</th>
                        <th className="py-2">Arrivée</th>
                        <th className="py-2 text-right">Réserv.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(financial.top?.routes ?? []).map((r, idx) => (
                        <tr key={`${r.departure_city}-${r.arrival_city}-${idx}`} className="border-t border-gray-200 dark:border-gray-200 dark:border-white/[0.07]">
                          <td className="py-2">{r.departure_city}</td>
                          <td className="py-2">{r.arrival_city}</td>
                          <td className="py-2 text-right">{r.bookings}</td>
                        </tr>
                      ))}
                      {(financial.top?.routes?.length ?? 0) === 0 && (
                        <tr>
                          <td className="py-2 text-gray-500 dark:text-gray-500 dark:text-white/55" colSpan={3}>
                            Aucune donnée
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 dark:border-gray-200 dark:border-white/[0.07] p-4">
                <h3 className="font-semibold text-white mb-3">Top villes</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 dark:text-white/55 mb-2">Départs</p>
                    <div className="space-y-1">
                      {(financial.top?.departure_cities ?? []).slice(0, 5).map((c, idx) => (
                        <div key={`${c.city}-${idx}`} className="flex justify-between text-sm">
                          <span>{c.city}</span>
                          <span className="text-gray-500 dark:text-gray-500 dark:text-white/55">{c.bookings}</span>
                        </div>
                      ))}
                      {(financial.top?.departure_cities?.length ?? 0) === 0 && <div className="text-sm text-gray-500 dark:text-gray-500 dark:text-white/55">Aucune donnée</div>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 dark:text-white/55 mb-2">Arrivées</p>
                    <div className="space-y-1">
                      {(financial.top?.arrival_cities ?? []).slice(0, 5).map((c, idx) => (
                        <div key={`${c.city}-${idx}`} className="flex justify-between text-sm">
                          <span>{c.city}</span>
                          <span className="text-gray-500 dark:text-gray-500 dark:text-white/55">{c.bookings}</span>
                        </div>
                      ))}
                      {(financial.top?.arrival_cities?.length ?? 0) === 0 && <div className="text-sm text-gray-500 dark:text-gray-500 dark:text-white/55">Aucune donnée</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-500 dark:text-white/55">Aucune donnée disponible.</p>
        )}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-white/[0.07] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Actions rapides
          </h2>
          <div className="space-y-3">
            <Link
              to="/admin/users"
              className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-white/[0.07] hover:bg-gray-100 dark:bg-gray-100 dark:bg-white/[0.06] transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-900 dark:text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white text-sm">Gérer les utilisateurs</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 dark:text-white/55">{stats?.total_users} utilisateurs</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-400 dark:text-white/40" />
            </Link>

            <Link
              to="/admin/trips"
              className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-white/[0.07] hover:bg-gray-100 dark:bg-gray-100 dark:bg-white/[0.06] transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <Route className="w-5 h-5 text-gray-900 dark:text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white text-sm">Gérer les trajets</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 dark:text-white/55">{stats?.total_trips} trajets</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-400 dark:text-white/40" />
            </Link>

            <Link
              to="/admin/bookings"
              className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-white/[0.07] hover:bg-gray-100 dark:bg-gray-100 dark:bg-white/[0.06] transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5 text-gray-900 dark:text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white text-sm">Gérer les réservations</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 dark:text-white/55">{stats?.total_bookings} réservations</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-400 dark:text-white/40" />
            </Link>

            {stats?.pending_verifications && stats.pending_verifications > 0 && (
              <Link
                to="/admin/users?filter=pending"
                className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/15 transition-colors border border-orange-500/30"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-gray-900 dark:text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-orange-400 text-sm">Vérifications en attente</p>
                  <p className="text-xs text-orange-300">{stats.pending_verifications} à traiter</p>
                </div>
                <ArrowRight className="w-4 h-4 text-orange-500" />
              </Link>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Activité récente
            </h2>
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-500 dark:text-white/55">
              <Clock className="w-4 h-4" />
              <span>Temps réel</span>
            </div>
          </div>

          {activities.length > 0 ? (
            <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2 space-y-3">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-white/[0.07]"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getActivityColor(activity.type)} flex items-center justify-center`}>
                    {getActivityIcon(activity.type)}
                    <span className="text-gray-900 dark:text-white">{getActivityIcon(activity.type)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">
                      {activity.text}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 dark:text-white/55">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto text-white/20 mb-3" />
              <p className="text-gray-400 dark:text-gray-400 dark:text-white/40">Aucune activité récente</p>
            </div>
          )}
        </div>
      </div>

      {/* Platform Overview Card */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-200 dark:border-white/[0.07]">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative p-8 text-gray-900 dark:text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Plateforme CoCar</h3>
              <p className="text-gray-600 dark:text-gray-600 dark:text-white/70 max-w-lg">
                Gérez efficacement votre plateforme de covoiturage. Surveillez les utilisateurs, 
                les trajets et les transactions en temps réel.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center mb-2">
                  <Car className="w-8 h-8" />
                </div>
                <p className="text-2xl font-bold">{stats?.total_trips || 0}</p>
                <p className="text-xs text-gray-500 dark:text-white/60">Trajets</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center mb-2">
                  <Users className="w-8 h-8" />
                </div>
                <p className="text-2xl font-bold">{stats?.total_users || 0}</p>
                <p className="text-xs text-gray-500 dark:text-white/60">Utilisateurs</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center mb-2">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <p className="text-2xl font-bold">{stats?.active_users || 0}</p>
                <p className="text-xs text-gray-500 dark:text-white/60">Actifs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}





