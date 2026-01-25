import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Booking } from '../../types'
import { bookingsApi, paymentsApi } from '../../services/api'
import DepartureConfirmation from './DepartureConfirmation'
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Phone,
  Shield,
  Lock
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface BookingCardProps {
  booking: Booking
  userRole: 'driver' | 'passenger'
  onUpdate: (updatedBooking: Booking) => void
  onCancel?: () => void
}

export default function BookingCard({ booking, userRole, onUpdate, onCancel }: BookingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    method: 'orange_money',
    phone_number: ''
  })

  const isDriver = userRole === 'driver'
  const isPaid = booking.payment?.status === 'completed'
  const isEscrow = booking.payment?.escrow_status === 'held'

  const getStatusBadge = () => {
    const statusConfig: Record<string, { color: string; label: string; icon: JSX.Element }> = {
      pending: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: 'En attente', icon: <Clock className="w-4 h-4" /> },
      confirmed: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Confirmée', icon: <CheckCircle className="w-4 h-4" /> },
      in_progress: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', label: 'En cours', icon: <Clock className="w-4 h-4" /> },
      completed: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Terminée', icon: <CheckCircle className="w-4 h-4" /> },
      cancelled: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Annulée', icon: <XCircle className="w-4 h-4" /> },
      rejected: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', label: 'Refusée', icon: <XCircle className="w-4 h-4" /> },
    }
    const config = statusConfig[booking.status] || statusConfig.pending
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    )
  }

  const getPaymentBadge = () => {
    if (!booking.payment) return null
    
    const paymentConfig: Record<string, { color: string; label: string; icon: JSX.Element }> = {
      pending: { color: 'bg-amber-100 text-amber-700', label: 'Paiement en attente', icon: <Clock className="w-3 h-3" /> },
      processing: { color: 'bg-blue-100 text-blue-700', label: 'Traitement...', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
      completed: { color: 'bg-emerald-100 text-emerald-700', label: isEscrow ? 'Sécurisé' : 'Payé', icon: isEscrow ? <Lock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" /> },
      failed: { color: 'bg-red-100 text-red-700', label: 'Échec', icon: <XCircle className="w-3 h-3" /> },
      refunded: { color: 'bg-purple-100 text-purple-700', label: 'Remboursé', icon: <AlertCircle className="w-3 h-3" /> },
    }
    const config = paymentConfig[booking.payment.status] || paymentConfig.pending
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    )
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!paymentForm.phone_number) {
      toast.error('Veuillez entrer votre numéro de téléphone')
      return
    }

    setIsLoading(true)
    try {
      const response = await paymentsApi.process({
        booking_id: booking.id,
        payment_method: paymentForm.method,
        phone_number: paymentForm.phone_number
      })
      
      // Mettre à jour la réservation avec le nouveau paiement
      onUpdate({
        ...booking,
        payment: response.data.data
      })
      
      toast.success('Paiement effectué avec succès ! L\'argent est sécurisé.')
      setShowPaymentModal(false)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Erreur lors du paiement')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return

    setIsLoading(true)
    try {
      await bookingsApi.cancel(booking.id)
      toast.success('Réservation annulée')
      onCancel?.()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Erreur lors de l\'annulation')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card overflow-hidden">
      {/* En-tête */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge()}
              {getPaymentBadge()}
            </div>
            <Link 
              to={`/trips/${booking.trip.id}`}
              className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600"
            >
              {booking.trip.departure_city} → {booking.trip.arrival_city}
            </Link>
          </div>
          <p className="text-xl font-bold text-primary-600">
            {booking.total_price.toLocaleString('fr-FR')} FCFA
          </p>
        </div>

        {/* Infos trajet */}
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {format(new Date(booking.trip.departure_date), 'dd MMM yyyy', { locale: fr })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {booking.trip.departure_time}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {booking.seats} place{booking.seats > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Section expandable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-4 h-4" />
            Moins de détails
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            Plus de détails
          </>
        )}
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 space-y-4">
          {/* Infos utilisateur */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {isDriver ? booking.passenger.name : booking.trip.driver.name}
              </p>
              <p className="text-sm text-gray-500">
                {isDriver ? 'Passager' : 'Conducteur'}
              </p>
            </div>
          </div>

          {/* Points de prise en charge */}
          {(booking.pickup_point || booking.dropoff_point) && (
            <div className="space-y-2">
              {booking.pickup_point && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span className="text-gray-600 dark:text-gray-400">Prise en charge:</span>
                  <span className="text-gray-900 dark:text-white">{booking.pickup_point}</span>
                </div>
              )}
              {booking.dropoff_point && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span className="text-gray-600 dark:text-gray-400">Dépose:</span>
                  <span className="text-gray-900 dark:text-white">{booking.dropoff_point}</span>
                </div>
              )}
            </div>
          )}

          {/* Confirmation de départ */}
          {booking.status === 'confirmed' && isPaid && (
            <DepartureConfirmation 
              booking={booking} 
              userRole={userRole} 
              onUpdate={onUpdate} 
            />
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {/* Bouton payer (passager uniquement, si confirmé et non payé) */}
            {!isDriver && booking.status === 'confirmed' && !isPaid && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="btn-primary flex-1"
              >
                <CreditCard className="w-4 h-4" />
                Payer maintenant
              </button>
            )}

            {/* Bouton annuler */}
            {['pending', 'confirmed'].includes(booking.status) && !booking.trip_started && (
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="btn-outline text-red-600 border-red-200 hover:bg-red-50 flex-1"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Annuler
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal de paiement */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Paiement sécurisé
                </h3>
                <p className="text-sm text-gray-500">
                  Votre argent est protégé jusqu'au voyage
                </p>
              </div>
            </div>

            {/* Info escrow */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <Lock className="w-4 h-4 inline mr-1" />
                L'argent sera conservé en sécurité et transféré au conducteur uniquement 
                lorsque vous aurez tous les deux confirmé le départ.
              </p>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              {/* Montant */}
              <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl text-center">
                <p className="text-sm text-gray-500 mb-1">Montant à payer</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {booking.total_price.toLocaleString('fr-FR')} <span className="text-lg">FCFA</span>
                </p>
              </div>

              {/* Opérateur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Choisir l'opérateur
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, method: 'orange_money' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentForm.method === 'orange_money'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-slate-700'
                    }`}
                  >
                    <p className="font-medium text-gray-900 dark:text-white">Orange Money</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, method: 'mtn_money' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentForm.method === 'mtn_money'
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
                    value={paymentForm.phone_number}
                    onChange={(e) => setPaymentForm({ ...paymentForm, phone_number: e.target.value })}
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
                  onClick={() => setShowPaymentModal(false)}
                  className="btn-outline flex-1"
                  disabled={isLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Paiement...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Payer {booking.total_price.toLocaleString('fr-FR')} FCFA
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
