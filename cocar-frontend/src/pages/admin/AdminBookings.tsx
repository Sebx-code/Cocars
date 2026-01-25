import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'
import { 
  Search, Filter, Check, X, Eye, MapPin, Calendar, 
  ChevronLeft, ChevronRight, CalendarCheck, AlertCircle, DollarSign
} from 'lucide-react'
import toast from 'react-hot-toast'

interface BookingWithDetails {
  id: number
  status: string
  seats_booked: number
  total_price: number
  created_at: string
  passenger: {
    id: number
    name: string
    email: string
  }
  trip: {
    id: number
    departure_city: string
    arrival_city: string
    departure_date: string
    departure_time: string
    driver: {
      id: number
      name: string
    }
  }
}

interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState<'confirm' | 'cancel' | null>(null)

  useEffect(() => {
    loadBookings()
  }, [currentPage, statusFilter])

  const loadBookings = async () => {
    setIsLoading(true)
    try {
      const params: Record<string, string | number> = { page: currentPage }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      
      const response = await adminApi.getBookings(params)
      const data = response.data as unknown as { data: BookingWithDetails[], meta: PaginationMeta }
      setBookings(data.data)
      setMeta(data.meta)
    } catch (error) {
      console.error('Error loading bookings:', error)
      toast.error('Erreur lors du chargement des réservations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadBookings()
  }

  const handleConfirmBooking = async () => {
    if (!selectedBooking) return
    try {
      await adminApi.confirmBooking(selectedBooking.id)
      toast.success('Réservation confirmée')
      setShowActionModal(null)
      setSelectedBooking(null)
      loadBookings()
    } catch (error) {
      toast.error('Erreur lors de la confirmation')
    }
  }

  const handleCancelBooking = async () => {
    if (!selectedBooking) return
    try {
      await adminApi.cancelBooking(selectedBooking.id)
      toast.success('Réservation annulée')
      setShowActionModal(null)
      setSelectedBooking(null)
      loadBookings()
    } catch (error) {
      toast.error('Erreur lors de l\'annulation')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-warning">En attente</span>
      case 'confirmed':
        return <span className="badge badge-success">Confirmé</span>
      case 'cancelled':
        return <span className="badge badge-danger">Annulé</span>
      case 'completed':
        return <span className="badge badge-info">Terminé</span>
      default:
        return <span className="badge">{status}</span>
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Gestion des réservations
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {meta?.total || 0} réservations au total
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-argon p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par trajet ou passager..."
                className="input pl-10"
              />
            </div>
          </form>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="input w-40"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmé</option>
              <option value="cancelled">Annulé</option>
              <option value="completed">Terminé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-argon overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-500">Chargement...</p>
          </div>
        ) : bookings.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trajet</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Passager</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Places</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm text-gray-500">#{booking.id}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white text-sm">
                              {booking.trip?.departure_city} → {booking.trip?.arrival_city}
                            </p>
                            <p className="text-xs text-gray-500">
                              Conducteur: {booking.trip?.driver?.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                            {booking.passenger?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white text-sm">{booking.passenger?.name}</p>
                            <p className="text-xs text-gray-500">{booking.passenger?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {booking.trip?.departure_date}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-800 dark:text-white font-medium">{booking.seats_booked}</span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-emerald-600 flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {booking.total_price?.toLocaleString()} FCFA
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setSelectedBooking(booking); setShowDetailModal(true); }}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => { setSelectedBooking(booking); setShowActionModal('confirm'); }}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                title="Confirmer"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => { setSelectedBooking(booking); setShowActionModal('cancel'); }}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Annuler"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => { setSelectedBooking(booking); setShowActionModal('cancel'); }}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Annuler"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-slate-700">
                <p className="text-sm text-gray-500">
                  Page {meta.current_page} sur {meta.last_page} ({meta.total} résultats)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={meta.current_page === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(meta.last_page, p + 1))}
                    disabled={meta.current_page === meta.last_page}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <CalendarCheck className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Aucune réservation trouvée</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full p-6 animate-fadeIn">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <CalendarCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  Réservation #{selectedBooking.id}
                </h3>
                <p className="text-sm text-gray-500">{getStatusBadge(selectedBooking.status)}</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <p className="text-xs text-gray-500 mb-2">Trajet</p>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {selectedBooking.trip?.departure_city} → {selectedBooking.trip?.arrival_city}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedBooking.trip?.departure_date} à {selectedBooking.trip?.departure_time}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Passager</p>
                  <p className="font-medium text-gray-800 dark:text-white text-sm">{selectedBooking.passenger?.name}</p>
                  <p className="text-xs text-gray-500">{selectedBooking.passenger?.email}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Conducteur</p>
                  <p className="font-medium text-gray-800 dark:text-white text-sm">{selectedBooking.trip?.driver?.name}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Places réservées</p>
                  <p className="font-medium text-gray-800 dark:text-white">{selectedBooking.seats_booked}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Montant total</p>
                  <p className="font-medium text-emerald-600">{selectedBooking.total_price?.toLocaleString()} FCFA</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => { setShowDetailModal(false); setSelectedBooking(null); }}
              className="btn-outline w-full"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                showActionModal === 'confirm' 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                {showActionModal === 'confirm' ? (
                  <Check className="w-6 h-6 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  {showActionModal === 'confirm' ? 'Confirmer la réservation' : 'Annuler la réservation'}
                </h3>
                <p className="text-sm text-gray-500">Réservation #{selectedBooking.id}</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {showActionModal === 'confirm' 
                ? `Êtes-vous sûr de vouloir confirmer cette réservation pour ${selectedBooking.passenger?.name} ?`
                : `Êtes-vous sûr de vouloir annuler cette réservation ? Le passager sera notifié.`
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowActionModal(null); setSelectedBooking(null); }}
                className="btn-outline flex-1"
              >
                Retour
              </button>
              <button
                onClick={showActionModal === 'confirm' ? handleConfirmBooking : handleCancelBooking}
                className={showActionModal === 'confirm' ? 'btn-primary flex-1' : 'btn-danger flex-1'}
              >
                {showActionModal === 'confirm' ? 'Confirmer' : 'Annuler'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
