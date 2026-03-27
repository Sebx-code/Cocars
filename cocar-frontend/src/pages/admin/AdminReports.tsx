import { useState } from 'react'
import { BarChart3, TrendingUp, Download, Calendar, Users, Route, CreditCard } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import StatCard from '../../components/ui/StatCard'

type Range = '7j' | '30j' | '3m' | '1an'

const revenueData: Record<Range, { label: string; revenue: number; bookings: number }[]> = {
  '7j': [
    { label: 'Lun', revenue: 320, bookings: 14 },
    { label: 'Mar', revenue: 480, bookings: 21 },
    { label: 'Mer', revenue: 290, bookings: 12 },
    { label: 'Jeu', revenue: 610, bookings: 27 },
    { label: 'Ven', revenue: 750, bookings: 33 },
    { label: 'Sam', revenue: 920, bookings: 41 },
    { label: 'Dim', revenue: 540, bookings: 24 },
  ],
  '30j': [
    { label: 'S1', revenue: 2100, bookings: 92 },
    { label: 'S2', revenue: 3400, bookings: 148 },
    { label: 'S3', revenue: 2800, bookings: 122 },
    { label: 'S4', revenue: 4100, bookings: 178 },
  ],
  '3m': [
    { label: 'Avr', revenue: 9800, bookings: 430 },
    { label: 'Mai', revenue: 12400, bookings: 542 },
    { label: 'Jun', revenue: 14200, bookings: 620 },
  ],
  '1an': [
    { label: 'Jan', revenue: 8200, bookings: 360 },
    { label: 'Fév', revenue: 7400, bookings: 324 },
    { label: 'Mar', revenue: 9100, bookings: 398 },
    { label: 'Avr', revenue: 9800, bookings: 430 },
    { label: 'Mai', revenue: 12400, bookings: 542 },
    { label: 'Jun', revenue: 14200, bookings: 620 },
    { label: 'Juil', revenue: 16800, bookings: 734 },
    { label: 'Aoû', revenue: 15200, bookings: 664 },
    { label: 'Sep', revenue: 11400, bookings: 498 },
    { label: 'Oct', revenue: 10200, bookings: 446 },
    { label: 'Nov', revenue: 8900, bookings: 390 },
    { label: 'Déc', revenue: 13100, bookings: 572 },
  ],
}

const topDrivers = [
  { rank: 1, name: 'Thomas Leclerc', trips: 48, revenue: 1240, rating: 4.9 },
  { rank: 2, name: 'Sophie Renard', trips: 41, revenue: 1085, rating: 4.8 },
  { rank: 3, name: 'Marc Fontaine', trips: 37, revenue: 960, rating: 4.7 },
  { rank: 4, name: 'Julie Mercier', trips: 32, revenue: 845, rating: 4.9 },
  { rank: 5, name: 'Antoine Garnier', trips: 28, revenue: 720, rating: 4.6 },
]

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/[0.07] rounded-xl px-4 py-3 shadow-xl text-sm">
        <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
        <p className="text-emerald-500">Revenus : <span className="font-bold">{payload[0].value} €</span></p>
        {payload[1] && (
          <p className="text-blue-400">Réservations : <span className="font-bold">{payload[1].value}</span></p>
        )}
      </div>
    )
  }
  return null
}

export default function AdminReports() {
  const [range, setRange] = useState<Range>('30j')

  const data = revenueData[range]
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0)
  const totalBookings = data.reduce((s, d) => s + d.bookings, 0)

  const ranges: Range[] = ['7j', '30j', '3m', '1an']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rapports & Analytiques</h1>
          <p className="text-sm text-gray-500 dark:text-white/40 mt-1">Vue d'ensemble des performances</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          Exporter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Revenus (période)"
          value={`${totalRevenue.toLocaleString('fr-FR')} €`}
          change="+18% vs période préc."
          changeType="positive"
          icon={CreditCard}
          iconColor="green"
        />
        <StatCard
          title="Réservations"
          value={totalBookings.toLocaleString('fr-FR')}
          change="+23% vs période préc."
          changeType="positive"
          icon={Calendar}
          iconColor="blue"
        />
        <StatCard
          title="Trajets publiés"
          value="1 284"
          change="+9% vs période préc."
          changeType="positive"
          icon={Route}
          iconColor="purple"
        />
        <StatCard
          title="Utilisateurs actifs"
          value="3 741"
          change="+5% vs période préc."
          changeType="positive"
          icon={Users}
          iconColor="cyan"
        />
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/[0.07] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Évolution des revenus</h2>
              <p className="text-xs text-gray-400 dark:text-white/30">Revenus et réservations sur la période</p>
            </div>
          </div>
          {/* Date range selector */}
          <div className="flex gap-1 bg-gray-100 dark:bg-white/[0.04] rounded-xl p-1">
            {ranges.map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  range === r
                    ? 'bg-white dark:bg-white/[0.08] text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: 'currentColor', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                className="text-gray-400 dark:text-white/30"
              />
              <YAxis
                tick={{ fill: 'currentColor', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                className="text-gray-400 dark:text-white/30"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorRevenue)"
              />
              <Area
                type="monotone"
                dataKey="bookings"
                stroke="#60a5fa"
                strokeWidth={2}
                fill="url(#colorBookings)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex gap-6 mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/40">
            <span className="w-3 h-1 rounded-full bg-emerald-500 inline-block" />
            Revenus (€)
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/40">
            <span className="w-3 h-1 rounded-full bg-blue-400 inline-block" />
            Réservations
          </div>
        </div>
      </div>

      {/* Top Drivers */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-white/[0.07] flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Top Conducteurs</h2>
            <p className="text-xs text-gray-400 dark:text-white/30">Classement sur la période sélectionnée</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.04]">
                {['#', 'Conducteur', 'Trajets', 'Revenus générés', 'Note'].map(col => (
                  <th key={col} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
              {topDrivers.map(driver => (
                <tr key={driver.rank} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      driver.rank === 1 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400' :
                      driver.rank === 2 ? 'bg-gray-100 text-gray-600 dark:bg-white/[0.05] dark:text-white/60' :
                      driver.rank === 3 ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400' :
                      'bg-gray-50 text-gray-500 dark:bg-white/[0.03] dark:text-white/40'
                    }`}>
                      {driver.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                        {driver.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{driver.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-white/70">{driver.trips}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{driver.revenue} €</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 text-sm">★</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{driver.rating}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
