import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'
import { 
  Search, Filter, Trash2, Eye, MapPin, Calendar, Users,
  ChevronLeft, ChevronRight, Car, AlertCircle, DollarSign
} from 'lucide-react'
import toast from 'react-hot-toast'

interface TripWithDriver {
  id: number
  departure_city: string
  arrival_city: string
  departure_date: string
  departure_time: string
  available_seats: number
  total_seats: number
  price_per_seat: number
  status: string
  description?: string
  driver: {
    id: number
    name: string
    email: string
  }
  bookings_count: number
}

interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export default function AdminTrips() {
  const [trips, setTrips] = useState<TripWithDriver[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTrip, setSelectedTrip] = useState<TripWithDriver | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    loadTrips()
  }, [currentPage, statusFilter])

  const loadTrips = async () => {
    setIsLoading(true)
    try {
      const params: Record<string, string | number> = { page: currentPage }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      
      const response = await adminApi.getTrips(params)
      const data = response.data as unknown as { data: TripWithDriver[], meta: PaginationMeta }
      setTrips(data.data)
      setMeta(data.meta)
    } catch (error) {
      console.error('Error loading trips:', error)
      toast.error('Erreur lors du chargement des trajets')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadTrips()
  }

  const handleDeleteTrip = async () => {
    if (!selectedTrip) return
    try {
      await adminApi.deleteTrip(selectedTrip.id)
      toast.success('Trajet supprimé avec succès')
      setShowDeleteModal(false)
      setSelectedTrip(null)
      loadTrips()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">Actif</span>
      case 'completed':
        return <span className="badge badge-info">Terminé</span>
      case 'cancelled':
        return <span className="badge badge-danger">Annulé</span>
      default:
        return <span className="badge badge-warning">{status}</span>
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Gestion des trajets
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {meta?.total || 0} trajets au total
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
                placeholder="Rechercher par ville de départ ou d'arrivée..."
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
              <option value="active">Actif</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-argon overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-500">Chargement...</p>
          </div>
        ) : trips.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trajet</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Conducteur</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Heure</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Places</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prix</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {trips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                            <Car className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white">
                              {trip.departure_city} → {trip.arrival_city}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {trip.bookings_count || 0} réservation(s)
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white text-sm">{trip.driver?.name}</p>
                          <p className="text-xs text-gray-500">{trip.driver?.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {trip.departure_date} à {trip.departure_time}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-800 dark:text-white">{trip.available_seats}</span>
                          <span className="text-gray-400">/ {trip.total_seats}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-emerald-600 flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {trip.price_per_seat?.toLocaleString()} FCFA
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(trip.status)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setSelectedTrip(trip); setShowDetailModal(true); }}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Voir détails"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => { setSelectedTrip(trip); setShowDeleteModal(true); }}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
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
            <Car className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Aucun trajet trouvé</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedTrip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full p-6 animate-fadeIn">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  {selectedTrip.departure_city} → {selectedTrip.arrival_city}
                </h3>
                <p className="text-sm text-gray-500">Détails du trajet #{selectedTrip.id}</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Conducteur</p>
                  <p className="font-medium text-gray-800 dark:text-white">{selectedTrip.driver?.name}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Prix par place</p>
                  <p className="font-medium text-emerald-600">{selectedTrip.price_per_seat?.toLocaleString()} FCFA</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Date & Heure</p>
                  <p className="font-medium text-gray-800 dark:text-white">{selectedTrip.departure_date} à {selectedTrip.departure_time}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Places</p>
                  <p className="font-medium text-gray-800 dark:text-white">{selectedTrip.available_seats} / {selectedTrip.total_seats} disponibles</p>
                </div>
              </div>
              
              {selectedTrip.description && (
                <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedTrip.description}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => { setShowDetailModal(false); setSelectedTrip(null); }}
              className="btn-outline w-full"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedTrip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Supprimer le trajet</h3>
                <p className="text-sm text-gray-500">Cette action est irréversible</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir supprimer le trajet <strong>{selectedTrip.departure_city} → {selectedTrip.arrival_city}</strong> ? 
              Toutes les réservations associées seront annulées.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedTrip(null); }}
                className="btn-outline flex-1"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteTrip}
                className="btn-danger flex-1"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
