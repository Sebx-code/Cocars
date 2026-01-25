import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bookingsApi } from '../../services/api'
import { Booking } from '../../types'
import { 
  Calendar, Loader2, Filter, Car, Clock, CheckCircle, 
  Users, CreditCard, MapPin, MessageSquare, ChevronDown, ChevronUp,
  XCircle
} from 'lucide-react'
import DepartureConfirmation from '../../components/booking/DepartureConfirmation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

type FilterType = 'all' | 'pending' | 'confirmed' | 'in_progress' | 'completed'

const filterOptions: { value: FilterType; label: string; icon?: JSX.Element }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending', label: 'En attente', icon: <Clock className="w-4 h-4" /> },
  { value: 'confirmed', label: 'Confirmées', icon: <CheckCircle className="w-4 h-4" /> },
  { value: 'in_progress', label: 'En cours', icon: <Car className="w-4 h-4" /> },
  { value: 'completed', label: 'Terminées', icon: <CheckCircle className="w-4 h-4" /> },
]

export default function DriverBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [expandedBooking, setExpandedBooking] = useState<number | null>(null)

  useEffect(() => { 
    loadBookings() 
  }, [])

  const loadBookings = async () => {
    try {
      setIsLoading(true)
      const response = await bookingsApi.getAll()
      setBookings(response.data.data || [])
    } catch (error) {
      toast.error('Erreur lors du chargement des réservations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookingUpdate = (updatedBooking: Booking) => {
    setBookings(prev => 
      prev.map(b => b.id === updatedBooking.id ? updatedBooking : b)
    )
  }

  const handleConfirm = async (bookingId: number) => {
    try {
      const response = await bookingsApi.confirm(bookingId)
      handleBookingUpdate(response.data.data)
      toast.success('Réservation confirmée')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Erreur lors de la confirmation')
    }
  }

  const handleReject = async (bookingId: number) => {
    const reason = prompt('Raison du refus (optionnel):')
    try {
      const response = await bookingsApi.reject(bookingId, reason || undefined)
      handleBookingUpdate(response.data.data)
      toast.success('Réservation refusée')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Erreur lors du refus')
    }
  }

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true
    return b.status === filter
  })

  // Statistiques rapides
  const stats = {
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    paidAndWaiting: bookings.filter(b => 
      b.status === 'confirmed' && 
      b.payment?.status === 'completed' &&
      b.payment?.escrow_status === 'held'
    ).length,
    needsDepartureConfirmation: bookings.filter(b => 
      b.status === 'confirmed' && 
      b.payment?.status === 'completed' && 
      !b.driver_confirmed_departure
    ).length,
  }

  const getStatusBadge = (booking: Booking) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: 'En attente' },
      confirmed: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Confirmée' },
      in_progress: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', label: 'En cours' },
      completed: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Terminée' },
      cancelled: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Annulée' },
      rejected: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', label: 'Refusée' },
    }
    const config = statusConfig[booking.status] || statusConfig.pending
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getPaymentBadge = (booking: Booking) => {
    if (!booking.payment) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          Non payé
        </span>
      )
    }

    if (booking.payment.escrow_status === 'held') {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center gap-1">
          <CreditCard className="w-3 h-3" />
          Payé (sécurisé)
        </span>
      )
    }

    if (booking.payment.escrow_status === 'released') {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
          Paiement reçu
        </span>
      )
    }

    return null
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Réservations reçues</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez les réservations pour vos trajets
          </p>
        </div>
        <Link to="/create-trip" className="btn-primary">
          <Car className="w-4 h-4" />
          Créer un trajet
        </Link>
      </div>

      {/* Alertes importantes */}
      {(stats.pending > 0 || stats.needsDepartureConfirmation > 0) && (
        <div className="space-y-3">
          {stats.pending > 0 && (
            <div className="card p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-amber-800 dark:text-amber-200">
                    {stats.pending} réservation{stats.pending > 1 ? 's' : ''} en attente de confirmation
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Confirmez ou refusez les demandes de réservation
                  </p>
                </div>
              </div>
            </div>
          )}

          {stats.needsDepartureConfirmation > 0 && (
            <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-blue-800 dark:text-blue-200">
                    {stats.needsDepartureConfirmation} trajet{stats.needsDepartureConfirmation > 1 ? 's' : ''} à confirmer
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Confirmez le départ pour recevoir le paiement
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats rapides */}
      {stats.paidAndWaiting > 0 && (
        <div className="card p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Paiements en attente de libération</p>
              <p className="text-2xl font-bold">{stats.paidAndWaiting} réservation{stats.paidAndWaiting > 1 ? 's' : ''}</p>
            </div>
            <CreditCard className="w-10 h-10 opacity-50" />
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-5 h-5 text-gray-400 shrink-0" />
        {filterOptions.map((option) => {
          const count = option.value === 'all' 
            ? bookings.length 
            : bookings.filter(b => b.status === option.value).length
          
          return (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium 
                transition-all whitespace-nowrap
                ${filter === option.value 
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' 
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }
              `}
            >
              {option.icon}
              {option.label}
              {count > 0 && (
                <span className={`
                  px-2 py-0.5 rounded-full text-xs
                  ${filter === option.value ? 'bg-white/20' : 'bg-gray-200 dark:bg-slate-700'}
                `}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Liste des réservations */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="card overflow-hidden">
              {/* En-tête de la carte */}
              <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(booking)}
                      {getPaymentBadge(booking)}
                    </div>
                    <Link 
                      to={`/trips/${booking.trip.id}`}
                      className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600"
                    >
                      {booking.trip.departure_city} → {booking.trip.arrival_city}
                    </Link>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
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
                  <p className="text-xl font-bold text-primary-600">
                    {booking.total_price.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </div>

              {/* Infos passager */}
              <div className="p-4 bg-gray-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {booking.passenger.name}
                      </p>
                      <p className="text-sm text-gray-500">Passager</p>
                    </div>
                  </div>
                  
                  {booking.status === 'confirmed' && (
                    <div className="flex gap-2">
                      <Link 
                        to={`/messages`}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Envoyer un message"
                      >
                        <MessageSquare className="w-5 h-5 text-gray-500" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Section expandable */}
              <button
                onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}
                className="w-full p-3 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700"
              >
                {expandedBooking === booking.id ? (
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

              {expandedBooking === booking.id && (
                <div className="p-4 border-t border-gray-200 dark:border-slate-700 space-y-4">
                  {/* Message du passager */}
                  {booking.driver_response && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Message:</strong> {booking.driver_response}
                      </p>
                    </div>
                  )}

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
                  {booking.status === 'confirmed' && booking.payment?.status === 'completed' && (
                    <DepartureConfirmation 
                      booking={booking} 
                      userRole="driver" 
                      onUpdate={handleBookingUpdate} 
                    />
                  )}

                  {/* Actions pour réservations en attente */}
                  {booking.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleConfirm(booking.id)}
                        className="btn-primary flex-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accepter
                      </button>
                      <button
                        onClick={() => handleReject(booking.id)}
                        className="btn-outline text-red-600 border-red-200 hover:bg-red-50 flex-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Refuser
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {filter === 'all' ? 'Aucune réservation' : `Aucune réservation ${filterOptions.find(f => f.value === filter)?.label.toLowerCase()}`}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {filter === 'all' 
              ? "Vous n'avez pas encore reçu de réservations pour vos trajets" 
              : "Aucune réservation ne correspond à ce filtre"
            }
          </p>
          {filter === 'all' ? (
            <Link to="/create-trip" className="btn-primary">
              <Car className="w-4 h-4" />
              Créer un trajet
            </Link>
          ) : (
            <button onClick={() => setFilter('all')} className="btn-outline">
              Voir toutes les réservations
            </button>
          )}
        </div>
      )}
    </div>
  )
}
