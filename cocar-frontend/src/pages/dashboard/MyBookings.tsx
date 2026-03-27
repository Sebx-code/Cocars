import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bookingsApi } from '../../services/api'
import { Booking } from '../../types'
import { Calendar, Loader2, Search, Filter, Car, Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import BookingCard from '../../components/booking/BookingCard'
import toast from 'react-hot-toast'

const PAGE_SIZE = 10

type FilterType = 'all' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

const filterOptions: { value: FilterType; label: string; icon?: JSX.Element }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'pending', label: 'En attente', icon: <Clock className="w-4 h-4" /> },
  { value: 'confirmed', label: 'Confirmées', icon: <CheckCircle className="w-4 h-4" /> },
  { value: 'in_progress', label: 'En cours', icon: <Car className="w-4 h-4" /> },
  { value: 'completed', label: 'Terminées', icon: <CheckCircle className="w-4 h-4" /> },
  { value: 'cancelled', label: 'Annulées', icon: <AlertCircle className="w-4 h-4" /> },
]

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => { 
    loadBookings() 
  }, [])

  const loadBookings = async () => {
    try {
      setIsLoading(true)
      const response = await bookingsApi.getMyBookings()
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

  const handleBookingCancel = () => {
    loadBookings()
  }

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true
    return b.status === filter
  })

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE))
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleFilterChange = (value: FilterType) => {
    setFilter(value)
    setCurrentPage(1)
  }

  // Statistiques rapides
  const stats = {
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    inProgress: bookings.filter(b => b.status === 'in_progress').length,
    needsPayment: bookings.filter(b => b.status === 'confirmed' && !b.payment).length,
    needsConfirmation: bookings.filter(b => 
      b.status === 'confirmed' && 
      b.payment?.status === 'completed' && 
      !b.passenger_confirmed_departure
    ).length,
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes réservations</h1>
          <p className="text-gray-500 dark:text-white/55">
            {bookings.length} réservation{bookings.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <Link to="/search" className="btn-primary">
          <Search className="w-4 h-4" />
          Nouveau trajet
        </Link>
      </div>

      {/* Alertes importantes */}
      {(stats.needsPayment > 0 || stats.needsConfirmation > 0) && (
        <div className="space-y-3">
          {stats.needsPayment > 0 && (
            <div className="card p-4 bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-800">
                    {stats.needsPayment} réservation{stats.needsPayment > 1 ? 's' : ''} en attente de paiement
                  </p>
                  <p className="text-sm text-amber-600">
                    Payez pour sécuriser votre place
                  </p>
                </div>
              </div>
            </div>
          )}

          {stats.needsConfirmation > 0 && (
            <div className="card p-4 bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Car className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-800">
                    {stats.needsConfirmation} trajet{stats.needsConfirmation > 1 ? 's' : ''} à confirmer
                  </p>
                  <p className="text-sm text-blue-600">
                    Confirmez votre départ pour libérer le paiement au conducteur
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filtres */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-5 h-5 text-gray-400 dark:text-white/30 shrink-0" />
        {filterOptions.map((option) => {
          const count = option.value === 'all' 
            ? bookings.length 
            : bookings.filter(b => b.status === option.value).length
          
          return (
            <button
              key={option.value}
              onClick={() => handleFilterChange(option.value)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium 
                transition-all whitespace-nowrap
                ${filter === option.value 
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' 
                  : 'bg-gray-100 dark:bg-white/[0.05] text-gray-600 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/[0.08]'
                }
              `}
            >
              {option.icon}
              {option.label}
              {count > 0 && (
                <span className={`
                  px-2 py-0.5 rounded-full text-xs
                  ${filter === option.value 
                    ? 'bg-gray-200 dark:bg-white/20' 
                    : 'bg-gray-200 dark:bg-white/[0.08]'
                  }
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
        <>
          <div className="space-y-4">
            {paginatedBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                userRole="passenger"
                onUpdate={handleBookingUpdate}
                onCancel={handleBookingCancel}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500 dark:text-white/40">
                Page {currentPage} sur {totalPages} · {filteredBookings.length} réservation{filteredBookings.length > 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn-outline py-2 px-3 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" /> Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-outline py-2 px-3 disabled:opacity-40"
                >
                  Suivant <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto text-white/30 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {filter === 'all' ? 'Aucune réservation' : `Aucune réservation ${filterOptions.find(f => f.value === filter)?.label.toLowerCase()}`}
          </h3>
          <p className="text-gray-500 dark:text-white/55 mb-6">
            {filter === 'all' 
              ? "Vous n'avez pas encore de réservations" 
              : "Aucune réservation ne correspond à ce filtre"
            }
          </p>
          {filter === 'all' ? (
            <Link to="/search" className="btn-primary">
              <Search className="w-4 h-4" />
              Rechercher un trajet
            </Link>
          ) : (
            <button onClick={() => handleFilterChange('all')} className="btn-outline">
              Voir toutes les réservations
            </button>
          )}
        </div>
      )}
    </div>
  )
}





