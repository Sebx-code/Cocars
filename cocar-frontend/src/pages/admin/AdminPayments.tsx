import { useState } from 'react'
import { CreditCard, TrendingUp, Clock, RefreshCw, Search, Filter } from 'lucide-react'
import StatCard from '../../components/ui/StatCard'

type PaymentStatus = 'pending' | 'completed' | 'refunded'

interface Payment {
  id: string
  user: string
  trip: string
  amount: number
  status: PaymentStatus
  date: string
}

const mockPayments: Payment[] = [
  { id: 'PAY-001', user: 'Alice Martin', trip: 'Paris → Lyon', amount: 25.00, status: 'completed', date: '2024-06-01' },
  { id: 'PAY-002', user: 'Bruno Lefebvre', trip: 'Lyon → Marseille', amount: 18.50, status: 'pending', date: '2024-06-02' },
  { id: 'PAY-003', user: 'Clara Dupont', trip: 'Bordeaux → Toulouse', amount: 12.00, status: 'completed', date: '2024-06-02' },
  { id: 'PAY-004', user: 'David Moreau', trip: 'Nantes → Paris', amount: 35.00, status: 'refunded', date: '2024-06-03' },
  { id: 'PAY-005', user: 'Emma Bernard', trip: 'Strasbourg → Paris', amount: 42.00, status: 'completed', date: '2024-06-03' },
  { id: 'PAY-006', user: 'François Petit', trip: 'Paris → Lille', amount: 20.00, status: 'pending', date: '2024-06-04' },
  { id: 'PAY-007', user: 'Gabrielle Simon', trip: 'Rennes → Nantes', amount: 8.00, status: 'completed', date: '2024-06-04' },
  { id: 'PAY-008', user: 'Hugo Laurent', trip: 'Nice → Marseille', amount: 15.00, status: 'refunded', date: '2024-06-05' },
  { id: 'PAY-009', user: 'Isabelle Thomas', trip: 'Lyon → Grenoble', amount: 10.50, status: 'completed', date: '2024-06-05' },
  { id: 'PAY-010', user: 'Julien Rousseau', trip: 'Paris → Reims', amount: 22.00, status: 'pending', date: '2024-06-06' },
]

const statusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  pending: { label: 'En attente', className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
  completed: { label: 'Complété', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' },
  refunded: { label: 'Remboursé', className: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' },
}

type FilterType = 'all' | PaymentStatus

export default function AdminPayments() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')

  const filtered = mockPayments.filter(p => {
    const matchesFilter = activeFilter === 'all' || p.status === activeFilter
    const matchesSearch =
      search === '' ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.user.toLowerCase().includes(search.toLowerCase()) ||
      p.trip.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const totalCollected = mockPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)

  const totalPending = mockPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0)

  const totalRefunded = mockPayments
    .filter(p => p.status === 'refunded')
    .reduce((sum, p) => sum + p.amount, 0)

  const commission = totalCollected * 0.10

  const filters: { label: string; value: FilterType }[] = [
    { label: 'Tous', value: 'all' },
    { label: 'En attente', value: 'pending' },
    { label: 'Complété', value: 'completed' },
    { label: 'Remboursé', value: 'refunded' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Paiements</h1>
          <p className="text-sm text-gray-500 dark:text-white/40 mt-1">Suivi et gestion de tous les paiements</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total encaissé"
          value={`${totalCollected.toFixed(2)} €`}
          change="+12% ce mois"
          changeType="positive"
          icon={CreditCard}
          iconColor="green"
        />
        <StatCard
          title="Paiements en attente"
          value={`${totalPending.toFixed(2)} €`}
          change={`${mockPayments.filter(p => p.status === 'pending').length} transactions`}
          changeType="neutral"
          icon={Clock}
          iconColor="orange"
        />
        <StatCard
          title="Remboursements"
          value={`${totalRefunded.toFixed(2)} €`}
          change={`${mockPayments.filter(p => p.status === 'refunded').length} remboursements`}
          changeType="negative"
          icon={RefreshCw}
          iconColor="red"
        />
        <StatCard
          title="Commission (10%)"
          value={`${commission.toFixed(2)} €`}
          change="+8% ce mois"
          changeType="positive"
          icon={TrendingUp}
          iconColor="purple"
        />
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/[0.07] rounded-2xl overflow-hidden">
        {/* Table header controls */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-white/[0.07] flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Filter buttons */}
          <div className="flex gap-2 flex-wrap">
            {filters.map(f => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === f.value
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-white/[0.05] text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/[0.08]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.07] rounded-xl px-3 py-2 w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 dark:text-white/30 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-gray-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 w-full text-sm"
            />
            <Filter className="w-4 h-4 text-gray-400 dark:text-white/30 shrink-0" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/[0.07]">
                {['ID', 'Utilisateur', 'Trajet', 'Montant', 'Statut', 'Date'].map(col => (
                  <th
                    key={col}
                    className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 dark:text-white/30 text-sm">
                    Aucun paiement trouvé
                  </td>
                </tr>
              ) : (
                filtered.map(payment => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono font-medium text-gray-900 dark:text-white">
                      {payment.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-white/70">
                      {payment.user}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-white/70">
                      {payment.trip}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      {payment.amount.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[payment.status].className}`}>
                        {statusConfig[payment.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-white/40">
                      {new Date(payment.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 dark:border-white/[0.07] text-xs text-gray-400 dark:text-white/30">
          {filtered.length} paiement{filtered.length !== 1 ? 's' : ''} affiché{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  )
}
