import { useState, useEffect } from 'react'
import { walletApi } from '../../services/api'
import { Wallet as WalletType, WalletTransaction } from '../../types'
import { 
  Wallet as WalletIcon, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Lock, 
  Unlock, 
  RefreshCw, 
  AlertCircle, 
  Gift,
  Percent,
  Loader2,
  TrendingUp,
  TrendingDown,
  Clock,
  Phone,
  Send
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletType | null>(null)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [stats, setStats] = useState<{ earned: number; spent: number; refunded: number; pending: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    provider: 'orange_money',
    phone_number: ''
  })

  useEffect(() => {
    loadWallet()
  }, [])

  const loadWallet = async () => {
    try {
      setIsLoading(true)
      const response = await walletApi.get()
      setWallet(response.data.data.wallet)
      setTransactions(response.data.data.transactions)
      setStats(response.data.data.stats)
    } catch (error) {
      toast.error('Erreur lors du chargement du portefeuille')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const amount = parseInt(withdrawForm.amount)
    if (!amount || amount < 500) {
      toast.error('Le montant minimum est de 500 FCFA')
      return
    }

    if (!withdrawForm.phone_number) {
      toast.error('Veuillez entrer votre numéro de téléphone')
      return
    }

    setIsWithdrawing(true)
    try {
      const response = await walletApi.withdraw({
        amount,
        provider: withdrawForm.provider,
        phone_number: withdrawForm.phone_number
      })
      toast.success(response.data.data.message || 'Retrait effectué avec succès')
      setShowWithdrawModal(false)
      setWithdrawForm({ amount: '', provider: 'orange_money', phone_number: '' })
      loadWallet()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Erreur lors du retrait')
    } finally {
      setIsWithdrawing(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      deposit: <ArrowDownCircle className="w-5 h-5" />,
      withdrawal: <ArrowUpCircle className="w-5 h-5" />,
      escrow_in: <Lock className="w-5 h-5" />,
      escrow_release: <Unlock className="w-5 h-5" />,
      escrow_refund: <RefreshCw className="w-5 h-5" />,
      penalty: <AlertCircle className="w-5 h-5" />,
      commission: <Percent className="w-5 h-5" />,
      bonus: <Gift className="w-5 h-5" />,
    }
    return icons[type] || <WalletIcon className="w-5 h-5" />
  }

  const getTransactionColor = (_type: string, amount: number) => {
    if (amount > 0) {
      return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
    }
    return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  }

  const getTransactionLabel = (type: string) => {
    const labels: Record<string, string> = {
      deposit: 'Dépôt',
      withdrawal: 'Retrait',
      escrow_in: 'Paiement réservation',
      escrow_release: 'Paiement reçu',
      escrow_refund: 'Remboursement',
      penalty: 'Pénalité',
      commission: 'Commission',
      bonus: 'Bonus',
    }
    return labels[type] || type
  }

  const formatAmount = (amount: number) => {
    const absAmount = Math.abs(amount)
    const sign = amount >= 0 ? '+' : '-'
    return `${sign} ${absAmount.toLocaleString('fr-FR')} FCFA`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="animate-fadeIn space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mon Portefeuille</h1>
          <p className="text-gray-600 dark:text-gray-400">Gérez vos revenus et paiements</p>
        </div>
        <button 
          onClick={() => setShowWithdrawModal(true)}
          className="btn-primary"
          disabled={!wallet || wallet.balance < 500}
        >
          <Send className="w-4 h-4" />
          Retirer
        </button>
      </div>

      {/* Cartes de solde */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Solde disponible */}
        <div className="card p-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <WalletIcon className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Disponible</span>
          </div>
          <p className="text-3xl font-bold">
            {wallet?.balance.toLocaleString('fr-FR')} <span className="text-lg">FCFA</span>
          </p>
          <p className="text-sm opacity-80 mt-2">Prêt à être retiré</p>
        </div>

        {/* Solde en attente */}
        <div className="card p-6 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">En attente</span>
          </div>
          <p className="text-3xl font-bold">
            {wallet?.pending_balance.toLocaleString('fr-FR')} <span className="text-lg">FCFA</span>
          </p>
          <p className="text-sm opacity-80 mt-2">En cours de traitement</p>
        </div>

        {/* Total */}
        <div className="card p-6 bg-gradient-to-br from-slate-700 to-slate-800 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Total</span>
          </div>
          <p className="text-3xl font-bold">
            {((wallet?.balance || 0) + (wallet?.pending_balance || 0)).toLocaleString('fr-FR')} <span className="text-lg">FCFA</span>
          </p>
          <p className="text-sm opacity-80 mt-2">Solde total</p>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gagné</p>
                <p className="font-bold text-gray-900 dark:text-white">{stats.earned.toLocaleString('fr-FR')} FCFA</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dépensé</p>
                <p className="font-bold text-gray-900 dark:text-white">{stats.spent.toLocaleString('fr-FR')} FCFA</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Remboursé</p>
                <p className="font-bold text-gray-900 dark:text-white">{stats.refunded.toLocaleString('fr-FR')} FCFA</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">En escrow</p>
                <p className="font-bold text-gray-900 dark:text-white">{stats.pending.toLocaleString('fr-FR')} FCFA</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historique des transactions */}
      <div className="card">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Historique des transactions</h2>
        </div>

        {transactions.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTransactionColor(transaction.type, transaction.amount)}`}>
                  {getTransactionIcon(transaction.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {getTransactionLabel(transaction.type)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {transaction.description || transaction.reference}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${transaction.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatAmount(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(transaction.created_at), 'dd MMM yyyy, HH:mm', { locale: fr })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <WalletIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucune transaction</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Vos transactions apparaîtront ici
            </p>
          </div>
        )}
      </div>

      {/* Modal de retrait */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Retirer de l'argent
            </h3>

            <form onSubmit={handleWithdraw} className="space-y-4">
              {/* Montant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Montant (FCFA)
                </label>
                <input
                  type="number"
                  min="500"
                  max={wallet?.balance || 0}
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  className="input"
                  placeholder="Minimum 500 FCFA"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Solde disponible: {wallet?.balance.toLocaleString('fr-FR')} FCFA
                </p>
              </div>

              {/* Opérateur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Opérateur
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setWithdrawForm({ ...withdrawForm, provider: 'orange_money' })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      withdrawForm.provider === 'orange_money'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-slate-700'
                    }`}
                  >
                    <p className="font-medium text-gray-900 dark:text-white">Orange Money</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawForm({ ...withdrawForm, provider: 'mtn_money' })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      withdrawForm.provider === 'mtn_money'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-gray-200 dark:border-slate-700'
                    }`}
                  >
                    <p className="font-medium text-gray-900 dark:text-white">MTN MoMo</p>
                  </button>
                </div>
              </div>

              {/* Numéro de téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Numéro de téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={withdrawForm.phone_number}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, phone_number: e.target.value })}
                    className="input pl-10"
                    placeholder="Ex: 6XXXXXXXX"
                    required
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="btn-outline flex-1"
                  disabled={isWithdrawing}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={isWithdrawing}
                >
                  {isWithdrawing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Retirer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
